const is = require('@sindresorhus/is');
const clone = require('fast-clone');

module.exports = {
  getOnboardingConfig,
};

async function getOnboardingConfig(config) {
  const renovateJson = clone(config.onboardingConfig);
  try {
    logger.debug('Checking for greenkeeper config');

    const greenkeeperConfig = JSON.parse(await platform.getFile('package.json'))
      .greenkeeper;
    if (greenkeeperConfig) {
      renovateJson.statusCheckVerify = true;
    }
    const { label, branchName, ignore } = greenkeeperConfig;
    if (label) {
      logger.info({ label }, 'Migrating Greenkeeper label');
      renovateJson.labels = [String(label).replace('greenkeeper', 'renovate')];
    }
    if (branchName) {
      logger.info({ branch: branchName }, 'Migrating Greenkeeper branchName');
      renovateJson.branchName = [
        String(branchName).replace('greenkeeper', 'renovate'),
      ];
    }
    if (!is.empty(ignore)) {
      logger.info({ ignore }, 'Migrating Greenkeeper ignore');
      renovateJson.ignoreDeps = ignore.map(String);
    }
  } catch (err) {
    logger.debug('No greenkeeper config migration');
  }
  logger.debug({ renovateJson }, 'onboarding config');
  return JSON.stringify(renovateJson, null, 2) + '\n';
}
