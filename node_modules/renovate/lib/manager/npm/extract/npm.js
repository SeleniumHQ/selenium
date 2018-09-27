module.exports = {
  getNpmLock,
};

async function getNpmLock(filePath) {
  const lockRaw = await platform.getFile(filePath);
  try {
    const lockParsed = JSON.parse(lockRaw);
    const lockFile = {};
    for (const [entry, val] of Object.entries(lockParsed.dependencies || {})) {
      logger.trace({ entry, version: val.version });
      lockFile[entry] = val.version;
    }
    return lockFile;
  } catch (err) {
    logger.info(
      { filePath, err, message: err.message },
      'Warning: Exception parsing npm lock file'
    );
    return {};
  }
}
