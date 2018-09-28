const branchWorker = require('../../branch');
const { getPrsRemaining } = require('./limits');

module.exports = {
  writeUpdates,
};

async function writeUpdates(config, packageFiles, allBranches) {
  let branches = allBranches;
  logger.info(
    { branchList: branches.map(b => b.branchName).sort() },
    `Processing ${branches.length} branch${branches.length !== 1 ? 'es' : ''}`
  );
  if (!config.mirrorMode) {
    branches = branches.filter(branchConfig => {
      if (branchConfig.blockedByPin) {
        logger.debug(
          `Branch ${branchConfig.branchName} is blocked by a Pin PR`
        );
        return false;
      }
      return true;
    });
  }
  let prsRemaining = await getPrsRemaining(config, branches);
  for (const branch of branches) {
    const res = await branchWorker.processBranch(
      {
        ...branch,
        prHourlyLimitReached: prsRemaining <= 0,
      },
      packageFiles
    );
    if (res === 'pr-closed' || res === 'automerged') {
      // Stop procesing other branches because base branch has been changed
      return res;
    }
    prsRemaining -= res === 'pr-created' ? 1 : 0;
  }
  return 'done';
}
