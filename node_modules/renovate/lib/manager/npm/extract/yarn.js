const yarnLockParser = require('@yarnpkg/lockfile');

module.exports = {
  getYarnLock,
};

async function getYarnLock(filePath) {
  const yarnLockRaw = await platform.getFile(filePath);
  try {
    const yarnLockParsed = yarnLockParser.parse(yarnLockRaw);
    // istanbul ignore if
    if (yarnLockParsed.type !== 'success') {
      logger.info(
        { filePath, parseType: yarnLockParsed.type },
        'Error parsing yarn.lock - not success'
      );
      return {};
    }
    const lockFile = {};
    for (const [entry, val] of Object.entries(yarnLockParsed.object)) {
      logger.trace({ entry, version: val.version });
      lockFile[entry] = val.version;
      // istanbul ignore if
      if (val.integrity) {
        lockFile['@renovate_yarn_integrity'] = true;
      }
    }
    return lockFile;
  } catch (err) {
    logger.info(
      { filePath, err, message: err.message },
      'Warning: Exception parsing yarn.lock'
    );
    return {};
  }
}
