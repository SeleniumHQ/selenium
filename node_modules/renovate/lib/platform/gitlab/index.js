const is = require('@sindresorhus/is');
const addrs = require('email-addresses');

const get = require('./gl-got-wrapper');
const hostRules = require('../../util/host-rules');

let config = {};

module.exports = {
  getRepos,
  cleanRepo,
  initRepo,
  getRepoStatus: () => ({}),
  getRepoForceRebase,
  setBaseBranch,
  // Search
  getFileList,
  // Branch
  branchExists,
  getAllRenovateBranches,
  isBranchStale,
  getBranchPr,
  getBranchStatus,
  getBranchStatusCheck,
  setBranchStatus,
  deleteBranch,
  mergeBranch,
  getBranchLastCommitTime,
  // issue
  ensureIssue,
  ensureIssueClosing,
  addAssignees,
  addReviewers,
  deleteLabel,
  // Comments
  ensureComment,
  ensureCommentRemoval,
  // PR
  getPrList,
  findPr,
  createPr,
  getPr,
  getPrFiles,
  updatePr,
  mergePr,
  getPrBody,
  // file
  commitFilesToBranch,
  getFile,
  // commits
  getCommitMessages,
  // vulnerability alerts
  getVulnerabilityAlerts,
};

// Get all repositories that the user has access to
async function getRepos(token, endpoint) {
  logger.info('Autodiscovering GitLab repositories');
  logger.debug('getRepos(token, endpoint)');
  const opts = hostRules.find({ platform: 'gitlab' }, { token, endpoint });
  if (!opts.token) {
    throw new Error('No token found for getRepos');
  }
  hostRules.update({ ...opts, platform: 'gitlab', default: true });
  try {
    const url = `projects?membership=true&per_page=100`;
    const res = await get(url, { paginate: true });
    logger.info(`Discovered ${res.body.length} project(s)`);
    return res.body.map(repo => repo.path_with_namespace);
  } catch (err) {
    logger.error({ err }, `GitLab getRepos error`);
    throw err;
  }
}

function urlEscape(str) {
  return str ? str.replace(/\//g, '%2F') : str;
}

function cleanRepo() {
  // In theory most of this isn't necessary. In practice..
  get.reset();
  config = {};
}

// Initialize GitLab by getting base branch
async function initRepo({ repository, token, endpoint, gitAuthor }) {
  const opts = hostRules.find({ platform: 'gitlab' }, { token, endpoint });
  if (!opts.token) {
    throw new Error(`No token found for GitLab repository ${repository}`);
  }
  hostRules.update({ ...opts, platform: 'gitlab', default: true });
  config = {};
  get.reset();
  config.repository = urlEscape(repository);
  if (gitAuthor) {
    try {
      config.gitAuthor = addrs.parseOneAddress(gitAuthor);
    } catch (err) /* istanbul ignore next */ {
      logger.error(
        { gitAuthor, err, message: err.message },
        'Invalid gitAuthor'
      );
      throw new Error('Invalid gitAuthor');
    }
  }
  let res;
  try {
    res = await get(`projects/${config.repository}`);
    if (res.body.archived) {
      logger.info(
        'Repository is archived - throwing error to abort renovation'
      );
      throw new Error('archived');
    }
    config.defaultBranch = res.body.default_branch;
    config.baseBranch = config.defaultBranch;
    logger.debug(`${repository} default branch = ${config.baseBranch}`);
    // Discover our user email
    config.email = (await get(`user`)).body.email;
    delete config.prList;
    delete config.fileList;
    await Promise.all([getPrList(), getFileList()]);
  } catch (err) {
    logger.debug('Caught initRepo error');
    if (err.message === 'archived') {
      throw err;
    }
    logger.info({ err }, 'Unknown GitLab initRepo error');
    throw err;
  }
  return {};
}

function getRepoForceRebase() {
  return false;
}

async function setBaseBranch(branchName) {
  if (branchName) {
    logger.debug(`Setting baseBranch to ${branchName}`);
    config.baseBranch = branchName;
    delete config.fileList;
    await getFileList(branchName);
  }
}

// Search

// Get full file list
async function getFileList(branchName = config.baseBranch) {
  if (config.fileList) {
    return config.fileList;
  }
  try {
    let url = `projects/${
      config.repository
    }/repository/tree?ref=${branchName}&per_page=100`;
    if (!(process.env.RENOVATE_DISABLE_FILE_RECURSION === 'true')) {
      url += '&recursive=true';
    }
    const res = await get(url, { paginate: true });
    config.fileList = res.body
      .filter(item => item.type === 'blob' && item.mode !== '120000')
      .map(item => item.path)
      .sort();
    logger.debug(`Retrieved fileList with length ${config.fileList.length}`);
  } catch (err) {
    logger.info('Error retrieving git tree - no files detected');
    config.fileList = [];
  }
  return config.fileList;
}

// Branch

// Returns true if branch exists, otherwise false
async function branchExists(branchName) {
  logger.debug(`Checking if branch exists: ${branchName}`);
  try {
    const url = `projects/${config.repository}/repository/branches/${urlEscape(
      branchName
    )}`;
    const res = await get(url);
    if (res.statusCode === 200) {
      logger.debug('Branch exists');
      return true;
    }
    // This probably shouldn't happen
    logger.debug("Branch doesn't exist");
    return false;
  } catch (error) {
    if (error.statusCode === 404) {
      // If file not found, then return false
      logger.debug("Branch doesn't exist");
      return false;
    }
    // Propagate if it's any other error
    throw error;
  }
}

async function getAllRenovateBranches(branchPrefix) {
  logger.debug(`getAllRenovateBranches(${branchPrefix})`);
  const allBranches = await get(
    `projects/${config.repository}/repository/branches`
  );
  return allBranches.body.reduce((arr, branch) => {
    if (branch.name.startsWith(branchPrefix)) {
      arr.push(branch.name);
    }
    return arr;
  }, []);
}

async function isBranchStale(branchName) {
  logger.debug(`isBranchStale(${branchName})`);
  const branchDetails = await getBranchDetails(branchName);
  logger.trace({ branchDetails }, 'branchDetails');
  const parentSha = branchDetails.body.commit.parent_ids[0];
  logger.debug(`parentSha=${parentSha}`);
  const baseCommitSHA = await getBaseCommitSHA();
  logger.debug(`baseCommitSHA=${baseCommitSHA}`);
  // Return true if the SHAs don't match
  return parentSha !== baseCommitSHA;
}

// Returns the Pull Request for a branch. Null if not exists.
async function getBranchPr(branchName) {
  logger.debug(`getBranchPr(${branchName})`);
  if (!(await branchExists(branchName))) {
    return null;
  }
  const urlString = `projects/${
    config.repository
  }/merge_requests?state=opened&per_page=100`;
  const res = await get(urlString, { paginate: true });
  logger.debug(`Got res with ${res.body.length} results`);
  let pr = null;
  res.body.forEach(result => {
    if (result.source_branch === branchName) {
      pr = result;
    }
  });
  if (!pr) {
    return null;
  }
  return getPr(pr.iid);
}

// Returns the combined status for a branch.
async function getBranchStatus(branchName, requiredStatusChecks) {
  logger.debug(`getBranchStatus(${branchName})`);
  if (!requiredStatusChecks) {
    // null means disable status checks, so it always succeeds
    return 'success';
  }
  if (requiredStatusChecks.length) {
    // This is Unsupported
    logger.warn({ requiredStatusChecks }, `Unsupported requiredStatusChecks`);
    return 'failed';
  }
  // First, get the branch to find the commit SHA
  let url = `projects/${config.repository}/repository/branches/${urlEscape(
    branchName
  )}`;
  let res = await get(url);
  const branchSha = res.body.commit.id;
  // Now, check the statuses for that commit
  url = `projects/${
    config.repository
  }/repository/commits/${branchSha}/statuses`;
  res = await get(url);
  logger.debug(`Got res with ${res.body.length} results`);
  if (res.body.length === 0) {
    // Return 'pending' if we have no status checks
    return 'pending';
  }
  let status = 'success';
  // Return 'success' if all are success
  res.body.forEach(check => {
    // If one is failed then don't overwrite that
    if (status !== 'failure') {
      if (!check.allow_failure) {
        if (check.status === 'failed') {
          status = 'failure';
        } else if (check.status !== 'success') {
          ({ status } = check);
        }
      }
    }
  });
  return status;
}

async function getBranchStatusCheck(branchName, context) {
  // First, get the branch to find the commit SHA
  let url = `projects/${config.repository}/repository/branches/${urlEscape(
    branchName
  )}`;
  let res = await get(url);
  const branchSha = res.body.commit.id;
  // Now, check the statuses for that commit
  url = `projects/${
    config.repository
  }/repository/commits/${branchSha}/statuses`;
  res = await get(url);
  logger.debug(`Got res with ${res.body.length} results`);
  for (const check of res.body) {
    if (check.name === context) {
      return check.state;
    }
  }
  return null;
}

async function setBranchStatus(
  branchName,
  context,
  description,
  state,
  targetUrl
) {
  // First, get the branch to find the commit SHA
  let url = `projects/${config.repository}/repository/branches/${urlEscape(
    branchName
  )}`;
  const res = await get(url);
  const branchSha = res.body.commit.id;
  // Now, check the statuses for that commit
  url = `projects/${config.repository}/statuses/${branchSha}`;
  const options = {
    state,
    description,
    context,
  };
  if (targetUrl) {
    options.target_url = targetUrl;
  }
  await get.post(url, { body: options });
}

async function deleteBranch(branchName, closePr = false) {
  if (closePr) {
    logger.debug('Closing PR');
    const pr = await getBranchPr(branchName);
    // istanbul ignore if
    if (pr) {
      await get.put(
        `projects/${config.repository}/merge_requests/${pr.number}`,
        {
          body: {
            state_event: 'close',
          },
        }
      );
    }
  }
  await get.delete(
    `projects/${config.repository}/repository/branches/${urlEscape(branchName)}`
  );
}

async function mergeBranch(branchName) {
  logger.debug(`mergeBranch(${branchName}`);
  const branchURI = encodeURIComponent(branchName);
  try {
    await get.post(
      `projects/${
        config.repository
      }/repository/commits/${branchURI}/cherry_pick?branch=${config.baseBranch}`
    );
  } catch (err) {
    logger.info({ err }, `Error pushing branch merge for ${branchName}`);
    throw new Error('Branch automerge failed');
  }
  // Update base commit
  config.baseCommitSHA = null;
  // Delete branch
  await deleteBranch(branchName);
}

async function getBranchLastCommitTime(branchName) {
  try {
    const res = await get(
      `projects/${config.repository}/repository/commits?ref_name=${urlEscape(
        branchName
      )}`
    );
    return new Date(res.body[0].committed_date);
  } catch (err) {
    logger.error({ err }, `getBranchLastCommitTime error`);
    return new Date();
  }
}

// Issue

async function getIssueList() {
  if (!config.issueList) {
    const res = await get(`projects/${config.repository}/issues?state=opened`, {
      useCache: false,
    });
    // istanbul ignore if
    if (!is.array(res.body)) {
      logger.warn({ responseBody: res.body }, 'Could not retrieve issue list');
      return [];
    }
    config.issueList = res.body.map(i => ({
      iid: i.iid,
      title: i.title,
    }));
  }
  return config.issueList;
}

async function ensureIssue(title, body) {
  logger.debug(`ensureIssue()`);
  try {
    const issueList = await getIssueList();
    const issue = issueList.find(i => i.title === title);
    if (issue) {
      const issueBody = (await get(
        `projects/${config.repository}/issues/${issue.iid}`
      )).body.body;
      if (issueBody !== body) {
        logger.debug('Updating issue body');
        await get.put(`projects/${config.repository}/issues/${issue.iid}`, {
          body: { description: body },
        });
        return 'updated';
      }
    } else {
      await get.post(`projects/${config.repository}/issues`, {
        body: {
          title,
          description: body,
        },
      });
      // delete issueList so that it will be refetched as necessary
      delete config.issueList;
      return 'created';
    }
  } catch (err) /* istanbul ignore next */ {
    if (err.message.startsWith('Issues are disabled for this repo')) {
      logger.info(`Could not create issue: ${err.message}`);
    } else {
      logger.warn({ err }, 'Could not ensure issue');
    }
  }
  return null;
}

async function ensureIssueClosing(title) {
  logger.debug(`ensureIssueClosing()`);
  const issueList = await getIssueList();
  for (const issue of issueList) {
    if (issue.title === title) {
      logger.info({ issue }, 'Closing issue');
      await get.put(`projects/${config.repository}/issues/${issue.iid}`, {
        body: { state_event: 'close' },
      });
    }
  }
}

async function addAssignees(iid, assignees) {
  logger.debug(`Adding assignees ${assignees} to #${iid}`);
  if (assignees.length > 1) {
    logger.warn('Cannot assign more than one assignee to Merge Requests');
  }
  try {
    const assigneeId = (await get(`users?username=${assignees[0]}`)).body[0].id;
    let url = `projects/${config.repository}/merge_requests/${iid}`;
    url += `?assignee_id=${assigneeId}`;
    await get.put(url);
  } catch (err) {
    logger.error({ iid, assignees }, 'Failed to add assignees');
  }
}

function addReviewers(iid, reviewers) {
  logger.debug(`addReviewers('${iid}, '${reviewers})`);
  logger.warn('Unimplemented in GitLab: approvals');
}

// istanbul ignore next
function deleteLabel() {
  throw new Error('deleteLabel not implemented');
}

async function getComments(issueNo) {
  // GET projects/:owner/:repo/merge_requests/:number/notes
  logger.debug(`Getting comments for #${issueNo}`);
  const url = `projects/${config.repository}/merge_requests/${issueNo}/notes`;
  const comments = (await get(url, { paginate: true })).body;
  logger.debug(`Found ${comments.length} comments`);
  return comments;
}

async function addComment(issueNo, body) {
  // POST projects/:owner/:repo/merge_requests/:number/notes
  await get.post(
    `projects/${config.repository}/merge_requests/${issueNo}/notes`,
    {
      body: { body },
    }
  );
}

async function editComment(issueNo, commentId, body) {
  // PATCH projects/:owner/:repo/merge_requests/:number/notes/:id
  await get.patch(
    `projects/${
      config.repository
    }/merge_requests/${issueNo}/notes/${commentId}`,
    {
      body: { body },
    }
  );
}

async function deleteComment(issueNo, commentId) {
  // DELETE projects/:owner/:repo/merge_requests/:number/notes/:id
  await get.delete(
    `projects/${config.repository}/merge_requests/${issueNo}/notes/${commentId}`
  );
}

async function ensureComment(issueNo, topic, content) {
  const comments = await getComments(issueNo);
  let body;
  let commentId;
  let commentNeedsUpdating;
  if (topic) {
    logger.debug(`Ensuring comment "${topic}" in #${issueNo}`);
    body = `### ${topic}\n\n${content}`;
    comments.forEach(comment => {
      if (comment.body.startsWith(`### ${topic}\n\n`)) {
        commentId = comment.id;
        commentNeedsUpdating = comment.body !== body;
      }
    });
  } else {
    logger.debug(`Ensuring content-only comment in #${issueNo}`);
    body = `${content}`;
    comments.forEach(comment => {
      if (comment.body === body) {
        commentId = comment.id;
        commentNeedsUpdating = false;
      }
    });
  }
  if (!commentId) {
    await addComment(issueNo, body);
    logger.info({ repository: config.repository, issueNo }, 'Added comment');
  } else if (commentNeedsUpdating) {
    await editComment(issueNo, commentId, body);
    logger.info({ repository: config.repository, issueNo }, 'Updated comment');
  } else {
    logger.debug('Comment is already update-to-date');
  }
}

async function ensureCommentRemoval(issueNo, topic) {
  logger.debug(`Ensuring comment "${topic}" in #${issueNo} is removed`);
  const comments = await getComments(issueNo);
  let commentId;
  comments.forEach(comment => {
    if (comment.body.startsWith(`### ${topic}\n\n`)) {
      commentId = comment.id;
    }
  });
  if (commentId) {
    await deleteComment(issueNo, commentId);
  }
}

async function getPrList() {
  if (!config.prList) {
    const urlString = `projects/${
      config.repository
    }/merge_requests?per_page=100`;
    const res = await get(urlString, { paginate: true });
    config.prList = res.body.map(pr => ({
      number: pr.iid,
      branchName: pr.source_branch,
      title: pr.title,
      state: pr.state === 'opened' ? 'open' : pr.state,
      createdAt: pr.created_at,
    }));
  }
  return config.prList;
}

function matchesState(state, desiredState) {
  if (desiredState === 'all') {
    return true;
  }
  if (desiredState[0] === '!') {
    return state !== desiredState.substring(1);
  }
  return state === desiredState;
}

async function findPr(branchName, prTitle, state = 'all') {
  logger.debug(`findPr(${branchName}, ${prTitle}, ${state})`);
  const prList = await getPrList();
  return prList.find(
    p =>
      p.branchName === branchName &&
      (!prTitle || p.title === prTitle) &&
      matchesState(p.state, state)
  );
}

// Pull Request

async function createPr(
  branchName,
  title,
  description,
  labels,
  useDefaultBranch
) {
  const targetBranch = useDefaultBranch
    ? config.defaultBranch
    : config.baseBranch;
  logger.debug(`Creating Merge Request: ${title}`);
  const res = await get.post(`projects/${config.repository}/merge_requests`, {
    body: {
      source_branch: branchName,
      target_branch: targetBranch,
      remove_source_branch: true,
      title,
      description,
      labels: is.array(labels) ? labels.join(',') : null,
    },
  });
  const pr = res.body;
  pr.number = pr.iid;
  pr.branchName = branchName;
  pr.displayNumber = `Merge Request #${pr.iid}`;
  return pr;
}

async function getPr(iid) {
  logger.debug(`getPr(${iid})`);
  const url = `projects/${config.repository}/merge_requests/${iid}`;
  const pr = (await get(url)).body;
  // Harmonize fields with GitHub
  pr.branchName = pr.source_branch;
  pr.number = pr.iid;
  pr.displayNumber = `Merge Request #${pr.iid}`;
  pr.body = pr.description;
  pr.state = pr.state === 'opened' ? 'open' : pr.state;
  if (pr.merge_status === 'cannot_be_merged') {
    logger.debug('pr cannot be merged');
    pr.canMerge = false;
    pr.isConflicted = true;
  } else {
    // Actually.. we can't be sure
    pr.canMerge = true;
  }
  // Check if the most recent branch commit is by us
  // If not then we don't allow it to be rebased, in case someone's changes would be lost
  const branchUrl = `projects/${
    config.repository
  }/repository/branches/${urlEscape(pr.source_branch)}`;
  try {
    const branch = (await get(branchUrl)).body;
    if (
      branch &&
      branch.commit &&
      branch.commit.author_email === config.email
    ) {
      pr.canRebase = true;
    }
  } catch (err) {
    logger.warn({ err }, 'Error getting PR branch');
    pr.isConflicted = true;
  }
  return pr;
}

// Return a list of all modified files in a PR
async function getPrFiles(mrNo) {
  logger.debug({ mrNo }, 'getPrFiles');
  if (!mrNo) {
    return [];
  }
  const files = (await get(
    `projects/${config.repository}/merge_requests/${mrNo}/changes`
  )).body;
  return files.map(f => f.filename);
}

// istanbul ignore next
async function reopenPr(iid) {
  await get.put(`projects/${config.repository}/merge_requests/${iid}`, {
    body: {
      state_event: 'reopen',
    },
  });
}

async function updatePr(iid, title, description) {
  await get.put(`projects/${config.repository}/merge_requests/${iid}`, {
    body: {
      title,
      description,
    },
  });
}

async function mergePr(iid) {
  await get.put(`projects/${config.repository}/merge_requests/${iid}/merge`, {
    body: {
      should_remove_source_branch: true,
    },
  });
  return true;
}

function getPrBody(input) {
  return input.replace(/Pull Request/g, 'Merge Request').replace(/PR/g, 'MR');
}

// Generic File operations

async function getFile(filePath, branchName) {
  logger.debug(`getFile(filePath=${filePath}, branchName=${branchName})`);
  if (!branchName || branchName === config.baseBranch) {
    if (config.fileList && !config.fileList.includes(filePath)) {
      return null;
    }
  }
  try {
    const url = `projects/${config.repository}/repository/files/${urlEscape(
      filePath
    )}?ref=${branchName || config.baseBranch}`;
    const res = await get(url);
    return Buffer.from(res.body.content, 'base64').toString();
  } catch (error) {
    if (error.statusCode === 404) {
      // If file not found, then return null JSON
      return null;
    }
    // Propagate if it's any other error
    throw error;
  }
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
  const opts = {
    body: {
      branch: branchName,
      commit_message: message,
      start_branch: parentBranch,
      actions: [],
    },
  };
  // istanbul ignore if
  if (config.gitAuthor) {
    opts.body.author_name = config.gitAuthor.name;
    opts.body.author_email = config.gitAuthor.address;
  }
  for (const file of files) {
    const action = {
      file_path: file.name,
      content: Buffer.from(file.contents).toString('base64'),
      encoding: 'base64',
    };
    action.action = (await getFile(file.name)) ? 'update' : 'create';
    opts.body.actions.push(action);
  }
  let res = 'created';
  try {
    if (await branchExists(branchName)) {
      logger.debug('Deleting existing branch');
      await deleteBranch(branchName);
      res = 'updated';
    }
  } catch (err) {
    // istanbul ignore next
    logger.info(`Ignoring branch deletion failure`);
  }
  logger.debug('Adding commits');
  await get.post(`projects/${config.repository}/repository/commits`, opts);
  // Reopen PR if it previousluy existed and was closed by GitLab when we deleted branch
  const pr = await getBranchPr(branchName);
  // istanbul ignore if
  if (pr) {
    logger.debug('Reopening PR');
    await reopenPr(pr.number);
  }
  return res;
}

// GET /projects/:id/repository/commits
async function getCommitMessages() {
  logger.debug('getCommitMessages');
  const res = await get(`projects/${config.repository}/repository/commits`);
  return res.body.map(commit => commit.title);
}

function getBranchDetails(branchName) {
  const url = `/projects/${config.repository}/repository/branches/${urlEscape(
    branchName
  )}`;
  return get(url);
}

async function getBaseCommitSHA() {
  if (!config.baseCommitSHA) {
    const branchDetails = await getBranchDetails(config.baseBranch);
    config.baseCommitSHA = branchDetails.body.commit.id;
  }
  return config.baseCommitSHA;
}

function getVulnerabilityAlerts() {
  return [];
}
