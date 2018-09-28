module.exports = {
  updateDependency,
};

function updateDependency(fileContent, upgrade) {
  const { depName, currentValue, newValue } = upgrade;
  logger.debug(`meteor.updateDependency(): ${depName} = ${newValue}`);
  const regexReplace = new RegExp(
    `('|")(${depName})('|"):(\\s+)('|")${currentValue}('|")`
  );
  const newFileContent = fileContent.replace(
    regexReplace,
    `$1$2$3:$4$5${newValue}$6`
  );
  return newFileContent;
}
