const versioning = require('../../versioning');

const { isVersion } = versioning('semver');

module.exports = {
  extractDependencies,
};

function extractDependencies(content) {
  logger.debug('buildkite.extractDependencies()');
  logger.trace({ content });
  const deps = [];
  try {
    const lines = content.split('\n');
    for (let lineNumber = 0; lineNumber < lines.length; lineNumber += 1) {
      const line = lines[lineNumber];
      const plugins = line.match(/^\s*-?\s*plugins:\s*$/);
      if (plugins) {
        logger.trace(`Matched plugins on line ${lineNumber}`);
        const depLine = lines[lineNumber + 1];
        logger.debug(`serviceImageLine: "${depLine}"`);
        const depLineMatch = depLine.match(/^\s+([^#]+)#([^:]+):/);
        if (depLineMatch) {
          logger.trace('depLineMatch');
          lineNumber += 1;
          const [, depName, currentValue] = depLineMatch;
          let skipReason;
          let repo;
          if (depName.startsWith('https://') || depName.startsWith('git@')) {
            logger.debug({ dependency: depName }, 'Skipping git plugin');
            skipReason = 'git-plugin';
          } else if (!isVersion(currentValue)) {
            logger.debug(
              { currentValue },
              'Skipping non-pinned current version'
            );
            skipReason = 'invalid-version';
          } else {
            const splitName = depName.split('/');
            if (splitName.length === 1) {
              repo = `buildkite-plugins/${depName}-buildkite-plugin`;
            } else if (splitName.length === 2) {
              repo = `${depName}-buildkite-plugin`;
            } else {
              logger.warn(
                { dependency: depName },
                'Something is wrong with buildkite plugin name'
              );
              skipReason = 'unknown';
            }
          }
          deps.push({
            lineNumber,
            depName,
            purl: repo ? 'pkg:github/' + repo : undefined,
            versionScheme: 'semver',
            currentValue,
            skipReason,
          });
        }
      }
    }
  } catch (err) /* istanbul ignore next */ {
    logger.error(
      { err, message: err.message },
      'Error extracting buildkite plugins'
    );
  }
  if (!deps.length) {
    return null;
  }
  return { deps };
}
