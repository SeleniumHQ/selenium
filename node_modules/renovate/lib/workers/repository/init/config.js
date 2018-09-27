const jsonValidator = require('json-dup-key-validator');

const { mergeChildConfig } = require('../../../config');
const { migrateAndValidate } = require('../../../config/migrate-validate');
const { decryptConfig } = require('../../../config/decrypt');
const presets = require('../../../config/presets');
const npmApi = require('../../../datasource/npm');
const { flattenPackageRules } = require('./flatten');

// Check for config in `renovate.json`
async function mergeRenovateConfig(config) {
  let returnConfig = { ...config };
  // istanbul ignore if
  if (config.mirrorMode) {
    logger.info('Repository is in mirror mode');
    const renovateJson = JSON.parse(
      await platform.getFile(
        'renovate.json',
        config.repoIsOnboarded ? 'renovate-config' : 'renovate/configure'
      )
    );
    logger.debug({ renovateJson }, 'mirrorMode config');
    const migratedConfig = await migrateAndValidate(config, renovateJson);
    const resolvedConfig = await presets.resolveConfigPresets(migratedConfig);
    returnConfig = mergeChildConfig(returnConfig, resolvedConfig);
    returnConfig.renovateJsonPresent = true;
    return returnConfig;
  }
  const fileList = await platform.getFileList();
  let configFile;
  if (fileList.includes('renovate.json')) {
    configFile = 'renovate.json';
  } else if (fileList.includes('.renovaterc')) {
    configFile = '.renovaterc';
  } else if (fileList.includes('.renovaterc.json')) {
    configFile = '.renovaterc.json';
  } else if (fileList.includes('package.json')) {
    try {
      const pJson = JSON.parse(await platform.getFile('package.json'));
      if (pJson.renovate) {
        logger.info('Using package.json for global renovate config');
        configFile = 'package.json';
      }
    } catch (err) {
      // Do nothing
    }
  }
  if (!configFile) {
    logger.debug('No renovate config file found');
    return returnConfig;
  }
  logger.debug(`Found ${configFile} config file`);
  let renovateJson;
  if (configFile === 'package.json') {
    // We already know it parses
    renovateJson = JSON.parse(await platform.getFile('package.json')).renovate;
    logger.info({ config: renovateJson }, 'package.json>renovate config');
  } else {
    const renovateConfig = await platform.getFile(configFile);
    // istanbul ignore if
    if (!renovateConfig) {
      logger.warn('Fetching renovate config returns null');
      throw new Error('registry-failure');
    }
    let allowDuplicateKeys = true;
    let jsonValidationError = jsonValidator.validate(
      renovateConfig,
      allowDuplicateKeys
    );
    if (jsonValidationError) {
      const error = new Error('config-validation');
      error.configFile = configFile;
      error.validationError = 'Invalid JSON (parsing failed)';
      error.validationMessage = jsonValidationError;
      throw error;
    }
    allowDuplicateKeys = false;
    jsonValidationError = jsonValidator.validate(
      renovateConfig,
      allowDuplicateKeys
    );
    if (jsonValidationError) {
      const error = new Error('config-validation');
      error.configFile = configFile;
      error.validationError = 'Duplicate keys in JSON';
      error.validationMessage = JSON.stringify(jsonValidationError);
      throw error;
    }
    try {
      renovateJson = JSON.parse(renovateConfig);
    } catch (err) /* istanbul ignore next */ {
      logger.debug({ renovateConfig }, 'Error parsing renovate config');
      const error = new Error('config-validation');
      error.configFile = configFile;
      error.validationError = 'Invalid JSON (parsing failed)';
      error.validationMessage = 'JSON.parse error: ' + err.message;
      throw error;
    }
    logger.info({ configFile, config: renovateJson }, 'Repository config');
  }
  const migratedConfig = await migrateAndValidate(config, renovateJson);
  if (migratedConfig.errors.length) {
    const error = new Error('config-validation');
    error.configFile = configFile;
    error.validationError =
      'The renovate configuration file contains some invalid settings';
    error.validationMessage = migratedConfig.errors
      .map(e => e.message)
      .join(', ');
    throw error;
  }
  if (migratedConfig.warnings) {
    returnConfig.warnings = returnConfig.warnings.concat(
      migratedConfig.warnings
    );
  }
  delete migratedConfig.errors;
  delete migratedConfig.warnings;
  logger.debug({ config: migratedConfig }, 'renovate.json migrated config');
  // Decrypt before resolving in case we need npm authentication for any presets
  const decryptedConfig = decryptConfig(migratedConfig, config.privateKey);
  // istanbul ignore if
  if (decryptedConfig.npmrc) {
    logger.debug('Found npmrc in decrypted config - setting');
    npmApi.setNpmrc(
      decryptedConfig.npmrc,
      config.global ? config.global.exposeEnv : false
    );
  }
  // Decrypt after resolving in case the preset contains npm authentication instead
  const resolvedConfig = decryptConfig(
    await presets.resolveConfigPresets(decryptedConfig),
    config.privateKey
  );
  delete resolvedConfig.privateKey;
  logger.trace({ config: resolvedConfig }, 'resolved config');
  // istanbul ignore if
  if (resolvedConfig.npmrc) {
    logger.debug(
      'Ignoring any .npmrc files in repository due to configured npmrc'
    );
    npmApi.setNpmrc(
      resolvedConfig.npmrc,
      config.global ? config.global.exposeEnv : false
    );
    resolvedConfig.ignoreNpmrcFile = true;
  }
  returnConfig = mergeChildConfig(returnConfig, resolvedConfig);
  returnConfig.renovateJsonPresent = true;
  returnConfig.packageRules = flattenPackageRules(returnConfig.packageRules);
  return returnConfig;
}

module.exports = {
  mergeRenovateConfig,
};
