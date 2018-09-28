const semver = require('../../versioning/semver');

module.exports = {
  extractDependencies,
};

function extractDependencies(content) {
  const dep = {
    depName: 'node',
    currentValue: content.trim(),
    purl: 'pkg:github/nodejs/node?sanitize=true',
    versionScheme: 'semver',
  };
  if (!semver.isVersion(dep.currentValue)) {
    dep.skipReason = 'unsupported-version';
  }
  return { deps: [dep] };
}
