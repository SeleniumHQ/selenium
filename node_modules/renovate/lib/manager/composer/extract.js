const semverComposer = require('../../versioning')('semverComposer');

module.exports = {
  extractDependencies,
};

async function extractDependencies(content, fileName) {
  logger.debug('composer.extractDependencies()');
  let packageJson;
  try {
    packageJson = JSON.parse(content);
  } catch (err) {
    logger.info({ fileName }, 'Invalid JSON');
    return null;
  }
  const deps = [];
  const depTypes = ['require', 'require-dev'];
  for (const depType of depTypes) {
    if (packageJson[depType]) {
      try {
        for (const [depName, version] of Object.entries(packageJson[depType])) {
          const currentValue = version.trim();
          const dep = {
            depType,
            depName,
            currentValue,
            versionScheme: 'semverComposer',
            purl: 'pkg:packagist/' + depName,
          };
          if (!depName.includes('/')) {
            dep.skipReason = 'unsupported';
          }
          if (!semverComposer.isValid(currentValue)) {
            dep.skipReason = 'unsupported-constraint';
          }
          if (currentValue === '*') {
            dep.skipReason = 'any-version';
          }
          deps.push(dep);
        }
      } catch (err) /* istanbul ignore next */ {
        logger.info(
          { fileName, depType, err, message: err.message },
          'Error parsing composer.json'
        );
        return null;
      }
    }
  }
  if (!deps.length) {
    return null;
  }
  let composerLock = false;
  const filePath = fileName.replace(/\.json$/, '.lock');
  if (await platform.getFile(filePath)) {
    logger.debug({ packageFile: fileName }, 'Found composer lock file');
    composerLock = filePath;
  }
  return { deps, composerLock };
}
