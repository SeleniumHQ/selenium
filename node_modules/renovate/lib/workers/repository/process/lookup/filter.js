const versioning = require('../../../../versioning');

module.exports = {
  filterVersions,
};

function filterVersions(
  config,
  fromVersion,
  latestVersion,
  versions,
  releases
) {
  const {
    versionScheme,
    ignoreUnstable,
    ignoreDeprecated,
    respectLatest,
    allowedVersions,
  } = config;
  const {
    getMajor,
    getMinor,
    getPatch,
    isGreaterThan,
    isStable,
    isValid,
    matches,
  } = versioning(versionScheme);
  if (!fromVersion) {
    return [];
  }

  // Leave only versions greater than current
  let filteredVersions = versions.filter(version =>
    isGreaterThan(version, fromVersion)
  );

  // Don't upgrade from non-deprecated to deprecated
  const fromRelease = releases.find(release => release.version === fromVersion);
  if (ignoreDeprecated && fromRelease && !fromRelease.isDeprecated) {
    filteredVersions = filteredVersions.filter(version => {
      const versionRelease = releases.find(
        release => release.version === version
      );
      if (versionRelease.isDeprecated) {
        logger.debug(
          `Skipping ${config.depName}@${version} because it is deprecated`
        );
        return false;
      }
      return true;
    });
  }

  if (allowedVersions) {
    if (isValid(allowedVersions)) {
      filteredVersions = filteredVersions.filter(version =>
        matches(version, allowedVersions)
      );
    } else {
      logger.warn(`Invalid allowedVersions: "${allowedVersions}"`);
    }
  }

  // Return all versions if we aren't ignore unstable. Also ignore latest
  if (config.followTag || ignoreUnstable === false) {
    return filteredVersions;
  }

  // if current is unstable then allow unstable in the current major only
  if (!isStable(fromVersion)) {
    // Allow unstable only in current major
    return filteredVersions.filter(
      version =>
        isStable(version) ||
        (getMajor(version) === getMajor(fromVersion) &&
          getMinor(version) === getMinor(fromVersion) &&
          getPatch(version) === getPatch(fromVersion))
    );
  }

  // Normal case: remove all unstable
  filteredVersions = filteredVersions.filter(isStable);

  // Filter the latest

  // No filtering if no latest
  // istanbul ignore if
  if (!latestVersion) {
    return filteredVersions;
  }
  // No filtering if not respecting latest
  if (respectLatest === false) {
    return filteredVersions;
  }
  // No filtering if fromVersion is already past latest
  if (isGreaterThan(fromVersion, latestVersion)) {
    return filteredVersions;
  }
  return filteredVersions.filter(
    version => !isGreaterThan(version, latestVersion)
  );
}
