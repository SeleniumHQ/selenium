const { extractDependencies } = require('./extract');
const { updateDependency } = require('./update');

const language = 'python';

module.exports = {
  extractDependencies,
  language,
  updateDependency,
};
