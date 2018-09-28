const is = require('@sindresorhus/is');
const deepcopy = require('deepcopy');
const options = require('./definitions').getOptions();

let allowedStrings;

module.exports = {
  massageConfig,
};

// Returns a massaged config
function massageConfig(config) {
  if (!allowedStrings) {
    allowedStrings = [];
    options.forEach(option => {
      if (option.allowString) {
        allowedStrings.push(option.name);
      }
    });
  }
  const massagedConfig = deepcopy(config);
  for (const [key, val] of Object.entries(config)) {
    if (allowedStrings.includes(key) && is.string(val)) {
      massagedConfig[key] = [val];
    } else if (key === 'npmToken' && val && val.length < 30) {
      massagedConfig.npmrc = `//registry.npmjs.org/:_authToken=${val}\n`;
      delete massagedConfig.npmToken;
    } else if (is.array(val)) {
      massagedConfig[key] = [];
      val.forEach(item => {
        if (is.object(item)) {
          massagedConfig[key].push(massageConfig(item));
        } else {
          massagedConfig[key].push(item);
        }
      });
    } else if (is.object(val)) {
      massagedConfig[key] = massageConfig(val);
    }
  }
  return massagedConfig;
}
