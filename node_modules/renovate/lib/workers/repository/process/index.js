const { mergeChildConfig } = require('../../../config');
const { extractAndUpdate } = require('./extract-update');

module.exports = {
  processRepo,
};

async function processRepo(config) {
  logger.debug('processRepo()');
  if (config.baseBranches && config.baseBranches.length) {
    logger.info({ baseBranches: config.baseBranches }, 'baseBranches');
    let res;
    let branches = [];
    let branchList = [];
    for (const baseBranch of config.baseBranches) {
      logger.debug(`baseBranch: ${baseBranch}`);
      const baseBranchConfig = mergeChildConfig(config, { baseBranch });
      if (config.baseBranches.length > 1) {
        baseBranchConfig.branchPrefix += `${baseBranch}-`;
        baseBranchConfig.hasBaseBranches = true;
      }
      platform.setBaseBranch(baseBranch);
      const baseBranchRes = await extractAndUpdate(baseBranchConfig);
      ({ res } = baseBranchRes);
      branches = branches.concat(baseBranchRes.branches);
      branchList = branchList.concat(baseBranchRes.branchList);
    }
    return { res, branches, branchList };
  }
  logger.debug('No baseBranches');
  return extractAndUpdate(config);
}
