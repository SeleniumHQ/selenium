const { extractDependencies, postExtract } = require('./extract');
const { updateDependency } = require('./update');
const { getRangeStrategy } = require('./range');

module.exports = {
  extractDependencies,
  language: 'js',
  postExtract,
  getRangeStrategy,
  updateDependency,
  supportsLockFileMaintenance: true,
};
