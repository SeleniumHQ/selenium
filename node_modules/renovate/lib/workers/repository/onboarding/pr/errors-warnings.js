function getWarnings(config) {
  if (!config.warnings.length) {
    return '';
  }
  let warningText = `\n# Warnings (${config.warnings.length})\n\n`;
  warningText += `Please correct - or verify that you can safely ignore - these warnings before you merge this PR.\n\n`;
  config.warnings.forEach(w => {
    warningText += `-   \`${w.depName}\`: ${w.message}\n`;
  });
  warningText += '\n---\n';
  return warningText;
}

function getErrors(config) {
  let errorText = '';
  if (!config.errors.length) {
    return '';
  }
  errorText = `\n# Errors (${config.errors.length})\n\n`;
  errorText += `Renovate has found errors that you should fix (in this branch) before finishing this PR.\n\n`;
  config.errors.forEach(e => {
    errorText += `-   \`${e.depName}\`: ${e.message}\n`;
  });
  errorText += '\n---\n';
  return errorText;
}

module.exports = {
  getWarnings,
  getErrors,
};
