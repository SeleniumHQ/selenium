const { initPlatform } = require('../../../platform');
const npmApi = require('../../../datasource/npm');

function assignPlatform(config) {
  logger.debug('assignPlatform');
  initPlatform(config.platform);
  return config;
}

async function getPlatformConfig(config) {
  const platformConfig = await platform.initRepo(config);
  return {
    ...config,
    ...platformConfig,
  };
}

async function initApis(input) {
  let config = { ...input };
  config = await assignPlatform(config);
  config = await getPlatformConfig(config);
  npmApi.resetMemCache();
  npmApi.setNpmrc(
    config.npmrc,
    config.global ? config.global.exposeEnv : false
  );
  return config;
}

module.exports = {
  initApis,
};
