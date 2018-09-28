const { isVersion } = require('../../versioning')('semver');

module.exports = {
  extractDependencies,
};

function extractDependencies(content) {
  logger.debug('nuget.extractDependencies()');
  const deps = [];

  let lineNumber = 0;
  for (const line of content.split('\n')) {
    const match = line.match(
      /<PackageReference.*Include\s*=\s*"([^"]+)".*Version\s*=\s*"([^"]+)"/
    );
    if (match) {
      const depName = match[1];
      const currentValue = match[2];
      const dep = {
        depType: 'nuget',
        depName,
        currentValue,
        lineNumber,
        purl: 'pkg:nuget/' + depName,
        versionScheme: 'semver',
      };
      if (!isVersion(currentValue)) {
        dep.skipReason = 'not-version';
      }
      deps.push(dep);
    }
    lineNumber += 1;
  }
  return { deps };
}
