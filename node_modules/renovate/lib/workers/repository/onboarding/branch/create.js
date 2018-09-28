const { getOnboardingConfig } = require('./config');

async function createOnboardingBranch(config) {
  logger.debug('createOnboardingBranch()');
  const contents = await getOnboardingConfig(config);
  logger.info('Creating onboarding branch');
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
    `renovate/configure`,
    [
      {
        name: 'renovate.json',
        contents,
      },
    ],
    commitMessage
  );
}

module.exports = {
  getOnboardingConfig,
  createOnboardingBranch,
};
