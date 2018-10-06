const path = require('path');
const upath = require('upath');
const { getLockedVersions } = require('./locked-versions');
const { detectMonorepos } = require('./monorepo');
const { mightBeABrowserLibrary } = require('./type');
const versioning = require('../../../versioning');

const semver = versioning('semver');

module.exports = {
  extractDependencies,
  postExtract,
};

async function extractDependencies(content, fileName, config) {
  logger.debug(`npm.extractDependencies(${fileName})`);
  logger.trace({ content });
  const deps = [];
  let packageJson;
  try {
    packageJson = JSON.parse(content);
  } catch (err) {
    logger.info({ fileName }, 'Invalid JSON');
    return null;
  }
  // eslint-disable-next-line no-underscore-dangle
  if (packageJson._id && packageJson._args && packageJson._from) {
    logger.info('Ignoring vendorised package.json');
    return null;
  }
  if (fileName !== 'package.json' && packageJson.renovate) {
    const error = new Error('config-validation');
    error.configFile = fileName;
    error.validationError =
      'Nested package.json must not contain renovate configuration. Please use `packageRules` with `paths` in your main config instead.';
    throw error;
  }
  const packageJsonName = packageJson.name;
  const packageJsonVersion = packageJson.version;
  let yarnWorkspacesPackages;
  if (packageJson.workspaces && packageJson.workspaces.packages) {
    yarnWorkspacesPackages = packageJson.workspaces.packages;
  } else {
    yarnWorkspacesPackages = packageJson.workspaces;
  }
  const packageJsonType = mightBeABrowserLibrary(packageJson)
    ? 'library'
    : 'app';

  const lockFiles = {
    yarnLock: 'yarn.lock',
    packageLock: 'package-lock.json',
    shrinkwrapJson: 'npm-shrinkwrap.json',
    pnpmShrinkwrap: 'shrinkwrap.yaml',
  };

  for (const [key, val] of Object.entries(lockFiles)) {
    const filePath = upath.join(path.dirname(fileName), val);
    if (await platform.getFile(filePath)) {
      lockFiles[key] = filePath;
    } else {
      lockFiles[key] = undefined;
    }
  }
  lockFiles.npmLock = lockFiles.packageLock || lockFiles.shrinkwrapJson;
  delete lockFiles.packageLock;
  delete lockFiles.shrinkwrapJson;

  let npmrc;
  if (!config.ignoreNpmrcFile) {
    npmrc = await platform.getFile(
      upath.join(path.dirname(fileName), '.npmrc')
    );
    if (npmrc && npmrc.includes('package-lock')) {
      logger.info('Stripping package-lock setting from npmrc');
      npmrc = npmrc.replace(/(^|\n)package-lock.*?(\n|$)/g, '');
    }
    if (npmrc) {
      if (
        npmrc.includes('=${') &&
        !(config.global && config.global.exposeEnv)
      ) {
        logger.info('Discarding .npmrc file with variables');
        npmrc = undefined;
      }
    } else {
      npmrc = undefined;
    }
  }
  const yarnrc =
    (await platform.getFile(upath.join(path.dirname(fileName), '.yarnrc'))) ||
    undefined;

  let lernaDir;
  let lernaPackages;
  let lernaClient;
  let skipInstalls = true;
  const lernaJson = JSON.parse(
    await platform.getFile(upath.join(path.dirname(fileName), 'lerna.json'))
  );
  if (lernaJson) {
    lernaDir = path.dirname(fileName);
    lernaPackages = lernaJson.packages;
    lernaClient = lernaJson.npmClient || 'npm';
  }

  const depTypes = {
    dependencies: 'dependency',
    devDependencies: 'devDependency',
    optionalDependencies: 'optionalDependency',
    peerDependencies: 'peerDependency',
    engines: 'engine',
  };

  function extractDependency(depType, depName, input) {
    const dep = {};
    dep.currentValue = input.trim();
    if (depType === 'engines') {
      if (depName === 'node') {
        dep.purl = 'pkg:github/nodejs/node?sanitize=true';
      } else if (depName === 'yarn') {
        dep.purl = 'pkg:npm/yarn';
        dep.commitMessageTopic = 'Yarn';
      } else if (depName === 'npm') {
        dep.purl = 'pkg:npm/npm';
        dep.commitMessageTopic = 'npm';
      } else {
        dep.skipReason = 'unknown-engines';
      }
      if (!semver.isValid(dep.currentValue)) {
        dep.skipReason = 'unknown-version';
      }
      return dep;
    }
    if (dep.currentValue.startsWith('file:')) {
      dep.skipReason = 'file';
      skipInstalls = false;
      return dep;
    }
    if (semver.isValid(dep.currentValue)) {
      dep.purl = `pkg:npm/${depName.replace('@', '%40')}`;
      if (dep.currentValue === '*') {
        dep.skipReason = 'any-version';
      }
      if (dep.currentValue === '') {
        dep.skipReason = 'empty';
      }
      return dep;
    }
    const hashSplit = dep.currentValue.split('#');
    if (hashSplit.length !== 2) {
      dep.skipReason = 'unknown-version';
      return dep;
    }
    const [depNamePart, depRefPart] = hashSplit;
    const githubOwnerRepo = depNamePart
      .replace(/^github:/, '')
      .replace(/^git\+/, '')
      .replace(/^https:\/\/github\.com\//, '')
      .replace(/\.git$/, '');
    const githubRepoSplit = githubOwnerRepo.split('/');
    if (githubRepoSplit.length !== 2) {
      dep.skipReason = 'unknown-version';
      return dep;
    }
    const [githubOwner, githubRepo] = githubRepoSplit;
    const githubValidRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/;
    if (
      !githubOwner.match(githubValidRegex) ||
      !githubRepo.match(githubValidRegex)
    ) {
      dep.skipReason = 'unknown-version';
      return dep;
    }
    if (semver.isVersion(depRefPart)) {
      dep.currentRawValue = dep.currentValue;
      dep.currentValue = depRefPart;
      dep.purl = `pkg:github/${githubOwnerRepo}?ref=tags`;
      dep.pinDigests = false;
    } else if (
      depRefPart.match(/^[0-9a-f]{7}$/) ||
      depRefPart.match(/^[0-9a-f]{40}$/)
    ) {
      dep.currentRawValue = dep.currentValue;
      dep.currentValue = null;
      dep.currentDigest = depRefPart;
      dep.purl = `pkg:github/${githubOwnerRepo}`;
    } else {
      dep.skipReason = 'unversioned-reference';
      return dep;
    }
    dep.githubRepo = githubOwnerRepo;
    dep.repositoryUrl = `https://github.com/${githubOwnerRepo}`;
    dep.gitRef = true;
    return dep;
  }

  for (const depType of Object.keys(depTypes)) {
    if (packageJson[depType]) {
      try {
        for (const [depName, val] of Object.entries(packageJson[depType])) {
          const dep = {
            depType,
            depName,
            versionScheme: 'semver',
          };
          Object.assign(dep, extractDependency(depType, depName, val));
          if (depName === 'node') {
            // This is a special case for Node.js to group it together with other managers
            dep.commitMessageTopic = 'Node.js';
            dep.major = { enabled: false };
          }
          dep.prettyDepType = depTypes[depType];
          deps.push(dep);
        }
      } catch (err) /* istanbul ignore next */ {
        logger.info(
          { fileName, depType, err, message: err.message },
          'Error parsing package.json'
        );
        return null;
      }
    }
  }
  if (deps.length === 0) {
    logger.debug('Package file has no deps');
    if (
      !(
        packageJsonName ||
        packageJsonVersion ||
        npmrc ||
        lernaDir ||
        yarnWorkspacesPackages
      )
    ) {
      logger.debug('Skipping file');
      return null;
    }
  }
  return {
    deps,
    packageJsonName,
    packageJsonVersion,
    packageJsonType,
    npmrc,
    yarnrc,
    ...lockFiles,
    lernaDir,
    lernaClient,
    lernaPackages,
    skipInstalls: config.skipInstalls && skipInstalls,
    yarnWorkspacesPackages,
  };
}

async function postExtract(packageFiles) {
  await detectMonorepos(packageFiles);
  await getLockedVersions(packageFiles);
}
