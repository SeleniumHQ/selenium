const parse = require('github-url-from-git');

module.exports = {
  extractDependencies,
};

function extractDependencies(content) {
  const definitions = content.match(
    /(git_repository|http_archive)\(([\s\S]*?)\n\)\n?/g
  );
  if (!definitions) {
    logger.debug('No matching WORKSPACE definitions found');
    return null;
  }
  logger.debug({ definitions }, `Found ${definitions.length} definitions`);
  const deps = [];
  definitions.forEach(def => {
    logger.debug({ def }, 'Checking bazel definition');
    const dep = { def, versionScheme: 'semver' };
    let depName;
    let remote;
    let currentValue;
    let url;
    let sha256;
    let match = def.match(/name = "([^"]+)"/);
    if (match) {
      [, depName] = match;
    }
    match = def.match(/remote = "([^"]+)"/);
    if (match) {
      [, remote] = match;
    }
    match = def.match(/tag = "([^"]+)"/);
    if (match) {
      [, currentValue] = match;
    }
    match = def.match(/url = "([^"]+)"/);
    if (match) {
      [, url] = match;
    }
    match = def.match(/sha256 = "([^"]+)"/);
    if (match) {
      [, sha256] = match;
    }
    logger.debug({ dependency: depName, remote, currentValue });
    const urlPattern = /^https:\/\/github.com\/([^\\/]+\/[^\\/]+)\/releases\/download\/([^\\/]+)\/.*?\.tar\.gz$/;
    if (def.startsWith('git_repository') && depName && remote && currentValue) {
      dep.depType = 'git_repository';
      dep.depName = depName;
      dep.remote = remote;
      dep.currentValue = currentValue;
      const repo = parse(remote).substring('https://github.com/'.length);
      dep.purl = 'pkg:github/' + repo;
      deps.push(dep);
    } else if (
      def.startsWith('http_archive') &&
      depName &&
      url &&
      sha256 &&
      url.match(urlPattern)
    ) {
      match = url.match(urlPattern);
      dep.depType = 'http_archive';
      dep.depName = depName;
      [, dep.repo, dep.currentValue] = match;
      dep.purl = 'pkg:github/' + dep.repo + '?ref=release';
      deps.push(dep);
    } else {
      logger.info(
        { def },
        'Failed to find dependency in bazel WORKSPACE definition'
      );
    }
  });
  if (!deps.length) {
    return null;
  }
  return { deps };
}
