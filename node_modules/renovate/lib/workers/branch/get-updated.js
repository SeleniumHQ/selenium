const { get } = require('../../manager');

module.exports = {
  getUpdatedPackageFiles,
};

async function getUpdatedPackageFiles(config) {
  logger.debug('manager.getUpdatedPackageFiles()');
  logger.trace({ config });
  const updatedFileContents = {};
  const packageFileManagers = {};
  const packageFileUpdatedDeps = {};

  for (const upgrade of config.upgrades) {
    const { manager, packageFile, depName } = upgrade;
    packageFileManagers[packageFile] = manager;
    packageFileUpdatedDeps[packageFile] =
      packageFileUpdatedDeps[packageFile] || [];
    packageFileUpdatedDeps[packageFile].push(depName);
    if (upgrade.updateType !== 'lockFileMaintenance') {
      const existingContent =
        updatedFileContents[packageFile] ||
        (await platform.getFile(packageFile, config.parentBranch));
      let newContent = existingContent;
      const updateDependency = get(manager, 'updateDependency');
      newContent = await updateDependency(existingContent, upgrade);
      if (!newContent) {
        if (config.parentBranch) {
          logger.info('Rebasing branch after error updating content');
          return getUpdatedPackageFiles({
            ...config,
            parentBranch: undefined,
          });
        }
        throw new Error('Error updating branch content and cannot rebase');
      }
      if (newContent !== existingContent) {
        if (config.parentBranch) {
          // This ensure it's always 1 commit from Renovate
          logger.info('Need to update package file so will rebase first');
          return getUpdatedPackageFiles({
            ...config,
            parentBranch: undefined,
          });
        }
        logger.debug('Updating packageFile content');
        updatedFileContents[packageFile] = newContent;
      }
    }
  }
  const updatedPackageFiles = Object.keys(updatedFileContents).map(name => ({
    name,
    contents: updatedFileContents[name],
  }));
  const updatedLockFiles = [];
  for (const packageFile of updatedPackageFiles) {
    const manager = packageFileManagers[packageFile.name];
    const updatedDeps = packageFileUpdatedDeps[packageFile.name];
    const getLockFile = get(manager, 'getLockFile');
    if (getLockFile) {
      const updatedLockFile = await getLockFile(
        packageFile.name,
        updatedDeps,
        packageFile.contents,
        config
      );
      if (updatedLockFile) {
        updatedLockFiles.push(updatedLockFile);
      }
    }
  }
  return {
    parentBranch: config.parentBranch, // Need to overwrite original config
    updatedPackageFiles,
    updatedLockFiles,
  };
}
