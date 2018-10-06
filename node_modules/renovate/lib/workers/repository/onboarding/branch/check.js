const findFile = async fileName => {
  logger.debug(`findFile(${fileName})`);
  const fileList = await platform.getFileList();
  return fileList.includes(fileName);
};

const renovateJsonExists = async () =>
  (await findFile('renovate.json')) ||
  (await findFile('.renovaterc')) ||
  findFile('.renovaterc.json');

const packageJsonRenovateExists = async () => {
  try {
    const pJson = JSON.parse(await platform.getFile('package.json'));
    if (pJson.renovate) {
      return true;
    }
  } catch (err) {
    // Do nothing
  }
  return false;
};

const closedPrExists = () =>
  platform.findPr(`renovate/configure`, 'Configure Renovate', '!open');

const isOnboarded = async config => {
  logger.debug('isOnboarded()');
  // Repo is onboarded if admin is bypassing onboarding
  if (config.onboarding === false) {
    return true;
  }
  if (await renovateJsonExists()) {
    logger.debug('renovate.json exists');
    return true;
  }
  logger.debug('renovate.json not found');
  if (await packageJsonRenovateExists()) {
    logger.debug('package.json contains renovate config');
    return true;
  }
  const pr = await closedPrExists(config);
  if (!pr) {
    logger.debug('Found no closed onboarding PR');
    return false;
  }
  logger.debug('Found closed onboarding PR');
  if (!config.requireConfig) {
    logger.debug('Config not mandatory so repo is considered onboarded');
    return true;
  }
  const mergedPrExists = (await platform.getPrList()).some(
    p => p.state === 'merged' && p.branchName.startsWith(config.branchPrefix)
  );
  if (mergedPrExists) {
    logger.info(
      'Repo is not onboarded but at least one merged PR exists - treat as onboarded'
    );
    return true;
  }
  logger.info('Repo is not onboarded and no merged PRs exist');
  // ensure PR comment
  await platform.ensureComment(
    pr.number,
    'Renovate is disabled',
    'Renovate is disabled due to lack of config. If you wish to reenable it, you can either (a) commit a Renovate config to your base branch, or (b) rename this closed PR to trigger a replacement onboarding PR.'
  );
  throw new Error('disabled');
};

const onboardingPrExists = () => platform.getBranchPr(`renovate/configure`);

module.exports = {
  isOnboarded,
  onboardingPrExists,
};
