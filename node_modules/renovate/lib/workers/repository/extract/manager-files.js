module.exports = {
  getManagerPackageFiles,
};

const { extractDependencies, postExtract } = require('../../../manager');

const {
  getIncludedFiles,
  filterIgnoredFiles,
  getMatchingFiles,
} = require('./file-match');

async function getManagerPackageFiles(config, managerConfig) {
  const { manager, enabled, includePaths, ignorePaths } = managerConfig;
  logger.debug(`getPackageFiles(${manager})`);
  if (!enabled) {
    logger.debug(`${manager} is disabled`);
    return [];
  }
  if (
    config.enabledManagers.length &&
    !config.enabledManagers.includes(manager)
  ) {
    logger.debug(`${manager} is not in enabledManagers list`);
    return [];
  }
  let fileList = await platform.getFileList();
  fileList = getIncludedFiles(fileList, includePaths);
  fileList = filterIgnoredFiles(fileList, ignorePaths);
  const matchedFiles = getMatchingFiles(
    fileList,
    manager,
    config[manager].fileMatch
  );
  if (matchedFiles.length) {
    logger.debug(
      { matchedFiles },
      `Matched ${matchedFiles.length} file(s) for manager ${manager}`
    );
  }
  const packageFiles = [];
  for (const packageFile of matchedFiles) {
    const content = await platform.getFile(packageFile);
    if (content) {
      const res = await extractDependencies(
        manager,
        content,
        packageFile,
        config
      );
      if (res) {
        packageFiles.push({
          packageFile,
          manager,
          ...res,
        });
      }
    } else {
      logger.info({ packageFile }, 'packageFile has no content');
    }
  }
  await postExtract(manager, packageFiles);
  return packageFiles;
}
