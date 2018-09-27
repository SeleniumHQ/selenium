const { getDep } = require('../dockerfile/extract');

module.exports = {
  extractDependencies,
};

function extractDependencies(content) {
  const deps = [];
  try {
    const lines = content.split('\n');
    for (let lineNumber = 0; lineNumber < lines.length; lineNumber += 1) {
      const line = lines[lineNumber];
      const imageMatch = line.match(/^\s*image:\s*'?"?([^\s]+)'?"?\s*$/);
      if (imageMatch) {
        logger.trace(`Matched image on line ${lineNumber}`);
        const currentFrom = imageMatch[1];
        const dep = getDep(currentFrom);
        dep.lineNumber = lineNumber;
        dep.depType = 'image';
        deps.push(dep);
      }
      const services = line.match(/^\s*services:\s*$/);
      if (services) {
        logger.trace(`Matched services on line ${lineNumber}`);
        let foundImage;
        do {
          foundImage = false;
          const serviceImageLine = lines[lineNumber + 1];
          logger.trace(`serviceImageLine: "${serviceImageLine}"`);
          const serviceImageMatch = serviceImageLine.match(
            /^\s*-\s*'?"?([^\s'"]+)'?"?\s*$/
          );
          if (serviceImageMatch) {
            logger.trace('serviceImageMatch');
            foundImage = true;
            const currentFrom = serviceImageMatch[1];
            lineNumber += 1;
            const dep = getDep(currentFrom);
            dep.lineNumber = lineNumber;
            dep.depType = 'service-image';
            deps.push(dep);
          }
        } while (foundImage);
      }
    }
  } catch (err) /* istanbul ignore next */ {
    logger.error(
      { err, message: err.message },
      'Error extracting GitLab CI dependencies'
    );
  }
  if (!deps.length) {
    return null;
  }
  return { deps };
}
