module.exports = {
  tryBranchAutomerge,
};

async function tryBranchAutomerge(config) {
  logger.debug('Checking if we can automerge branch');
  if (!(config.automerge && config.automergeType === 'branch')) {
    return 'no automerge';
  }
  const existingPr = await platform.getBranchPr(config.branchName);
  if (existingPr) {
    return 'automerge aborted - PR exists';
  }
  const branchStatus = await platform.getBranchStatus(
    config.branchName,
    config.requiredStatusChecks
  );
  if (branchStatus === 'success') {
    logger.debug(`Automerging branch`);
    try {
      await platform.mergeBranch(config.branchName);
      logger.info({ branch: config.branchName }, 'Branch automerged');
      return 'automerged'; // Branch no longer exists
    } catch (err) {
      logger.info({ err }, `Failed to automerge branch`);
      return 'failed';
    }
  } else if (['failure', 'error'].includes(branchStatus)) {
    return 'branch status error';
  } else {
    logger.debug(`Branch status is "${branchStatus}" - skipping automerge`);
  }
  return 'no automerge';
}
