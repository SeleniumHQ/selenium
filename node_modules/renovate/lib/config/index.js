const is = require('@sindresorhus/is');
const clone = require('fast-clone');

const definitions = require('./definitions');

const defaultsParser = require('./defaults');
const fileParser = require('./file');
const cliParser = require('./cli');
const envParser = require('./env');

const { getPlatformApi } = require('../platform');
const { resolveConfigPresets } = require('./presets');
const { get, getLanguageList, getManagerList } = require('../manager');

const hostRules = require('../util/host-rules');

exports.parseConfigs = parseConfigs;
exports.mergeChildConfig = mergeChildConfig;
exports.filterConfig = filterConfig;
exports.getManagerConfig = getManagerConfig;

function getManagerConfig(config, manager) {
  let managerConfig = config;
  const language = get(manager, 'language');
  if (language) {
    managerConfig = mergeChildConfig(managerConfig, config[language]);
  }
  managerConfig = mergeChildConfig(managerConfig, config[manager]);
  for (const i of getLanguageList().concat(getManagerList())) {
    delete managerConfig[i];
  }
  managerConfig.language = language;
  managerConfig.manager = manager;
  return managerConfig;
}

async function parseConfigs(env, argv) {
  logger.debug('Parsing configs');

  // Get configs
  const defaultConfig = await resolveConfigPresets(defaultsParser.getConfig());
  const fileConfig = await resolveConfigPresets(fileParser.getConfig(env));
  const cliConfig = await resolveConfigPresets(cliParser.getConfig(argv));
  const envConfig = await resolveConfigPresets(envParser.getConfig(env));

  let config = mergeChildConfig(fileConfig, envConfig);
  config = mergeChildConfig(config, cliConfig);

  const combinedConfig = config;

  config = mergeChildConfig(defaultConfig, config);

  if (config.prFooter !== defaultConfig.prFooter) {
    config.customPrFooter = true;
  }

  if (config.forceCli) {
    config = mergeChildConfig(config, { force: { ...cliConfig } });
  }

  // Set log level
  logger.levels('stdout', config.logLevel);

  // Add file logger
  // istanbul ignore if
  if (config.logFile) {
    logger.debug(
      `Enabling ${config.logFileLevel} logging to ${config.logFile}`
    );
    logger.addStream({
      name: 'logfile',
      path: config.logFile,
      level: config.logFileLevel,
    });
  }

  logger.trace({ config: defaultConfig }, 'Default config');
  logger.debug({ config: fileConfig }, 'File config');
  logger.debug({ config: cliConfig }, 'CLI config');
  logger.debug({ config: envConfig }, 'Env config');
  logger.debug({ config: combinedConfig }, 'Combined config');

  // Get global config
  logger.trace({ config }, 'Full config');

  // Check platforms and tokens
  const { platform, endpoint, username, password, token } = config;
  const platformInfo = hostRules.defaults[platform];
  if (!platformInfo) {
    throw new Error(`Unsupported platform: ${config.platform}.`);
  }
  config.hostRules.forEach(hostRules.update);
  delete config.hostRules;
  delete config.token;
  delete config.username;
  delete config.password;

  const credentials = hostRules.find(
    { platform },
    {
      platform,
      endpoint: endpoint || platformInfo.endpoint,
      token,
    }
  );

  if (
    platform === 'bitbucket' &&
    !credentials.token &&
    (username && password)
  ) {
    logger.debug('Found configured username && password');
    const base64 = str => Buffer.from(str, 'binary').toString('base64');
    credentials.token = base64(`${username}:${password}`);
  }

  if (!credentials.token) {
    throw new Error(`You need to supply a ${platformInfo.name} token.`);
  }

  hostRules.update({
    ...credentials,
    default: true,
  });

  if (config.autodiscover) {
    // Autodiscover list of repositories
    const discovered = await getPlatformApi(config.platform).getRepos(
      credentials.token,
      credentials.endpoint
    );
    if (!(discovered && discovered.length)) {
      // Soft fail (no error thrown) if no accessible repositories
      logger.info(
        'The account associated with your token does not have access to any repos'
      );
      return config;
    }
    // istanbul ignore if
    if (config.repositories && config.repositories.length) {
      logger.debug(
        'Checking autodiscovered repositories against configured repositories'
      );
      for (const configuredRepo of config.repositories) {
        const repository = repoName(configuredRepo);
        let found = false;
        for (let i = discovered.length - 1; i > -1; i -= 1) {
          if (repository === repoName(discovered[i])) {
            found = true;
            logger.debug(
              { repository },
              'Using configured repository settings'
            );
            discovered[i] = configuredRepo;
          }
        }
        if (!found) {
          logger.warn(
            { repository },
            'Configured repository is in not in autodiscover list'
          );
        }
      }
    }
    config.repositories = discovered;
  }

  // istanbul ignore next
  function repoName(value) {
    return String(is.string(value) ? value : value.repository).toLowerCase();
  }

  // Print config
  logger.trace({ config }, 'Global config');
  // Remove log file entries
  delete config.logFile;
  delete config.logFileLevel;
  return config;
}

function mergeChildConfig(parent, child) {
  logger.trace({ parent, child }, `mergeChildConfig`);
  if (!child) {
    return parent;
  }
  const parentConfig = clone(parent);
  const childConfig = clone(child);
  const config = { ...parentConfig, ...childConfig };
  for (const option of definitions.getOptions()) {
    if (
      option.mergeable &&
      childConfig[option.name] &&
      parentConfig[option.name]
    ) {
      logger.trace(`mergeable option: ${option.name}`);
      if (option.type === 'list') {
        config[option.name] = (parentConfig[option.name] || []).concat(
          config[option.name] || []
        );
      } else {
        config[option.name] = mergeChildConfig(
          parentConfig[option.name],
          childConfig[option.name]
        );
      }
      logger.trace(
        { result: config[option.name] },
        `Merged config.${option.name}`
      );
    }
  }
  return Object.assign(config, config.force);
}

function filterConfig(inputConfig, targetStage) {
  logger.trace({ config: inputConfig }, `filterConfig('${targetStage}')`);
  const outputConfig = { ...inputConfig };
  const stages = ['global', 'repository', 'package', 'branch', 'pr'];
  const targetIndex = stages.indexOf(targetStage);
  for (const option of definitions.getOptions()) {
    const optionIndex = stages.indexOf(option.stage);
    if (optionIndex !== -1 && optionIndex < targetIndex) {
      delete outputConfig[option.name];
    }
  }
  return outputConfig;
}
