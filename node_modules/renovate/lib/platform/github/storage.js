const moment = require('moment');
const openpgp = require('openpgp');
const path = require('path');
const get = require('./gh-got-wrapper');

class Storage {
  constructor() {
    // config
    let config = {};
    // cache
    let branchFiles = {};
    let branchList = null;

    Object.assign(this, {
      initRepo,
      cleanRepo,
      getRepoStatus: () => ({}),
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
      setBaseBranch,
    });

    function initRepo(args) {
      cleanRepo();
      config = { ...args };
    }

    function cleanRepo() {
      branchFiles = {};
      branchList = null;
    }

    async function getBranchList() {
      if (!branchList) {
        logger.debug('Retrieving branchList');
        branchList = (await get(
          `repos/${config.repository}/branches?per_page=100`,
          {
            paginate: true,
          }
        )).body.map(branch => branch.name);
        logger.debug({ branchList }, 'Retrieved branchList');
      }
      return branchList;
    }

    // Returns true if branch exists, otherwise false
    async function branchExists(branchName) {
      const res = (await getBranchList()).includes(branchName);
      logger.debug(`branchExists(${branchName})=${res}`);
      return res;
    }

    function setBaseBranch(branchName) {
      if (branchName) {
        logger.debug(`Setting baseBranch to ${branchName}`);
        config.baseBranch = branchName;
      }
    }

    // Get full file list
    async function getFileList(branchName) {
      const branch = branchName || config.baseBranch;
      if (branchFiles[branch]) {
        return branchFiles[branch];
      }
      try {
        const res = await get(
          `repos/${config.repository}/git/trees/${branch}?recursive=true`
        );
        if (res.body.truncated) {
          logger.warn(
            { repository: config.repository },
            'repository tree is truncated'
          );
        }
        const fileList = res.body.tree
          .filter(item => item.type === 'blob' && item.mode !== '120000')
          .map(item => item.path)
          .sort();
        logger.debug(`Retrieved fileList with length ${fileList.length}`);
        branchFiles[branch] = fileList;
        return fileList;
      } catch (err) /* istanbul ignore next */ {
        if (err.statusCode === 409) {
          logger.debug('Repository is not initiated');
          throw new Error('uninitiated');
        }
        logger.info(
          { repository: config.repository },
          'Error retrieving git tree - no files detected'
        );
        return [];
      }
    }

    async function getAllRenovateBranches(branchPrefix) {
      logger.trace('getAllRenovateBranches');
      const allBranches = await getBranchList();
      if (branchPrefix.endsWith('/')) {
        const branchPrefixPrefix = branchPrefix.slice(0, -1);
        if (allBranches.includes(branchPrefixPrefix)) {
          logger.warn(
            `Pruning branch "${branchPrefixPrefix}" so that it does not block PRs`
          );
          await deleteBranch(branchPrefixPrefix);
        }
      }
      return allBranches.filter(branchName =>
        branchName.startsWith(branchPrefix)
      );
    }

    async function isBranchStale(branchName) {
      // Check if branch's parent SHA = master SHA
      logger.debug(`isBranchStale(${branchName})`);
      const branchCommit = await getBranchCommit(branchName);
      logger.debug(`branchCommit=${branchCommit}`);
      const commitDetails = await getCommitDetails(branchCommit);
      logger.trace({ commitDetails }, `commitDetails`);
      const parentSha = commitDetails.parents[0].sha;
      logger.debug(`parentSha=${parentSha}`);
      const baseCommitSHA = await getBranchCommit(config.baseBranch);
      logger.debug(`baseCommitSHA=${baseCommitSHA}`);
      // Return true if the SHAs don't match
      return parentSha !== baseCommitSHA;
    }

    async function deleteBranch(branchName) {
      delete branchFiles[branchName];
      const options = config.forkToken
        ? { token: config.forkToken }
        : undefined;
      try {
        await get.delete(
          `repos/${config.repository}/git/refs/heads/${branchName}`,
          options
        );
      } catch (err) /* istanbul ignore next */ {
        if (err.message.startsWith('Reference does not exist')) {
          logger.info(
            { branch: branchName },
            'Branch to delete does not exist'
          );
        } else {
          logger.warn({ err, branch: branchName }, 'Error deleting branch');
        }
      }
    }

    async function mergeBranch(branchName) {
      logger.debug(`mergeBranch(${branchName})`);
      const url = `repos/${config.repository}/git/refs/heads/${
        config.baseBranch
      }`;
      const options = {
        body: {
          sha: await getBranchCommit(branchName),
        },
      };
      try {
        await get.patch(url, options);
        logger.debug({ branch: branchName }, 'Branch merged');
      } catch (err) {
        logger.info({ err }, `Error pushing branch merge for ${branchName}`);
        throw new Error('Branch automerge failed');
      }
      // Delete branch
      await deleteBranch(branchName);
    }

    async function getBranchLastCommitTime(branchName) {
      try {
        const res = await get(
          `repos/${config.repository}/commits?sha=${branchName}`
        );
        return new Date(res.body[0].commit.committer.date);
      } catch (err) {
        logger.error({ err }, `getBranchLastCommitTime error`);
        return new Date();
      }
    }

    // Generic File operations

    async function getFile(filePath, branchName) {
      logger.trace(`getFile(filePath=${filePath}, branchName=${branchName})`);
      if (!(await getFileList(branchName)).includes(filePath)) {
        return null;
      }
      let res;
      try {
        res = await get(
          `repos/${config.repository}/contents/${encodeURI(
            filePath
          )}?ref=${branchName || config.baseBranch}`
        );
      } catch (error) {
        if (error.statusCode === 404) {
          // If file not found, then return null JSON
          logger.info({ filePath, branch: branchName }, 'getFile 404');
          return null;
        }
        if (
          error.statusCode === 403 &&
          error.message &&
          error.message.startsWith('This API returns blobs up to 1 MB in size')
        ) {
          logger.info('Large file');
          // istanbul ignore if
          if (branchName && branchName !== config.baseBranch) {
            logger.info('Cannot retrieve large files from non-master branch');
            return null;
          }
          // istanbul ignore if
          if (path.dirname(filePath) !== '.') {
            logger.info(
              'Cannot retrieve large files from non-root directories'
            );
            return null;
          }
          const treeUrl = `repos/${config.repository}/git/trees/${
            config.baseBranch
          }`;
          const baseName = path.basename(filePath);
          let fileSha;
          (await get(treeUrl)).body.tree.forEach(file => {
            if (file.path === baseName) {
              fileSha = file.sha;
            }
          });
          if (!fileSha) {
            logger.warn('Could not locate file blob');
            throw error;
          }
          res = await get(`repos/${config.repository}/git/blobs/${fileSha}`);
        } else {
          // Propagate if it's any other error
          throw error;
        }
      }
      if (res && res.body.content) {
        return Buffer.from(res.body.content, 'base64').toString();
      }
      return null;
    }

    // Add a new commit, create branch if not existing
    async function commitFilesToBranch(
      branchName,
      files,
      message,
      parentBranch = config.baseBranch
    ) {
      logger.debug(
        `commitFilesToBranch('${branchName}', files, message, '${parentBranch})'`
      );
      delete branchFiles[branchName];
      const parentCommit = await getBranchCommit(parentBranch);
      const parentTree = await getCommitTree(parentCommit);
      const fileBlobs = [];
      // Create blobs
      for (const file of files) {
        const blob = await createBlob(file.contents);
        fileBlobs.push({
          name: file.name,
          blob,
        });
      }
      // Create tree
      const tree = await createTree(parentTree, fileBlobs);
      const commit = await createCommit(parentCommit, tree, message);
      const isBranchExisting = await branchExists(branchName);
      try {
        if (isBranchExisting) {
          await updateBranch(branchName, commit);
          logger.debug({ branch: branchName }, 'Branch updated');
          return 'updated';
        }
        await createBranch(branchName, commit);
        logger.info({ branch: branchName }, 'Branch created');
        return 'created';
      } catch (err) /* istanbul ignore next */ {
        logger.debug({
          files: files.filter(
            file =>
              !file.name.endsWith('package-lock.json') &&
              !file.name.endsWith('npm-shrinkwrap.json') &&
              !file.name.endsWith('yarn.lock')
          ),
        });
        throw err;
      }
    }

    // Internal branch operations

    // Creates a new branch with provided commit
    async function createBranch(branchName, sha) {
      logger.debug(`createBranch(${branchName})`);
      const options = {
        body: {
          ref: `refs/heads/${branchName}`,
          sha,
        },
      };
      // istanbul ignore if
      if (config.forkToken) {
        options.token = config.forkToken;
      }
      try {
        // istanbul ignore if
        if (branchName.includes('/')) {
          const [blockingBranch] = branchName.split('/');
          if (await branchExists(blockingBranch)) {
            logger.warn({ blockingBranch }, 'Deleting blocking branch');
            await deleteBranch(blockingBranch);
          }
        }
        logger.debug({ options, branch: branchName }, 'Creating branch');
        await get.post(`repos/${config.repository}/git/refs`, options);
        branchList.push(branchName);
        logger.debug('Created branch');
      } catch (err) /* istanbul ignore next */ {
        const headers = err.response.req.getHeaders();
        delete headers.token;
        logger.warn(
          {
            err,
            headers,
            options,
          },
          'Error creating branch'
        );
        if (err.statusCode === 422) {
          throw new Error('repository-changed');
        }
        throw err;
      }
    }

    // Return the commit SHA for a branch
    async function getBranchCommit(branchName) {
      try {
        const res = await get(
          `repos/${config.repository}/git/refs/heads/${branchName}`
        );
        return res.body.object.sha;
      } catch (err) /* istanbul ignore next */ {
        logger.debug({ err }, 'Error getting branch commit');
        if (err.statusCode === 404) {
          throw new Error('repository-changed');
        }
        if (err.statusCode === 409) {
          throw new Error('empty');
        }
        throw err;
      }
    }

    async function getCommitMessages() {
      logger.debug('getCommitMessages');
      const res = await get(`repos/${config.repository}/commits`);
      return res.body.map(commit => commit.commit.message);
    }

    // Internal: Updates an existing branch to new commit sha
    async function updateBranch(branchName, commit) {
      logger.debug(`Updating branch ${branchName} with commit ${commit}`);
      const options = {
        body: {
          sha: commit,
          force: true,
        },
      };
      // istanbul ignore if
      if (config.forkToken) {
        options.token = config.forkToken;
      }
      try {
        await get.patch(
          `repos/${config.repository}/git/refs/heads/${branchName}`,
          options
        );
      } catch (err) /* istanbul ignore next */ {
        if (err.statusCode === 422) {
          logger.info({ err }, 'Branch no longer exists - exiting');
          throw new Error('repository-changed');
        }
        throw err;
      }
    }
    // Low-level commit operations

    // Create a blob with fileContents and return sha
    async function createBlob(fileContents) {
      logger.debug('Creating blob');
      const options = {
        body: {
          encoding: 'base64',
          content: Buffer.from(fileContents).toString('base64'),
        },
      };
      // istanbul ignore if
      if (config.forkToken) {
        options.token = config.forkToken;
      }
      return (await get.post(`repos/${config.repository}/git/blobs`, options))
        .body.sha;
    }

    // Return the tree SHA for a commit
    async function getCommitTree(commit) {
      logger.debug(`getCommitTree(${commit})`);
      return (await get(`repos/${config.repository}/git/commits/${commit}`))
        .body.tree.sha;
    }

    // Create a tree and return SHA
    async function createTree(baseTree, files) {
      logger.debug(`createTree(${baseTree}, files)`);
      const body = {
        base_tree: baseTree,
        tree: [],
      };
      files.forEach(file => {
        body.tree.push({
          path: file.name,
          mode: '100644',
          type: 'blob',
          sha: file.blob,
        });
      });
      logger.trace({ body }, 'createTree body');
      const options = { body };
      // istanbul ignore if
      if (config.forkToken) {
        options.token = config.forkToken;
      }
      return (await get.post(`repos/${config.repository}/git/trees`, options))
        .body.sha;
    }

    // Create a commit and return commit SHA
    async function createCommit(parent, tree, message) {
      logger.debug(`createCommit(${parent}, ${tree}, ${message})`);
      const { gitAuthor, gitPrivateKey } = config;
      const now = moment();
      let author;
      if (gitAuthor) {
        logger.trace('Setting gitAuthor');
        author = {
          name: gitAuthor.name,
          email: gitAuthor.address,
          date: now.format(),
        };
      }
      const body = {
        message,
        parents: [parent],
        tree,
      };
      if (author) {
        body.author = author;
        // istanbul ignore if
        if (gitPrivateKey) {
          logger.debug('Found gitPrivateKey');
          const privKeyObj = openpgp.key.readArmored(gitPrivateKey).keys[0];
          const commit = `tree ${tree}\nparent ${parent}\nauthor ${
            author.name
          } <${author.email}> ${now.format('X ZZ')}\ncommitter ${
            author.name
          } <${author.email}> ${now.format('X ZZ')}\n\n${message}`;
          const { signature } = await openpgp.sign({
            data: openpgp.util.str2Uint8Array(commit),
            privateKeys: privKeyObj,
            detached: true,
            armor: true,
          });
          body.signature = signature;
        }
      }
      const options = {
        body,
      };
      // istanbul ignore if
      if (config.forkToken) {
        options.token = config.forkToken;
      }
      return (await get.post(`repos/${config.repository}/git/commits`, options))
        .body.sha;
    }

    async function getCommitDetails(commit) {
      logger.debug(`getCommitDetails(${commit})`);
      const results = await get(
        `repos/${config.repository}/git/commits/${commit}`
      );
      return results.body;
    }
  }
}

module.exports = Storage;
