const managerList = [
  'bazel',
  'buildkite',
  'circleci',
  'composer',
  'docker-compose',
  'dockerfile',
  'gitlabci',
  'kubernetes',
  'meteor',
  'npm',
  'nvm',
  'pip_requirements',
  'travis',
  'nuget',
];
const managers = {};
for (const manager of managerList) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  managers[manager] = require(`./${manager}`);
}

const languageList = ['docker', 'js', 'node', 'php', 'python'];

const get = (manager, name) => managers[manager][name];
const getLanguageList = () => languageList;
const getManagerList = () => managerList;

module.exports = {
  get,
  getLanguageList,
  getManagerList,
};

const managerFunctions = [
  'extractDependencies',
  'postExtract',
  'getPackageUpdates',
  'updateDependency',
  'supportsLockFileMaintenance',
];

for (const f of managerFunctions) {
  module.exports[f] = (manager, ...params) => {
    if (managers[manager][f]) {
      return managers[manager][f](...params);
    }
    return null;
  };
}

module.exports.getRangeStrategy = config => {
  const { manager, rangeStrategy } = config;
  if (managers[manager].getRangeStrategy) {
    // Use manager's own function if it exists
    return managers[manager].getRangeStrategy(config);
  }
  if (rangeStrategy === 'auto') {
    // default to 'replace' for auto
    return 'replace';
  }
  return config.rangeStrategy;
};
