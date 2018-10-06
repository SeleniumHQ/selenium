const { extractDependencies } = require('./extract');
const { getPackageUpdates } = require('./package');
const { updateDependency } = require('./update');

const language = 'node';

module.exports = {
  extractDependencies,
  getPackageUpdates,
  language,
  updateDependency,
};
