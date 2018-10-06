const moment = require('moment');

module.exports = {
  getPrHourlyRemaining,
  getConcurrentPrsRemaining,
  getPrsRemaining,
};

async function getPrHourlyRemaining(config) {
  if (config.prHourlyLimit) {
    const prList = await platform.getPrList();
    const currentHourStart = moment({
      hour: moment().hour(),
    });
    try {
      const soFarThisHour = prList.filter(
        pr =>
          pr.branchName !== 'renovate/configure' &&
          moment(pr.createdAt).isAfter(currentHourStart)
      ).length;
      const prsRemaining = config.prHourlyLimit - soFarThisHour;
      logger.debug(`PR hourly limit remaining: ${prsRemaining}`);
      return prsRemaining;
    } catch (err) {
      logger.error('Error checking PRs created per hour');
    }
  }
  return 99;
}

async function getConcurrentPrsRemaining(config, branches) {
  if (config.prConcurrentLimit) {
    logger.debug(`Enforcing prConcurrentLimit (${config.prConcurrentLimit})`);
    let currentlyOpen = 0;
    for (const branch of branches) {
      if (await platform.branchExists(branch.branchName)) {
        currentlyOpen += 1;
      }
    }
    logger.debug(`${currentlyOpen} PRs are currently open`);
    const concurrentRemaining = config.prConcurrentLimit - currentlyOpen;
    logger.debug(`PR concurrent limit remaining: ${concurrentRemaining}`);
    return concurrentRemaining;
  }
  return 99;
}

async function getPrsRemaining(config, branches) {
  const hourlyRemaining = await module.exports.getPrHourlyRemaining(config);
  const concurrentRemaining = await module.exports.getConcurrentPrsRemaining(
    config,
    branches
  );
  return hourlyRemaining < concurrentRemaining
    ? hourlyRemaining
    : concurrentRemaining;
}
