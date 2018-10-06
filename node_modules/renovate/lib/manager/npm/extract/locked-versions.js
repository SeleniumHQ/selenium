const { valid } = require('semver');
const { getNpmLock } = require('./npm');
const { getYarnLock } = require('./yarn');

module.exports = {
  getLockedVersions,
};

async function getLockedVersions(packageFiles) {
  const lockFileCache = {};
  logger.debug('Finding locked versions');
  for (const packageFile of packageFiles) {
    const { yarnLock, npmLock, pnpmShrinkwrap } = packageFile;
    if (yarnLock) {
      logger.trace('Found yarnLock');
      if (!lockFileCache[yarnLock]) {
        logger.debug('Retrieving/parsing ' + yarnLock);
        lockFileCache[yarnLock] = await getYarnLock(yarnLock);
      }
      for (const dep of packageFile.deps) {
        dep.lockedVersion =
          lockFileCache[yarnLock][`${dep.depName}@${dep.currentValue}`];
      }
      // istanbul ignore if
      if (lockFileCache[yarnLock]['@renovate_yarn_integrity']) {
        packageFile.yarnIntegrity = true;
      }
    } else if (npmLock) {
      logger.debug({ npmLock }, 'npm lockfile');
      if (!lockFileCache[npmLock]) {
        logger.debug('Retrieving/parsing ' + npmLock);
        lockFileCache[npmLock] = await getNpmLock(npmLock);
      }
      for (const dep of packageFile.deps) {
        dep.lockedVersion = valid(lockFileCache[npmLock][dep.depName]);
      }
    } else if (pnpmShrinkwrap) {
      logger.info('TODO: implement shrinkwrap.yaml parsing of lockVersion');
    }
  }
}
