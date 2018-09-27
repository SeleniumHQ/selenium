module.exports = {
  getNewFrom,
  updateDependency,
};

function getNewFrom(upgrade) {
  const { dockerRegistry, depName, newValue, tagSuffix, newDigest } = upgrade;
  let newFrom = dockerRegistry ? `${dockerRegistry}/` : '';
  newFrom += `${depName}`;
  if (newValue) {
    newFrom += `:${newValue}`;
    if (tagSuffix) {
      newFrom += `-${tagSuffix}`;
    }
  }
  if (newDigest) {
    newFrom += `@${newDigest}`;
  }
  return newFrom;
}

function updateDependency(fileContent, upgrade) {
  try {
    const { lineNumber, fromSuffix } = upgrade;
    let { fromPrefix } = upgrade;
    const newFrom = getNewFrom(upgrade);
    logger.debug(`docker.updateDependency(): ${newFrom}`);
    const lines = fileContent.split('\n');
    const lineToChange = lines[lineNumber];
    const imageLine = new RegExp(/^(FROM |COPY --from=)/i);
    if (!lineToChange.match(imageLine)) {
      logger.debug('No image line found');
      return null;
    }
    if (!fromPrefix.endsWith('=')) {
      fromPrefix += ' ';
    }
    const newLine = `${fromPrefix}${newFrom} ${fromSuffix}`.trim();
    if (newLine === lineToChange) {
      logger.debug('No changes necessary');
      return fileContent;
    }
    lines[lineNumber] = newLine;
    return lines.join('\n');
  } catch (err) {
    logger.info({ err }, 'Error setting new Dockerfile value');
    return null;
  }
}
