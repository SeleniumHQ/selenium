const semver = require('../semver');

const isValid = input => semver.isVersion(input);

module.exports = {
  ...semver,
  isValid,
};
