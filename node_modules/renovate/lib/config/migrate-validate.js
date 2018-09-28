const is = require('@sindresorhus/is');
const configMigration = require('./migration');
const configMassage = require('./massage');
const configValidation = require('./validation');

module.exports = {
  migrateAndValidate,
};

async function migrateAndValidate(config, input) {
  logger.debug('migrateAndValidate()');
  try {
    const { isMigrated, migratedConfig } = configMigration.migrateConfig(input);
    if (isMigrated) {
      logger.info(
        { oldConfig: input, newConfig: migratedConfig },
        'Config migration necessary'
      );
    } else {
      logger.debug('No config migration necessary');
    }
    const massagedConfig = configMassage.massageConfig(migratedConfig);
    logger.debug({ config: massagedConfig }, 'massaged config');
    const { warnings, errors } = await configValidation.validateConfig(
      massagedConfig
    );
    // istanbul ignore if
    if (!is.empty(warnings)) {
      logger.info({ warnings }, 'Found renovate config warnings');
    }
    if (!is.empty(errors)) {
      logger.info({ errors }, 'Found renovate config errors');
    }
    massagedConfig.errors = (config.errors || []).concat(errors);
    if (!config.repoIsOnboarded) {
      // TODO #556 - enable warnings in real PRs
      massagedConfig.warnings = (config.warnings || []).concat(warnings);
    }
    return massagedConfig;
  } catch (err) /* istanbul ignore next */ {
    logger.debug({ config: input }, 'migrateAndValidate error');
    throw err;
  }
}
