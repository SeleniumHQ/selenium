const versioning = require('../../../versioning');

const sourceGithub = require('./source-github');

module.exports = {
  getChangeLogJSON,
};

async function getChangeLogJSON(args) {
  const { repositoryUrl, versionScheme, fromVersion, toVersion } = args;
  if (!repositoryUrl) {
    return null;
  }
  // releases is too noisy in the logs
  const { releases, ...param } = args;
  logger.debug({ args: param }, `getChangeLogJSON(args)`);
  const { equals } = versioning(versionScheme);
  if (!fromVersion || equals(fromVersion, toVersion)) {
    return null;
  }
  try {
    const res = await sourceGithub.getChangeLogJSON({ ...args });
    return res;
  } catch (err) /* istanbul ignore next */ {
    logger.error({ err }, 'getChangeLogJSON error');
    return null;
  }
}
