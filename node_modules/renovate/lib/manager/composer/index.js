const { extractDependencies } = require('./extract');
const { updateDependency } = require('../npm/update');
const { getLockFile } = require('./lock-file');

const language = 'php';

module.exports = {
  extractDependencies,
  getLockFile,
  language,
  updateDependency,
  // TODO: support this
  // supportsLockFileMaintenance: true,
};
