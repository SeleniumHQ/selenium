const { extractDependencies } = require('./extract');
const { updateDependency } = require('./update');

module.exports = {
  extractDependencies,
  language: 'js',
  updateDependency,
};
