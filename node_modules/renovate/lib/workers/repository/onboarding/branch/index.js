const { extractAllDependencies } = require('../../extract');
const { createOnboardingBranch } = require('./create');
const { rebaseOnboardingBranch } = require('./rebase');
const { isOnboarded, onboardingPrExists } = require('./check');

async function checkOnboardingBranch(config) {
  logger.debug('checkOnboarding()');
  logger.trace({ config });
  const repoIsOnboarded = await isOnboarded(config);
  if (repoIsOnboarded) {
    logger.debug('Repo is onboarded');
    return { ...config, repoIsOnboarded };
  }
  if (config.isFork && !config.renovateFork) {
    throw new Error('fork');
  }
  logger.info('Repo is not onboarded');
  if (await onboardingPrExists(config)) {
    logger.debug('Onboarding PR already exists');
    await rebaseOnboardingBranch(config);
  } else {
    logger.debug('Onboarding PR does not exist');
    if (Object.entries(await extractAllDependencies(config)).length === 0) {
      throw new Error('no-package-files');
    }
    logger.info('Need to create onboarding PR');
    await createOnboardingBranch(config);
  }
  await platform.setBaseBranch(`renovate/configure`);
  const branchList = [`renovate/configure`];
  return { ...config, repoIsOnboarded, branchList };
}

module.exports = {
  checkOnboardingBranch,
};
