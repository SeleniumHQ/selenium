const configDefinitions = require('./definitions');

module.exports = {
  getDefault,
  getConfig,
};

const defaultValues = {
  boolean: true,
  list: [],
  string: null,
  json: null,
};

function getDefault(option) {
  return option.default === undefined
    ? defaultValues[option.type]
    : option.default;
}

function getConfig() {
  const options = configDefinitions.getOptions();
  const config = {};
  options.forEach(option => {
    if (!option.parent) {
      config[option.name] = getDefault(option);
    }
  });
  return config;
}
