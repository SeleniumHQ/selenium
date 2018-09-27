const detectIndent = require('detect-indent');
const is = require('@sindresorhus/is');

module.exports = {
  updateDependency,
};

function updateDependency(fileContent, upgrade) {
  try {
    logger.debug(`travis.updateDependency(): ${upgrade.newValue}`);
    const indent = detectIndent(fileContent).indent || '  ';
    let quote;
    if (is.string(upgrade.currentValue[0])) {
      quote =
        fileContent.split(`'`).length > fileContent.split(`"`).length
          ? `'`
          : `"`;
    } else {
      quote = '';
    }
    let newString = `node_js:\n`;
    upgrade.newValue.forEach(version => {
      newString += `${indent}- ${quote}${version}${quote}\n`;
    });
    return fileContent.replace(/node_js:(\n\s+-[^\n]+)+\n/, newString);
  } catch (err) {
    logger.info({ err }, 'Error setting new .travis.yml node versions');
    return null;
  }
}
