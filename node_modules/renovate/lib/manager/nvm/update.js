module.exports = {
  updateDependency,
};

function updateDependency(fileContent, upgrade) {
  logger.debug(`nvm.updateDependency(): ${upgrade.newVersions}`);
  return `${upgrade.newValue}\n`;
}
