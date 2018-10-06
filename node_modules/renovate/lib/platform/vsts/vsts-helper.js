// @ts-nocheck

const vstsApi = require('./vsts-got-wrapper');

module.exports = {
  getBranchNameWithoutRefsheadsPrefix,
  getRefs,
  getVSTSBranchObj,
  getChanges,
  getNewBranchName,
  getFile,
  max4000Chars,
  getRenovatePRFormat,
  getCommitDetails,
  getProjectAndRepo,
};

/**
 *
 * @param {string} branchName
 */
function getNewBranchName(branchName) {
  if (branchName && !branchName.startsWith('refs/heads/')) {
    return `refs/heads/${branchName}`;
  }
  return branchName;
}

/**
 *
 * @param {string} branchPath
 */
function getBranchNameWithoutRefsheadsPrefix(branchPath) {
  if (!branchPath) {
    logger.error(`getBranchNameWithoutRefsheadsPrefix(${branchPath})`);
    return null;
  }
  if (!branchPath.startsWith('refs/heads/')) {
    logger.trace(
      `The refs/heads/ name should have started with 'refs/heads/' but it didn't. (${branchPath})`
    );
    return branchPath;
  }
  return branchPath.substring(11, branchPath.length);
}

/**
 *
 * @param {string} branchPath
 */
function getBranchNameWithoutRefsPrefix(branchPath) {
  if (!branchPath) {
    logger.error(`getBranchNameWithoutRefsPrefix(${branchPath})`);
    return null;
  }
  if (!branchPath.startsWith('refs/')) {
    logger.trace(
      `The ref name should have started with 'refs/' but it didn't. (${branchPath})`
    );
    return branchPath;
  }
  return branchPath.substring(5, branchPath.length);
}

/**
 *
 * @param {string} repoId
 * @param {string} branchName
 */
async function getRefs(repoId, branchName) {
  logger.debug(`getRefs(${repoId}, ${branchName})`);
  const vstsApiGit = await vstsApi.gitApi();
  const refs = await vstsApiGit.getRefs(
    repoId,
    null,
    getBranchNameWithoutRefsPrefix(branchName)
  );
  return refs;
}

/**
 *
 * @param {string} branchName
 * @param {string} from
 */
async function getVSTSBranchObj(repoId, branchName, from) {
  const fromBranchName = getNewBranchName(from);
  const refs = await getRefs(repoId, fromBranchName);
  if (refs.length === 0) {
    logger.debug(`getVSTSBranchObj without a valid from, so initial commit.`);
    return {
      name: getNewBranchName(branchName),
      oldObjectId: '0000000000000000000000000000000000000000',
    };
  }
  return {
    name: getNewBranchName(branchName),
    oldObjectId: refs[0].objectId,
  };
}
/**
 *
 * @param {string} msg
 * @param {string} filePath
 * @param {string} fileContent
 * @param {string} repoId
 * @param {string} repository
 * @param {string} branchName
 */
async function getChanges(files, repoId, repository, branchName) {
  const changes = [];
  for (const file of files) {
    // Add or update
    let changeType = 1;
    const fileAlreadyThere = await getFile(
      repoId,
      repository,
      file.name,
      branchName
    );
    if (fileAlreadyThere) {
      changeType = 2;
    }

    changes.push({
      changeType,
      item: {
        path: file.name,
      },
      newContent: {
        Content: file.contents,
        ContentType: 0, // RawText
      },
    });
  }

  return changes;
}

/**
 * if no branchName, look globaly
 * @param {string} repoId
 * @param {string} repository
 * @param {string} filePath
 * @param {string} branchName
 */
async function getFile(repoId, repository, filePath, branchName) {
  logger.trace(`getFile(filePath=${filePath}, branchName=${branchName})`);
  const vstsApiGit = await vstsApi.gitApi();
  const item = await vstsApiGit.getItemText(
    repoId,
    filePath,
    null,
    null,
    0, // because we look for 1 file
    false,
    false,
    true,
    {
      versionType: 0, // branch
      versionOptions: 0,
      version: getBranchNameWithoutRefsheadsPrefix(branchName),
    }
  );

  if (item && item.readable) {
    const fileContent = await streamToString(item);
    try {
      const jTmp = JSON.parse(fileContent);
      if (jTmp.typeKey === 'GitItemNotFoundException') {
        // file not found
        return null;
      }
      if (jTmp.typeKey === 'GitUnresolvableToCommitException') {
        // branch not found
        return null;
      }
    } catch (error) {
      // it 's not a JSON, so I send the content directly with the line under
    }
    return fileContent;
  }
  return null; // no file found
}

async function streamToString(stream) {
  const chunks = [];
  /* eslint-disable promise/avoid-new */
  const p = await new Promise(resolve => {
    stream.on('data', chunk => {
      chunks.push(chunk.toString());
    });
    stream.on('end', () => {
      resolve(chunks.join(''));
    });
  });
  return p;
}

/**
 *
 * @param {string} str
 */
function max4000Chars(str) {
  if (str && str.length >= 4000) {
    return str.substring(0, 3999);
  }
  return str;
}

function getRenovatePRFormat(vstsPr) {
  const pr = vstsPr;

  pr.displayNumber = `Pull Request #${vstsPr.pullRequestId}`;
  pr.number = vstsPr.pullRequestId;

  // status
  // export declare enum PullRequestStatus {
  //   NotSet = 0,
  //   Active = 1,
  //   Abandoned = 2,
  //   Completed = 3,
  //   All = 4,
  // }
  if (vstsPr.status === 2) {
    pr.state = 'closed';
  } else if (vstsPr.status === 3) {
    pr.state = 'merged';
  } else {
    pr.state = 'open';
  }

  // mergeStatus
  // export declare enum PullRequestAsyncStatus {
  //   NotSet = 0,
  //   Queued = 1,
  //   Conflicts = 2,
  //   Succeeded = 3,
  //   RejectedByPolicy = 4,
  //   Failure = 5,
  // }
  if (vstsPr.mergeStatus === 2) {
    pr.isConflicted = true;
  }

  pr.canRebase = true;

  return pr;
}

async function getCommitDetails(commit, repoId) {
  logger.debug(`getCommitDetails(${commit}, ${repoId})`);
  const vstsApiGit = await vstsApi.gitApi();
  const results = await vstsApiGit.getCommit(commit, repoId);
  return results;
}

/**
 *
 * @param {string} str
 */
function getProjectAndRepo(str) {
  logger.trace(`getProjectAndRepo(${str})`);
  const strSplited = str.split(`/`);
  if (strSplited.length === 1) {
    return {
      project: str,
      repo: str,
    };
  }
  if (strSplited.length === 2) {
    return {
      project: strSplited[0],
      repo: strSplited[1],
    };
  }
  const msg = `${str} can be only structured this way : 'repository' or 'projectName/repository'!`;
  logger.error(msg);
  throw new Error(msg);
}
