const minimatch = require('minimatch');
const path = require('path');
const upath = require('upath');

module.exports = {
  detectMonorepos,
};

function matchesAnyPattern(val, patterns) {
  const res = patterns.some(
    pattern => pattern === val + '/' || minimatch(val, pattern)
  );
  logger.trace({ val, patterns, res }, `matchesAnyPattern`);
  return res;
}

function detectMonorepos(packageFiles) {
  logger.debug('Detecting Lerna and Yarn Workspaces');
  for (const p of packageFiles) {
    const {
      packageFile,
      npmLock,
      yarnLock,
      lernaDir,
      lernaClient,
      lernaPackages,
      yarnWorkspacesPackages,
    } = p;
    const basePath = path.dirname(packageFile);
    const packages = yarnWorkspacesPackages || lernaPackages;
    if (packages && packages.length) {
      logger.debug(
        { packageFile },
        'Found monorepo packages with base path ' + basePath
      );
      const internalPackagePatterns = packages.map(pattern =>
        upath.join(basePath, pattern)
      );
      const internalPackageFiles = packageFiles.filter(sp =>
        matchesAnyPattern(path.dirname(sp.packageFile), internalPackagePatterns)
      );
      const internalPackages = internalPackageFiles
        .map(sp => sp.packageJsonName)
        .filter(Boolean);
      // add all names to main package.json
      packageFile.internalPackages = internalPackages;
      for (const subPackage of internalPackageFiles) {
        subPackage.internalPackages = internalPackages.filter(
          name => name !== subPackage.packageJsonName
        );
        subPackage.lernaDir = lernaDir;
        subPackage.lernaClient = lernaClient;
        subPackage.yarnLock = subPackage.yarnLock || yarnLock;
        subPackage.npmLock = subPackage.npmLock || npmLock;
      }
    }
  }
}
