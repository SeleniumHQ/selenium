const { extractDependencies } = require('./extract');
const { updateDependency } = require('./update');

const language = 'node';

module.exports = {
  extractDependencies,
  language,
  updateDependency,
};
