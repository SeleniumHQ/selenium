const { DateTime } = require('luxon');

const schedule = require('./schedule');
const { getUpdatedPackageFiles } = require('./get-updated');
const { getAdditionalFiles } = require('../../manager/npm/post-update');
const { commitFilesToBranch } = require('./commit');
const { getParentBranch } = require('./parent');
const { tryBranchAutomerge } = require('./automerge');
const { setUnpublishable } = require('./status-checks');
const { prAlreadyExisted } = require('./check-existing');
const prWorker = require('../pr');

const { isScheduledNow } = schedule;

module.exports = {
  processBranch,
};

async function processBranch(branchConfig, packageFiles) {
  logger.debug(`processBranch with ${branchConfig.upgrades.length} upgrades`);
  const config = { ...branchConfig };
  const dependencies = config.upgrades
    .map(upgrade => upgrade.depName)
    .filter(v => v) // remove nulls (happens for lock file maintenance)
    .filter((value, i, list) => list.indexOf(value) === i); // remove duplicates
  logger.setMeta({
    repository: config.repository,
    branch: config.branchName,
    dependencies,
  });
  logger.debug('processBranch()');
  logger.trace({ config });
  await platform.setBaseBranch(config.baseBranch);
  const branchExists = await platform.branchExists(config.branchName);
  logger.debug(`branchExists=${branchExists}`);
  if (!branchExists && config.prHourlyLimitReached) {
    logger.info('Reached PR creation limit - skipping branch creation');
    return 'pr-hourly-limit-reached';
  }
  try {
    logger.debug(
      `Branch has ${dependencies ? dependencies.length : 0} upgrade(s)`
    );

    // Check if branch already existed
    const existingPr = await prAlreadyExisted(config);
    if (existingPr) {
      logger.debug(
        { prTitle: config.prTitle },
        'Closed PR already exists. Skipping branch.'
      );
      if (existingPr.state === 'closed') {
        const subject = 'Renovate Ignore Notification';
        let content;
        if (config.updateType === 'major') {
          content = `As this PR has been closed unmerged, Renovate will ignore this upgrade and you will not receive PRs for *any* future ${
            config.newMajor
          }.x releases. However, if you upgrade to ${
            config.newMajor
          }.x manually then Renovate will then reenable updates for minor and patch updates automatically.`;
        } else if (config.updateType === 'digest') {
          content = `As this PR has been closed unmerged, Renovate will ignore this upgrade updateType and you will not receive PRs for *any* future ${
            config.depName
          }:${
            config.currentTag
          } digest updates. Digest updates will resume if you update the specified tag at any time.`;
        } else {
          content = `As this PR has been closed unmerged, Renovate will now ignore this update (${
            config.newValue
          }). You will still receive a PR once a newer version is released, so if you wish to permanently ignore this dependency, please add it to the \`ignoreDeps\` array of your renovate config.`;
        }
        content +=
          '\n\nIf this PR was closed by mistake or you changed your mind, you can simply rename this PR and you will soon get a fresh replacement PR opened.';
        await platform.ensureComment(existingPr.number, subject, content);
        if (branchExists) {
          await platform.deleteBranch(config.branchName);
        }
      } else if (existingPr.state === 'merged') {
        logger.info(
          { pr: existingPr.number },
          'Merged PR is blocking this branch'
        );
      }
      return 'already-existed';
    }
    let branchPr;
    if (branchExists) {
      logger.debug('Checking if PR has been edited');
      branchPr = await platform.getBranchPr(config.branchName);
      if (branchPr) {
        logger.debug('Found existing branch PR');
        if (branchPr.state !== 'open') {
          logger.info(
            'PR has been closed or merged since this run started - aborting'
          );
          throw new Error('repository-changed');
        }
        if (!branchPr.canRebase) {
          const subject = 'PR has been edited';
          const titleRebase =
            branchPr.title && branchPr.title.startsWith('rebase!');
          const labelRebase =
            branchPr.labels && branchPr.labels.includes(config.rebaseLabel);
          if (titleRebase || labelRebase) {
            await platform.ensureCommentRemoval(branchPr.number, subject);
          } else {
            let content =
              ':construction_worker: This PR has received other commits, so Renovate will stop updating it to avoid conflicts or other problems.';
            content += ` If you wish to abandon your changes and have Renovate start over then you can add the label \`${
              config.rebaseLabel
            }\` to this PR and Renovate will reset/recreate it.`;
            await platform.ensureComment(branchPr.number, subject, content);
            return 'pr-edited';
          }
        }
      }
    }

    // Check schedule
    config.isScheduledNow = isScheduledNow(config);
    if (!config.isScheduledNow) {
      if (!branchExists) {
        logger.info('Skipping branch creation as not within schedule');
        return 'not-scheduled';
      }
      if (config.updateNotScheduled === false) {
        logger.debug('Skipping branch update as not within schedule');
        return 'not-scheduled';
      }
      // istanbul ignore if
      if (!branchPr) {
        logger.debug('Skipping PR creation out of schedule');
        return 'not-scheduled';
      }
      logger.debug(
        'Branch + PR exists but is not scheduled -- will update if necessary'
      );
    }

    if (
      config.updateType !== 'lockFileMaintenance' &&
      config.unpublishSafe &&
      config.canBeUnpublished &&
      (config.prCreation === 'not-pending' ||
        config.prCreation === 'status-success')
    ) {
      logger.info(
        'Skipping branch creation due to unpublishSafe + status checks'
      );
      return 'pending';
    }

    Object.assign(config, await getParentBranch(config));
    logger.debug(`Using parentBranch: ${config.parentBranch}`);
    Object.assign(config, await getUpdatedPackageFiles(config));
    if (config.updatedPackageFiles && config.updatedPackageFiles.length) {
      logger.debug(
        `Updated ${config.updatedPackageFiles.length} package files`
      );
    } else {
      logger.debug('No package files need updating');
    }
    const additionalFiles = await getAdditionalFiles(config, packageFiles);
    config.lockFileErrors = additionalFiles.lockFileErrors;
    config.updatedLockFiles = (config.updatedLockFiles || []).concat(
      additionalFiles.updatedLockFiles
    );
    if (config.updatedLockFiles && config.updatedLockFiles.length) {
      logger.debug(
        { updatedLockFiles: config.updatedLockFiles.map(f => f.name) },
        `Updated ${config.updatedLockFiles.length} lock files`
      );
    } else {
      logger.debug('No updated lock files in branch');
    }
    if (config.lockFileErrors && config.lockFileErrors.length) {
      if (config.releaseTimestamp) {
        logger.debug(`Branch timestamp: ` + config.releaseTimestamp);
        const releaseTimestamp = DateTime.fromISO(config.releaseTimestamp);
        if (releaseTimestamp.plus({ days: 1 }) < DateTime.local()) {
          logger.info('PR is older than a day, raise PR with lock file errors');
        } else if (branchExists) {
          logger.info(
            'PR is less than a day old but branchExists so updating anyway'
          );
        } else {
          logger.info('PR is less than a day old - raise error instead of PR');
          throw new Error('lockfile-error');
        }
      } else {
        logger.debug('PR has no releaseTimestamp');
      }
    }

    config.committedFiles = await commitFilesToBranch(config);
    // istanbul ignore if
    if (
      config.updateType === 'lockFileMaintenance' &&
      !config.committedFiles &&
      !config.parentBranch &&
      branchExists
    ) {
      logger.info(
        'Deleting lock file maintenance branch as master lock file no longer needs updating'
      );
      await platform.deleteBranch(config.branchName);
      return 'done';
    }
    if (!(config.committedFiles || branchExists)) {
      return 'no-work';
    }

    // Set branch statuses
    await setUnpublishable(config);

    // Try to automerge branch and finish if successful, but only if branch already existed before this run
    if (branchExists || !config.requiresStatusChecks) {
      const mergeStatus = await tryBranchAutomerge(config);
      logger.debug(`mergeStatus=${mergeStatus}`);
      if (mergeStatus === 'automerged') {
        logger.debug('Branch is automerged - returning');
        return 'automerged';
      }
      if (
        mergeStatus === 'automerge aborted - PR exists' ||
        mergeStatus === 'branch status error' ||
        mergeStatus === 'failed'
      ) {
        logger.info({ mergeStatus }, 'Branch automerge not possible');
        config.forcePr = true;
        config.branchAutomergeFailureMessage = mergeStatus;
      }
    }
  } catch (err) /* istanbul ignore next */ {
    if (err.message === 'rate-limit-exceeded') {
      logger.debug('Passing rate-limit-exceeded error up');
      throw err;
    }
    if (err.message === 'repository-changed') {
      logger.debug('Passing repository-changed error up');
      throw err;
    }
    if (err.message === 'bad-credentials') {
      logger.debug('Passing bad-credentials error up');
      throw err;
    }
    if (err.message === 'lockfile-error') {
      logger.debug('Passing lockfile-error up');
      throw err;
    }
    if (err.message.startsWith('disk-space')) {
      logger.debug('Passing disk-space error up');
      throw err;
    }
    if (
      err.message !== 'registry-failure' &&
      err.message !== 'platform-failure'
    ) {
      logger.error({ err }, `Error updating branch: ${err.message}`);
    }
    // Don't throw here - we don't want to stop the other renovations
    return 'error';
  }
  try {
    logger.debug('Ensuring PR');
    logger.debug(
      `There are ${config.errors.length} errors and ${
        config.warnings.length
      } warnings`
    );
    const pr = await prWorker.ensurePr(config);
    // TODO: ensurePr should check for automerge itself
    if (pr) {
      const topic = ':warning: Lock file problem';
      if (config.lockFileErrors && config.lockFileErrors.length) {
        logger.warn(
          { lockFileErrors: config.lockFileErrors },
          'lockFileErrors'
        );
        let content = `Renovate failed when attempting to generate `;
        content +=
          config.lockFileErrors.length > 1 ? 'lock files' : 'a lock file';
        content +=
          '. The most frequent cause is when you have private modules but have not added configuration for [private module support](https://renovatebot.com/docs/private-modules/) but sometimes it can be just a temporary fault. It is strongly recommended that you do not merge this PR as-is.';
        content +=
          '\n\nRenovate **will not retry** generating a lockfile for this PR unless either (a) the `package.json` in this branch needs updating, (b) the branch becomes conflicted, or (c) ';
        if (config.recreateClosed) {
          content +=
            'you manually delete this PR so that it can be regenerated.';
        } else {
          content +=
            'you rename then delete this PR unmerged, so that it can be regenerated.';
        }
        content += `\n\n**To trigger a manual retry of this PR, rename its title to start with "rebase!".**\n\n`;
        content += '\n\nThe lock file failure details are included below:\n\n';
        config.lockFileErrors.forEach(error => {
          content += `##### ${error.lockFile}\n\n`;
          content += `\`\`\`\n${error.stderr}\n\`\`\`\n\n`;
        });
        await platform.ensureComment(pr.number, topic, content);
        const context = 'renovate/lock-files';
        const description = 'Lock file update failure';
        const state = 'failure';
        const existingState = await platform.getBranchStatusCheck(
          config.branchName,
          context
        );
        // Check if state needs setting
        if (existingState !== state) {
          logger.debug(`Updating status check state to failed`);
          await platform.setBranchStatus(
            config.branchName,
            context,
            description,
            state
          );
        }
      } else {
        if (config.updatedLockFiles && config.updatedLockFiles.length) {
          await platform.ensureCommentRemoval(pr.number, topic);
        }
        const prAutomerged = await prWorker.checkAutoMerge(pr, config);
        if (prAutomerged) {
          return 'automerged';
        }
      }
    }
  } catch (err) /* istanbul ignore next */ {
    if (['rate-limit-exceeded', 'platform-failure'].includes(err.message)) {
      logger.debug('Passing PR error up');
      throw err;
    }
    // Otherwise don't throw here - we don't want to stop the other renovations
    logger.error({ err }, `Error ensuring PR: ${err.message}`);
  }
  if (!branchExists) {
    return 'pr-created';
  }
  return 'done';
}
