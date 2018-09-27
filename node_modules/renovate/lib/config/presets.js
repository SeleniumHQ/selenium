const is = require('@sindresorhus/is');
const configParser = require('./index');
const massage = require('./massage');
const migration = require('./migration');
const github = require('../datasource/github');
const npm = require('../datasource/npm');

const datasources = {
  github,
  npm,
};

module.exports = {
  resolveConfigPresets,
  replaceArgs,
  parsePreset,
  getPreset,
};

async function resolveConfigPresets(inputConfig, existingPresets = []) {
  logger.trace(
    { config: inputConfig, existingPresets },
    'resolveConfigPresets'
  );
  let config = {};
  // First, merge all the preset configs from left to right
  if (inputConfig.extends && inputConfig.extends.length) {
    for (const preset of inputConfig.extends) {
      // istanbul ignore if
      if (existingPresets.includes(preset)) {
        logger.warn(`Already seen preset ${preset} in ${existingPresets}`);
      } else {
        logger.trace(`Resolving preset "${preset}"`);
        let fetchedPreset;
        try {
          fetchedPreset = await getPreset(preset);
        } catch (err) {
          const error = new Error('config-validation');
          if (err.message === 'dep not found') {
            error.validationError = `Cannot find preset's package (${preset})`;
          } else if (err.message === 'preset renovate-config not found') {
            // istanbul ignore next
            error.validationError = `Preset package is missing a renovate-config entry (${preset})`;
          } else if (err.message === 'preset not found') {
            error.validationError = `Preset name not found within published preset config (${preset})`;
          } else {
            /* istanbul ignore next */ // eslint-disable-next-line
            if (err.message === 'registry-failure') {
              throw err;
            }
          }
          // istanbul ignore if
          if (existingPresets.length) {
            error.validationError +=
              '. Note: this is a *nested* preset so please contact the preset author if you are unable to fix it yourself.';
          }
          logger.info('Throwing preset error');
          throw error;
        }
        const presetConfig = await resolveConfigPresets(
          fetchedPreset,
          existingPresets.concat([preset])
        );
        config = configParser.mergeChildConfig(config, presetConfig);
      }
    }
  }
  logger.trace({ config }, `Post-preset resolve config`);
  // Now assign "regular" config on top
  config = configParser.mergeChildConfig(config, inputConfig);
  delete config.extends;
  logger.trace({ config }, `Post-merge resolve config`);
  for (const [key, val] of Object.entries(config)) {
    const ignoredKeys = ['content', 'onboardingConfig'];
    if (is.array(val)) {
      // Resolve nested objects inside arrays
      config[key] = [];
      for (const element of val) {
        if (is.object(element)) {
          config[key].push(
            await resolveConfigPresets(element, existingPresets)
          );
        } else {
          config[key].push(element);
        }
      }
    } else if (is.object(val) && !ignoredKeys.includes(key)) {
      // Resolve nested objects
      logger.trace(`Resolving object "${key}"`);
      config[key] = await resolveConfigPresets(val, existingPresets);
    }
  }
  logger.trace({ config: inputConfig }, 'Input config');
  logger.trace({ config }, 'Resolved config');
  return config;
}

function replaceArgs(obj, argMapping) {
  if (is.string(obj)) {
    let returnStr = obj;
    for (const [arg, argVal] of Object.entries(argMapping)) {
      const re = new RegExp(`{{${arg}}}`, 'g');
      returnStr = returnStr.replace(re, argVal);
    }
    return returnStr;
  }
  if (is.array(obj)) {
    const returnArray = [];
    for (const item of obj) {
      returnArray.push(replaceArgs(item, argMapping));
    }
    return returnArray;
  }
  if (is.object(obj)) {
    const returnObj = {};
    for (const [key, val] of Object.entries(obj)) {
      returnObj[key] = replaceArgs(val, argMapping);
    }
    return returnObj;
  }
  return obj;
}

function parsePreset(input) {
  let str = input;
  let datasource;
  let packageName;
  let presetName;
  let params;
  if (str.startsWith('github>')) {
    datasource = 'github';
    str = str.substring('github>'.length);
  }
  str = str.replace(/^npm>/, '');
  datasource = datasource || 'npm';
  if (str.includes('(')) {
    params = str
      .slice(str.indexOf('(') + 1, -1)
      .split(',')
      .map(elem => elem.trim());
    str = str.slice(0, str.indexOf('('));
  }
  if (str[0] === ':') {
    // default namespace
    packageName = 'renovate-config-default';
    presetName = str.slice(1);
  } else if (str[0] === '@') {
    // scoped namespace
    [, packageName] = str.match(/(@.*?)(:|$)/);
    str = str.slice(packageName.length);
    if (!packageName.includes('/')) {
      packageName += '/renovate-config';
    }
    if (str === '') {
      presetName = 'default';
    } else {
      presetName = str.slice(1);
    }
  } else {
    // non-scoped namespace
    [, packageName] = str.match(/(.*?)(:|$)/);
    presetName = str.slice(packageName.length + 1);
    if (datasource === 'npm' && !packageName.startsWith('renovate-config-')) {
      packageName = `renovate-config-${packageName}`;
    }
    if (presetName === '') {
      presetName = 'default';
    }
  }
  return { datasource, packageName, presetName, params };
}

async function getPreset(preset) {
  logger.trace(`getPreset(${preset})`);
  const { datasource, packageName, presetName, params } = parsePreset(preset);
  let presetConfig = await datasources[datasource].getPreset(
    packageName,
    presetName
  );
  logger.trace({ presetConfig }, `Found preset ${preset}`);
  if (params) {
    const argMapping = {};
    for (const [index, value] of params.entries()) {
      argMapping[`arg${index}`] = value;
    }
    presetConfig = replaceArgs(presetConfig, argMapping);
  }
  logger.trace({ presetConfig }, `Applied params to preset ${preset}`);
  const presetKeys = Object.keys(presetConfig);
  if (
    presetKeys.length === 2 &&
    presetKeys.includes('description') &&
    presetKeys.includes('extends')
  ) {
    // preset is just a collection of other presets
    delete presetConfig.description;
  }
  const packageListKeys = [
    'description',
    'packageNames',
    'excludePackageNames',
    'packagePatterns',
    'excludePackagePatterns',
    'unstablePattern',
  ];
  if (presetKeys.every(key => packageListKeys.includes(key))) {
    delete presetConfig.description;
  }
  const { migratedConfig } = migration.migrateConfig(presetConfig);
  return massage.massageConfig(migratedConfig);
}
