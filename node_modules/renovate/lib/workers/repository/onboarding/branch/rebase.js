const { getOnboardingConfig } = require('./config');

async function rebaseOnboardingBranch(config) {
  logger.debug('Checking if onboarding branch needs rebasing');
  const onboardingBranch = `renovate/configure`;
  const pr = await platform.getBranchPr(onboardingBranch);
  if (!pr.canRebase) {
    logger.info('Onboarding branch has been edited and cannot be rebased');
    return;
  }
  const existingContents = await platform.getFile(
    'renovate.json',
    onboardingBranch
  );
  const contents = await getOnboardingConfig(config);
  if (contents === existingContents && !pr.isStale) {
    logger.info('Onboarding branch is up to date');
    return;
  }
  logger.info('Rebasing onboarding branch');
  let commitMessage;
  // istanbul ignore if
  if (config.semanticCommits) {
    commitMessage = config.semanticCommitType;
    if (config.semanticCommitScope) {
      commitMessage += `(${config.semanticCommitScope})`;
    }
    commitMessage += ': ';
    commitMessage += 'add renovate.json';
  } else {
    commitMessage = 'Add renovate.json';
  }
  await platform.commitFilesToBranch(
    onboardingBranch,
    [
      {
        name: 'renovate.json',
        contents: existingContents || contents,
      },
    ],
    commitMessage
  );
}

module.exports = {
  rebaseOnboardingBranch,
};
