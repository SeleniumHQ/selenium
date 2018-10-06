const { extractDependencies } = require('./extract');
const { updateDependency } = require('./update');

const language = 'docker';

module.exports = {
  extractDependencies,
  language,
  updateDependency,
};
