const minimatch = require('minimatch');

const versioning = require('../versioning');
const { mergeChildConfig } = require('../config');

module.exports = {
  applyPackageRules,
};

function applyPackageRules(inputConfig) {
  let config = { ...inputConfig };
  const {
    versionScheme,
    packageFile,
    depType,
    depName,
    currentValue,
    fromVersion,
    updateType,
    isBump,
  } = config;
  const packageRules = config.packageRules || [];
  logger.trace(
    { dependency: depName, packageRules },
    `Checking against ${packageRules.length} packageRules`
  );
  packageRules.forEach(packageRule => {
    let {
      paths,
      depTypeList,
      packageNames,
      packagePatterns,
      excludePackageNames,
      excludePackagePatterns,
      matchCurrentVersion,
      updateTypes,
    } = packageRule;
    // Setting empty arrays simplifies our logic later
    paths = paths || [];
    depTypeList = depTypeList || [];
    packageNames = packageNames || [];
    packagePatterns = packagePatterns || [];
    excludePackageNames = excludePackageNames || [];
    excludePackagePatterns = excludePackagePatterns || [];
    matchCurrentVersion = matchCurrentVersion || null;
    updateTypes = updateTypes || [];
    let positiveMatch = false;
    let negativeMatch = false;
    // Massage a positive patterns patch if an exclude one is present
    if (
      (excludePackageNames.length || excludePackagePatterns.length) &&
      !(packageNames.length || packagePatterns.length)
    ) {
      packagePatterns = ['.*'];
    }
    if (paths.length) {
      const isMatch = paths.some(
        rulePath =>
          packageFile.includes(rulePath) || minimatch(packageFile, rulePath)
      );
      positiveMatch = positiveMatch || isMatch;
      negativeMatch = negativeMatch || !isMatch;
    }
    if (depTypeList.length) {
      const isMatch = depTypeList.includes(depType);
      positiveMatch = positiveMatch || isMatch;
      negativeMatch = negativeMatch || !isMatch;
    }
    if (updateTypes.length) {
      const isMatch =
        updateTypes.includes(updateType) ||
        (isBump && updateTypes.includes('bump'));
      positiveMatch = positiveMatch || isMatch;
      negativeMatch = negativeMatch || !isMatch;
    }
    if (packageNames.length || packagePatterns.length) {
      let isMatch = packageNames.includes(depName);
      // name match is "or" so we check patterns if we didn't match names
      if (!isMatch) {
        for (const packagePattern of packagePatterns) {
          const packageRegex = new RegExp(
            packagePattern === '^*$' || packagePattern === '*'
              ? '.*'
              : packagePattern
          );
          if (depName && depName.match(packageRegex)) {
            logger.trace(`${depName} matches against ${packageRegex}`);
            isMatch = true;
          }
        }
      }
      positiveMatch = positiveMatch || isMatch;
      negativeMatch = negativeMatch || !isMatch;
    }
    if (excludePackageNames.length) {
      const isMatch = excludePackageNames.includes(depName);
      negativeMatch = negativeMatch || isMatch;
      positiveMatch = positiveMatch || !isMatch;
    }
    if (excludePackagePatterns.length) {
      let isMatch = false;
      for (const pattern of excludePackagePatterns) {
        const packageRegex = new RegExp(
          pattern === '^*$' || pattern === '*' ? '.*' : pattern
        );
        if (depName && depName.match(packageRegex)) {
          logger.trace(`${depName} matches against ${packageRegex}`);
          isMatch = true;
        }
      }
      negativeMatch = negativeMatch || isMatch;
      positiveMatch = positiveMatch || !isMatch;
    }
    if (matchCurrentVersion) {
      const { matches, isVersion } = versioning(versionScheme);
      const compareVersion = isVersion(currentValue)
        ? currentValue // it's a version so we can match against it
        : fromVersion; // need to match against this fromVersion, if available
      if (compareVersion) {
        const isMatch = matches(compareVersion, matchCurrentVersion);
        positiveMatch = positiveMatch || isMatch;
        negativeMatch = negativeMatch || !isMatch;
      } else {
        negativeMatch = true;
      }
    }
    // This rule is considered matched if there was at least one positive match and no negative matches
    if (positiveMatch && !negativeMatch) {
      // Package rule config overrides any existing config
      config = mergeChildConfig(config, packageRule);
      delete config.packageNames;
      delete config.packagePatterns;
      delete config.excludePackageNames;
      delete config.excludePackagePatterns;
      delete config.depTypeList;
      delete config.matchCurrentVersion;
    }
  });
  return config;
}
