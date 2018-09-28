const versioning = require('../../../../versioning');

module.exports = {
  getRollbackUpdate,
};

function getRollbackUpdate(config, versions) {
  const { packageFile, versionScheme, depName, currentValue } = config;
  const { getMajor, isLessThanRange, getNewValue, sortVersions } = versioning(
    versionScheme
  );
  // istanbul ignore if
  if (!isLessThanRange) {
    logger.info(
      { versionScheme },
      'Current version scheme does not support isLessThanRange()'
    );
    return null;
  }
  const lessThanVersions = versions.filter(version =>
    isLessThanRange(version, currentValue)
  );
  // istanbul ignore if
  if (!lessThanVersions.length) {
    logger.info(
      { packageFile, depName, currentValue },
      'Missing version has nothing to roll back to'
    );
    return null;
  }
  logger.info(
    { packageFile, depName, currentValue },
    `Current version not found - rolling back`
  );
  logger.debug(
    { dependency: depName, versions },
    'Versions found before rolling back'
  );
  lessThanVersions.sort(sortVersions);
  const toVersion = lessThanVersions.pop();
  let fromVersion;
  const newValue = getNewValue(currentValue, 'replace', fromVersion, toVersion);
  return {
    updateType: 'rollback',
    branchName:
      '{{{branchPrefix}}}rollback-{{{depNameSanitized}}}-{{{newMajor}}}.x',
    commitMessageAction: 'Roll back',
    isRollback: true,
    newValue,
    newMajor: getMajor(toVersion),
    semanticCommitType: 'fix',
  };
}
