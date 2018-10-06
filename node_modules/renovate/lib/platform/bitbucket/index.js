const parseDiff = require('parse-diff');
const api = require('./bb-got-wrapper');
const utils = require('./utils');
const hostRules = require('../../util/host-rules');

let config = {};

module.exports = {
  // Initialization
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
  // Issue
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
  // Commits
  getCommitMessages,
  // vulnerability alerts
  getVulnerabilityAlerts,
};

// Get all repositories that the user has access to
async function getRepos(token, endpoint) {
  logger.debug('getRepos(token, endpoint)');
  const opts = hostRules.find({ platform: 'bitbucket' }, { token, endpoint });
  // istanbul ignore next
  if (!opts.token) {
    throw new Error('No token found for getRepos');
  }
  hostRules.update({ ...opts, platform: 'bitbucket', default: true });
  try {
    const repos = await utils.accumulateValues(
      `/2.0/repositories/?role=contributor`
    );
    return repos.map(repo => repo.full_name);
  } catch (err) /* istanbul ignore next */ {
    logger.error({ err }, `bitbucket getRepos error`);
    throw err;
  }
}

// Initialize bitbucket by getting base branch and SHA
async function initRepo({ repository, token, endpoint }) {
  logger.debug(`initRepo("${repository}")`);
  const opts = hostRules.find({ platform: 'bitbucket' }, { token, endpoint });
  // istanbul ignore next
  if (!opts.token) {
    throw new Error(`No token found for Bitbucket repository ${repository}`);
  }
  hostRules.update({ ...opts, platform: 'bitbucket', default: true });
  api.reset();
  config = {};
  // TODO: get in touch with @rarkins about lifting up the caching into the app layer
  config.repository = repository;
  const platformConfig = {};
  try {
    const info = utils.repoInfoTransformer(
      (await api.get(`/2.0/repositories/${repository}`)).body
    );
    platformConfig.privateRepo = info.privateRepo;
    platformConfig.isFork = info.isFork;
    platformConfig.repoFullName = info.repoFullName;
    config.owner = info.owner;
    logger.debug(`${repository} owner = ${config.owner}`);
    config.defaultBranch = info.mainbranch;
    config.baseBranch = config.defaultBranch;
    config.mergeMethod = info.mergeMethod;
  } catch (err) /* istanbul ignore next */ {
    if (err.statusCode === 404) {
      throw new Error('not-found');
    }
    logger.info({ err }, 'Unknown Bitbucket initRepo error');
    throw err;
  }
  delete config.issueList;
  delete config.prList;
  delete config.fileList;
  await Promise.all([getPrList(), getFileList()]);
  return platformConfig;
}

// Returns true if repository has rule enforcing PRs are up-to-date with base branch before merging
function getRepoForceRebase() {
  // BB doesnt have an option to flag staled branches
  return false;
}

async function setBaseBranch(branchName) {
  if (branchName) {
    logger.debug(`Setting baseBranch to ${branchName}`);
    config.baseBranch = branchName;
    delete config.baseCommitSHA;
    delete config.fileList;
    await getFileList(branchName);
  }
}

// Search

// Get full file list
async function getFileList(branchName) {
  const branch = branchName || config.baseBranch;
  config.fileList = config.fileList || {};
  if (config.fileList[branch]) {
    return config.fileList[branch];
  }
  try {
    const branchSha = await getBranchCommit(branch);
    const filesRaw = await utils.files(
      `/2.0/repositories/${config.repository}/src/${branchSha}/`
    );
    config.fileList[branch] = filesRaw.map(file => file.path);
  } catch (err) /* istanbul ignore next */ {
    logger.info(
      { repository: config.repository },
      'Error retrieving git tree - no files detected'
    );
    config.fileList[branch] = [];
  }
  return config.fileList[branch];
}

// Branch

// Returns true if branch exists, otherwise false
async function branchExists(branchName) {
  logger.debug(`branchExists(${branchName})`);
  try {
    const { name } = (await api.get(
      `/2.0/repositories/${config.repository}/refs/branches/${branchName}`
    )).body;
    return name === branchName;
  } catch (err) {
    if (err.statusCode === 404) {
      return false;
    }
    // istanbul ignore next
    throw err;
  }
}

// TODO rewrite mutating reduce to filter in other adapters
async function getAllRenovateBranches(branchPrefix) {
  logger.trace('getAllRenovateBranches');
  const allBranches = await utils.accumulateValues(
    `/2.0/repositories/${config.repository}/refs/branches`
  );
  return allBranches
    .map(branch => branch.name)
    .filter(name => name.startsWith(branchPrefix));
}

// Check if branch's parent SHA = master SHA
async function isBranchStale(branchName) {
  logger.debug(`isBranchStale(${branchName})`);
  const [branch, baseBranch] = (await Promise.all([
    api.get(
      `/2.0/repositories/${config.repository}/refs/branches/${branchName}`
    ),
    api.get(
      `/2.0/repositories/${config.repository}/refs/branches/${
        config.baseBranch
      }`
    ),
  ])).map(res => res.body);

  const branchParentCommit = branch.target.parents[0].hash;
  const baseBranchLatestCommit = baseBranch.target.hash;

  return branchParentCommit !== baseBranchLatestCommit;
}

// Returns the Pull Request for a branch. Null if not exists.
async function getBranchPr(branchName) {
  logger.debug(`getBranchPr(${branchName})`);
  const existingPr = await findPr(branchName, null, 'open');
  return existingPr ? getPr(existingPr.number) : null;
}

// Returns the combined status for a branch.
async function getBranchStatus(branchName, requiredStatusChecks) {
  logger.debug(`getBranchStatus(${branchName})`);
  if (!requiredStatusChecks) {
    // null means disable status checks, so it always succeeds
    logger.debug('Status checks disabled = returning "success"');
    return 'success';
  }
  if (requiredStatusChecks.length) {
    // This is Unsupported
    logger.warn({ requiredStatusChecks }, `Unsupported requiredStatusChecks`);
    return 'failed';
  }
  const sha = await getBranchCommit(branchName);
  const statuses = await utils.accumulateValues(
    `/2.0/repositories/${config.repository}/commit/${sha}/statuses`
  );
  const noOfFailures = statuses.filter(status => status.state === 'FAILED')
    .length;
  logger.debug(
    { branch: branchName, sha, statuses },
    'branch status check result'
  );
  if (noOfFailures) {
    return 'failed';
  }
  return 'success';
}

async function getBranchStatusCheck(branchName, context) {
  const sha = await getBranchCommit(branchName);
  const statuses = await utils.accumulateValues(
    `/2.0/repositories/${config.repository}/commit/${sha}/statuses`
  );
  const bbState = (statuses.find(status => status.key === context) || {}).state;

  return (
    Object.keys(utils.buildStates).find(
      stateKey => utils.buildStates[stateKey] === bbState
    ) || null
  );
}

async function setBranchStatus(
  branchName,
  context,
  description,
  state,
  targetUrl
) {
  const sha = await getBranchCommit(branchName);

  // TargetUrl can not be empty so default to bitbucket
  const url = targetUrl || 'http://bitbucket.org';

  const body = {
    name: context,
    state: utils.buildStates[state],
    key: context,
    description,
    url,
  };

  await api.post(
    `/2.0/repositories/${config.repository}/commit/${sha}/statuses/build`,
    { body }
  );
}

function deleteBranch(branchName) {
  return api.delete(
    `/2.0/repositories/${config.repository}/refs/branches/${branchName}`
  );
}

function mergeBranch() {
  // The api does not support merging branches, so any automerge must be done via PR
  return Promise.reject(new Error('Branch automerge not supported'));
}

function ensureIssue() {
  logger.warn('ensureIssue not implemented yet');
  return Promise.resolve();
}
function ensureIssueClosing() {
  return Promise.resolve();
}

async function getBranchLastCommitTime(branchName) {
  const branches = await utils.accumulateValues(
    `/2.0/repositories/${config.repository}/refs/branches`
  );
  const branch = branches.find(br => br.name === branchName) || {
    target: {},
  };
  return branch.target.date ? new Date(branch.target.date) : new Date();
}

function addAssignees() {
  // Bitbucket supports "participants" and "reviewers" so does not seem to have the concept of "assignee"
  logger.warn('Cannot add assignees');
  return Promise.resolve();
}

function addReviewers() {
  // TODO
  logger.warn('Cannot add reviewers');
  return Promise.resolve();
}

// istanbul ignore next
function deleteLabel() {
  throw new Error('deleteLabel not implemented');
}

function ensureComment() {
  // https://developer.atlassian.com/bitbucket/api/2/reference/search?q=pullrequest+comment
  logger.warn('Comment functionality not implemented yet');
  return Promise.resolve();
}

function ensureCommentRemoval() {
  // The api does not support removing comments
  return Promise.resolve();
}

const isRelevantPr = (branchName, prTitle, states) => p =>
  p.branchName === branchName &&
  (!prTitle || p.title === prTitle) &&
  states.includes(p.state);

async function findPr(branchName, prTitle, inputStates = utils.prStates.all) {
  let states;
  // istanbul ignore if
  if (inputStates === '!open') {
    states = utils.prStates.notOpen;
  } else {
    states = inputStates;
  }
  logger.debug(`findPr(${branchName}, ${prTitle}, ${states})`);
  const prList = await getPrList();
  const pr = prList.find(isRelevantPr(branchName, prTitle, states));
  if (pr) {
    logger.debug(`Found PR #${pr.number}`);
  }
  return pr;
}

// Creates PR and returns PR number
async function createPr(
  branchName,
  title,
  description,
  labels,
  useDefaultBranch = true
) {
  // labels is not supported in Bitbucket: https://bitbucket.org/site/master/issues/11976/ability-to-add-labels-to-pull-requests-bb

  const base = useDefaultBranch ? config.defaultBranch : config.baseBranch;

  logger.debug({ repository: config.repository, title, base }, 'Creating PR');

  const body = {
    title,
    description,
    source: {
      branch: {
        name: branchName,
      },
    },
    destination: {
      branch: {
        name: base,
      },
    },
    close_source_branch: true,
  };

  const prInfo = (await api.post(
    `/2.0/repositories/${config.repository}/pullrequests`,
    { body }
  )).body;
  return { id: prInfo.id, displayNumber: `Pull Request #${prInfo.id}` };
}

async function isPrConflicted(prNo) {
  const diff = (await api.get(
    `/2.0/repositories/${config.repository}/pullrequests/${prNo}/diff`,
    { json: false }
  )).body;

  return utils.isConflicted(parseDiff(diff));
}

// Gets details for a PR
async function getPr(prNo) {
  const pr = (await api.get(
    `/2.0/repositories/${config.repository}/pullrequests/${prNo}`
  )).body;

  // istanbul ignore if
  if (!pr) {
    return null;
  }

  const res = {
    displayNumber: `Pull Request #${pr.id}`,
    ...utils.prInfo(pr),
  };

  if (utils.prStates.open.includes(pr.state)) {
    res.isConflicted = await isPrConflicted(prNo);
    const commits = await utils.accumulateValues(pr.links.commits.href);
    if (commits.length === 1) {
      res.canRebase = true;
    }
  }

  res.isStale = await isBranchStale(pr.source.branch.name);

  return res;
}

// Return a list of all modified files in a PR
async function getPrFiles(prNo) {
  logger.debug({ prNo }, 'getPrFiles');
  const diff = (await api.get(
    `/2.0/repositories/${config.repository}/pullrequests/${prNo}/diff`,
    { json: false }
  )).body;
  const files = parseDiff(diff).map(file => file.to);
  return files;
}

async function updatePr(prNo, title, description) {
  logger.debug(`updatePr(${prNo}, ${title}, body)`);
  await api.put(`/2.0/repositories/${config.repository}/pullrequests/${prNo}`, {
    body: { title, description },
  });
}

async function mergePr(prNo, branchName) {
  logger.debug(`mergePr(${prNo}, ${branchName})`);

  try {
    await api.post(
      `/2.0/repositories/${config.repository}/pullrequests/${prNo}/merge`,
      {
        body: {
          close_source_branch: true,
          merge_strategy: 'merge_commit',
          message: 'auto merged',
        },
      }
    );
    delete config.baseCommitSHA;
    logger.info('Automerging succeeded');
  } catch (err) /* istanbul ignore next */ {
    return false;
  }
  return true;
}

function getPrBody(input) {
  // Remove any HTML we use
  return input
    .replace(/<\/?summary>/g, '**')
    .replace(/<\/?details>/g, '')
    .substring(0, 50000);
}

// Return the commit SHA for a branch
async function getBranchCommit(branchName) {
  try {
    const branch = (await api.get(
      `/2.0/repositories/${config.repository}/refs/branches/${branchName}`
    )).body;
    return branch.target.hash;
  } catch (err) /* istanbul ignore next */ {
    logger.debug({ err }, `getBranchCommit('${branchName}') failed'`);
    return null;
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
  if (branchName !== parentBranch && (await branchExists(branchName))) {
    logger.debug('Deleting existing branch');
    await deleteBranch(branchName);
    delete config.fileList[branchName];
  }
  const parents = await getBranchCommit(parentBranch);

  const form = utils.commitForm({
    message,
    gitAuthor: config.gitAuthor,
    parents,
    branchName,
    files,
  });

  await api.post(`/2.0/repositories/${config.repository}/src`, {
    json: false,
    body: form,
  });
}

// Generic File operations
async function getFile(filePath, branchName) {
  logger.debug(`getFile(filePath=${filePath}, branchName=${branchName})`);
  if (!branchName || branchName === config.baseBranch) {
    const fileList = await getFileList(branchName);
    if (!fileList.includes(filePath)) {
      return null;
    }
  }
  try {
    const branchSha = await getBranchCommit(branchName || config.baseBranch);
    const file = (await api.get(
      `/2.0/repositories/${config.repository}/src/${branchSha}/${filePath}`,
      { json: false }
    )).body;
    return file;
  } catch (err) {
    if (err.statusCode === 404) {
      return null;
    }
    throw err;
  }
}

async function getCommitMessages() {
  logger.debug('getCommitMessages');
  const values = await utils.accumulateValues(
    `/2.0/repositories/${config.repository}/commits`
  );
  return values.map(commit => commit.message);
}

// Pull Request

async function getPrList(state = utils.prStates.open) {
  logger.debug('getPrList()');
  if (!config.prList) {
    logger.debug('Retrieving PR list');
    const prs = await utils.accumulateValues(
      `/2.0/repositories/${config.repository}/pullrequests?state=${state}`,
      undefined,
      undefined,
      50
    );
    config.prList = prs.map(utils.prInfo);
    logger.info({ length: config.prList.length }, 'Retrieved Pull Requests');
  }
  return config.prList;
}

function cleanRepo() {
  api.reset();
  config = {};
}

function getVulnerabilityAlerts() {
  return [];
}
