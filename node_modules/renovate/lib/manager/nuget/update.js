module.exports = {
  updateDependency,
};

function updateDependency(fileContent, upgrade) {
  try {
    logger.debug(`nuget.updateDependency(): ${upgrade.newFrom}`);
    const lines = fileContent.split('\n');
    const lineToChange = lines[upgrade.lineNumber];
    const regex = /(Version\s*=\s*")([^"]+)/;
    const newLine = lineToChange.replace(regex, `$1${upgrade.newVersion}`);
    if (newLine === lineToChange) {
      logger.debug('No changes necessary');
      return fileContent;
    }
    lines[upgrade.lineNumber] = newLine;
    return lines.join('\n');
  } catch (err) {
    logger.info({ err }, 'Error setting new Dockerfile value');
    return null;
  }
}
