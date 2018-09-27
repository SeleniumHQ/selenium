const { getNewFrom } = require('../dockerfile/update');

module.exports = {
  updateDependency,
};

function updateDependency(currentFileContent, upgrade) {
  try {
    const newFrom = getNewFrom(upgrade);
    const lines = currentFileContent.split('\n');
    const lineToChange = lines[upgrade.lineNumber];
    if (upgrade.depType === 'image') {
      const imageLine = new RegExp(/^(\s*image:\s*'?"?)[^\s'"]+('?"?\s*)$/);
      if (!lineToChange.match(imageLine)) {
        logger.debug('No image line found');
        return null;
      }
      const newLine = lineToChange.replace(imageLine, `$1${newFrom}$2`);
      if (newLine === lineToChange) {
        logger.debug('No changes necessary');
        return currentFileContent;
      }
      lines[upgrade.lineNumber] = newLine;
      return lines.join('\n');
    }
    const serviceLine = new RegExp(/^(\s*-\s*'?"?)[^\s'"]+('?"?\s*)$/);
    if (!lineToChange.match(serviceLine)) {
      logger.debug('No image line found');
      return null;
    }
    const newLine = lineToChange.replace(serviceLine, `$1${newFrom}$2`);
    if (newLine === lineToChange) {
      logger.debug('No changes necessary');
      return currentFileContent;
    }
    lines[upgrade.lineNumber] = newLine;
    return lines.join('\n');
  } catch (err) {
    logger.info({ err }, 'Error setting new Dockerfile value');
    return null;
  }
}
