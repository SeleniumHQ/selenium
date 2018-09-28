module.exports = {
  pruneStaleBranches,
};

async function pruneStaleBranches(config, branchList) {
  logger.debug('Removing any stale branches');
  logger.trace({ config }, `pruneStaleBranches`);
  logger.debug(`config.repoIsOnboarded=${config.repoIsOnboarded}`);
  if (!branchList) {
    logger.debug('No branchList');
    return;
  }
  logger.debug({ branchList }, 'branchList');
  let renovateBranches = await platform.getAllRenovateBranches(
    config.branchPrefix
  );
  if (!(renovateBranches && renovateBranches.length)) {
    logger.debug('No renovate branches found');
    return;
  }
  logger.debug({ branchList, renovateBranches });
  const lockFileBranch = `${config.branchPrefix}lock-file-maintenance`;
  if (renovateBranches.includes(lockFileBranch)) {
    logger.debug('Checking lock file branch');
    const pr = await platform.getBranchPr(lockFileBranch);
    if (pr && pr.isConflicted) {
      logger.info('Deleting lock file maintenance branch as it is conflicted');
      await platform.deleteBranch(lockFileBranch);
    }
    renovateBranches = renovateBranches.filter(
      branch => branch !== lockFileBranch
    );
  }
  const remainingBranches = renovateBranches.filter(
    branch => !branchList.includes(branch)
  );
  logger.debug(`remainingBranches=${remainingBranches}`);
  if (remainingBranches.length === 0) {
    logger.debug('No branches to clean up');
    return;
  }
  for (const branchName of remainingBranches) {
    try {
      const pr = await platform.findPr(branchName, null, 'open');
      if (pr) {
        await platform.updatePr(pr.number, `${pr.title} - autoclosed`);
        logger.info({ prNo: pr.number, prTitle: pr.title }, 'PR autoclosed');
      }
      const closePr = true;
      await platform.deleteBranch(branchName, closePr);
      logger.info({ branch: branchName }, `Deleting orphan branch`);
    } catch (err) /* istanbul ignore next */ {
      logger.warn({ err, branch: branchName }, 'Error pruning branch');
    }
  }
}
