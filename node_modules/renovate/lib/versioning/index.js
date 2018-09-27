const docker = require('./docker');
const semver = require('./semver');
const semverComposer = require('./semver-composer');
const pep440 = require('./pep440');

const schemes = {
  docker,
  semver,
  semverComposer,
  pep440,
};

module.exports = function getVersionScheme(versionScheme) {
  if (!versionScheme) {
    logger.debug('Missing versionScheme');
    return semver;
  }
  const scheme = schemes[versionScheme];
  if (!scheme) {
    logger.warn({ versionScheme }, 'Unknown version scheme');
    return semver;
  }
  return scheme;
};
