module.exports = {
  raiseDeprecationWarnings,
};

async function raiseDeprecationWarnings(config, packageFiles) {
  if (!config.raiseDeprecationWarnings) {
    return;
  }
  const deprecatedPackages = {};
  for (const [manager, files] of Object.entries(packageFiles)) {
    for (const packageFile of files) {
      for (const dep of packageFile.deps) {
        const { deprecationMessage } = dep;
        if (deprecationMessage) {
          deprecatedPackages[dep.depName] = deprecatedPackages[dep.depName] || {
            deprecationMessage,
            depPackageFiles: [],
          };
          deprecatedPackages[dep.depName].depPackageFiles.push(
            packageFile.packageFile
          );
        }
      }
    }
    logger.debug({ deprecatedPackages });
    for (const [depName, val] of Object.entries(deprecatedPackages)) {
      const { deprecationMessage, depPackageFiles } = val;
      logger.info(
        {
          depName,
          deprecationMessage,
          packageFiles: depPackageFiles,
        },
        'npm dependency is deprecated'
      );
      const issueTitle = `Dependency deprecation warning: ${depName} (${manager})`;
      let issueBody = deprecationMessage;
      issueBody += `\n\nPlease take the actions necessary to rename or substitute this deprecated package and commit to your base branch. If you wish to ignore this deprecation warning and continue using \`${depName}\` as-is, please add it to your [ignoreDeps](https://renovatebot.com/docs/configuration-options/#ignoredeps) array in Renovate config before closing this issue, otherwise another issue will be recreated the next time Renovate runs.`;
      issueBody += `\n\nAffected package file(s): ${depPackageFiles
        .map(f => '`' + f + '`')
        .join(', ')}`;
      await platform.ensureIssue(issueTitle, issueBody);
    }
  }
}
