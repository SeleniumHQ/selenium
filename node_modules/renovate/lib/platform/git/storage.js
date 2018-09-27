const fs = require('fs-extra');
const { join } = require('path');
const path = require('path');
const Git = require('simple-git/promise');
const convertHrtime = require('convert-hrtime');

class Storage {
  constructor() {
    let config = {};
    let git = null;
    let cwd = null;

    Object.assign(this, {
      initRepo,
      cleanRepo,
      getRepoStatus,
      setBaseBranch,
      branchExists,
      commitFilesToBranch,
      createBranch,
      deleteBranch,
      getAllRenovateBranches,
      getBranchCommit,
      getBranchLastCommitTime,
      getCommitMessages,
      getFile,
      getFileList,
      isBranchStale,
      mergeBranch,
    });

    // istanbul ignore next
    async function resetToBranch(branchName) {
      await git.raw(['reset', '--hard']);
      await git.checkout(branchName);
      await git.raw(['reset', '--hard', 'origin/' + branchName]);
    }

    // istanbul ignore next
    async function cleanLocalBranches() {
      const existingBranches = (await git.raw(['branch']))
        .split('\n')
        .map(branch => branch.trim())
        .filter(branch => branch.length)
        .filter(branch => !branch.startsWith('* '));
      logger.debug({ existingBranches });
      for (const branchName of existingBranches) {
        await deleteLocalBranch(branchName);
      }
    }

    async function initRepo(args) {
      cleanRepo();
      config = { ...args };
      cwd = config.localDir;
      logger.info('Initialising git repository into ' + cwd);
      const gitHead = path.join(cwd, '.git/HEAD');
      let clone = true;
      async function determineBaseBranch() {
        // see https://stackoverflow.com/a/44750379/1438522
        config.baseBranch =
          config.baseBranch ||
          (await git.raw(['symbolic-ref', 'refs/remotes/origin/HEAD']))
            .replace('refs/remotes/origin/', '')
            .trim();
      }
      // istanbul ignore if
      if (process.env.NODE_ENV !== 'test' && (await fs.exists(gitHead))) {
        try {
          git = Git(cwd).silent(true);
          await git.raw(['remote', 'set-url', 'origin', config.url]);
          const fetchStart = process.hrtime();
          await git.fetch(config.url, ['--depth=2', '--no-single-branch']);
          await determineBaseBranch();
          await resetToBranch(config.baseBranch);
          await cleanLocalBranches();
          await git.raw(['remote', 'prune', 'origin']);
          const fetchSeconds =
            Math.round(
              1 + 10 * convertHrtime(process.hrtime(fetchStart)).seconds
            ) / 10;
          logger.info({ fetchSeconds }, 'git fetch completed');
          clone = false;
        } catch (err) {
          logger.error({ err }, 'git fetch error');
        }
      }
      if (clone) {
        await fs.emptyDir(cwd);
        git = Git(cwd).silent(true);
        const cloneStart = process.hrtime();
        await git.clone(config.url, '.', ['--depth=2', '--no-single-branch']);
        const cloneSeconds =
          Math.round(
            1 + 10 * convertHrtime(process.hrtime(cloneStart)).seconds
          ) / 10;
        logger.info({ cloneSeconds }, 'git clone completed');
      }

      if (config.gitAuthor) {
        await git.raw(['config', 'user.name', config.gitAuthor.name]);
        await git.raw(['config', 'user.email', config.gitAuthor.address]);
        // not supported yet
        await git.raw(['config', 'commit.gpgsign', 'false']);
      }

      await determineBaseBranch();
    }

    // istanbul ignore next
    function getRepoStatus() {
      return git.status();
    }

    async function createBranch(branchName, sha) {
      await git.reset('hard');
      await git.checkout(['-B', branchName, sha]);
      await git.push(['origin', branchName, '--force']);
    }

    // Return the commit SHA for a branch
    async function getBranchCommit(branchName) {
      const res = await git.revparse(['origin/' + branchName]);
      return res.trim();
    }

    async function getCommitMessages() {
      logger.debug('getCommitMessages');
      const res = await git.log({
        n: 10,
        format: { message: '%s' },
      });
      return res.all.map(commit => commit.message);
    }

    function setBaseBranch(branchName) {
      if (branchName) {
        logger.debug(`Setting baseBranch to ${branchName}`);
        config.baseBranch = branchName;
      }
    }

    async function getFileList(branchName) {
      const branch = branchName || config.baseBranch;
      const exists = await branchExists(branch);
      if (!exists) {
        return [];
      }
      const files = await git.raw([
        'ls-tree',
        '-r',
        '--name-only',
        'origin/' + branch,
      ]);
      // istanbul ignore if
      if (!files) {
        return [];
      }
      return files.split('\n').filter(Boolean);
    }

    async function branchExists(branchName) {
      try {
        await git.raw(['show-branch', 'origin/' + branchName]);
        return true;
      } catch (ex) {
        return false;
      }
    }

    async function getAllRenovateBranches(branchPrefix) {
      const branches = await git.branch(['--remotes', '--verbose']);
      return branches.all
        .map(localName)
        .filter(branchName => branchName.startsWith(branchPrefix));
    }

    async function isBranchStale(branchName) {
      const branches = await git.branch([
        '--remotes',
        '--verbose',
        '--contains',
        config.baseBranch,
      ]);
      return !branches.all.map(localName).includes(branchName);
    }

    async function deleteLocalBranch(branchName) {
      await git.branch(['-D', branchName]);
    }

    async function deleteBranch(branchName) {
      try {
        await git.raw(['push', '--delete', 'origin', branchName]);
      } catch (err) /* istanbul ignore next */ {
        logger.warn({ branchName, err }, 'Error deleting remote branch');
      }
      try {
        await deleteLocalBranch(branchName);
      } catch (ex) {
        logger.debug({ branchName }, 'Could not delete remote branch');
      }
    }

    async function mergeBranch(branchName) {
      await git.reset('hard');
      await git.checkout(['-B', branchName, 'origin/' + branchName]);
      await git.checkout(config.baseBranch);
      await git.merge([branchName]);
      await git.push('origin', config.baseBranch);
    }

    async function getBranchLastCommitTime(branchName) {
      try {
        const time = await git.show([
          '-s',
          '--format=%ai',
          'origin/' + branchName,
        ]);
        return new Date(Date.parse(time));
      } catch (ex) {
        return new Date();
      }
    }

    async function getFile(filePath, branchName) {
      if (branchName) {
        const exists = await branchExists(branchName);
        if (!exists) {
          logger.warn({ branchName }, 'getFile branch does not exist');
          return null;
        }
      }
      try {
        const content = await git.show([
          'origin/' + (branchName || config.baseBranch) + ':' + filePath,
        ]);
        return content;
      } catch (ex) {
        return null;
      }
    }

    async function commitFilesToBranch(
      branchName,
      files,
      message,
      parentBranch = config.baseBranch
    ) {
      await git.reset('hard');
      await git.checkout(['-B', branchName, 'origin/' + parentBranch]);
      for (const file of files) {
        await fs.writeFile(join(cwd, file.name), Buffer.from(file.contents));
      }
      await git.add(files.map(f => f.name));
      await git.commit(message);
      await git.push(['origin', branchName, '--force']);
    }

    function cleanRepo() {}
  }
}

function localName(branchName) {
  return branchName.replace(/^origin\//, '');
}

module.exports = Storage;
