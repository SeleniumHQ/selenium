const { getDep } = require('../dockerfile/extract');

module.exports = {
  extractDependencies,
};

function extractDependencies(content) {
  logger.debug('docker-compose.extractDependencies()');
  let deps = [];
  let lineNumber = 0;
  for (const line of content.split('\n')) {
    const match = line.match(/^\s*image:\s*'?"?([^\s'"]+)'?"?\s*$/);
    if (match) {
      const currentFrom = match[1];
      const dep = getDep(currentFrom);
      logger.info(
        {
          dockerRegistry: dep.dockerRegistry,
          depName: dep.depName,
          currentTag: dep.currentTag,
          currentDigest: dep.currentDigest,
        },
        'Docker Compose image'
      );
      dep.lineNumber = lineNumber;
      deps.push(dep);
    }
    lineNumber += 1;
  }
  deps = deps.filter(dep => !(dep.currentTag && dep.currentTag.includes('${')));
  if (!deps.length) {
    return null;
  }
  return { deps };
}
