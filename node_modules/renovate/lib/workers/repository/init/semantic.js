const conventionalCommitsDetector = require('conventional-commits-detector');

async function detectSemanticCommits(config) {
  logger.debug('detectSemanticCommits()');
  logger.trace({ config });
  if (config.semanticCommits !== null) {
    logger.debug(
      { semanticCommits: config.semanticCommits },
      `semanticCommits already defined`
    );
    return config.semanticCommits;
  }
  const commitMessages = await platform.getCommitMessages();
  if (commitMessages) {
    commitMessages.length = 10;
  }
  logger.trace(`commitMessages=${JSON.stringify(commitMessages)}`);
  const type = conventionalCommitsDetector(commitMessages);
  logger.debug('Semantic commits detection: ' + type);
  if (type === 'angular') {
    logger.debug('angular semantic commits detected');
    return true;
  }
  logger.debug('No semantic commits detected');
  return false;
}

module.exports = {
  detectSemanticCommits,
};
