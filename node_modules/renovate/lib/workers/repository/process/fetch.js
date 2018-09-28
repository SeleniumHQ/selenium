const is = require('@sindresorhus/is');
const pAll = require('p-all');

const { getPackageUpdates } = require('../../../manager');
const { mergeChildConfig } = require('../../../config');
const { applyPackageRules } = require('../../../util/package-rules');
const { getManagerConfig } = require('../../../config');
const { lookupUpdates } = require('./lookup');

module.exports = {
  fetchUpdates,
};

async function fetchDepUpdates(packageFileConfig, dep) {
  /* eslint-disable no-param-reassign */
  dep.updates = [];
  if (dep.skipReason) {
    return;
  }
  const { manager, packageFile } = packageFileConfig;
  const { depName, currentValue } = dep;
  let depConfig = mergeChildConfig(packageFileConfig, dep);
  depConfig = applyPackageRules(depConfig);
  if (depConfig.ignoreDeps.includes(depName)) {
    logger.debug({ dependency: dep.depName }, 'Dependency is ignored');
    dep.skipReason = 'ignored';
  } else if (
    depConfig.internalPackages &&
    depConfig.internalPackages.includes(depName)
  ) {
    logger.debug(
      { dependency: dep.depName },
      'Dependency is ignored due to being internal'
    );
    dep.skipReason = 'internal-package';
  } else if (depConfig.enabled === false) {
    logger.debug({ dependency: dep.depName }, 'Dependency is disabled');
    dep.skipReason = 'disabled';
  } else {
    let lookupResults;
    if (depConfig.purl) {
      lookupResults = await lookupUpdates(depConfig);
    } else {
      lookupResults = await getPackageUpdates(manager, depConfig);
    }
    // istanbul ignore else
    if (is.array(lookupResults)) {
      dep.updates = lookupResults;
    } else {
      Object.assign(dep, lookupResults);
    }
    // istanbul ignore if
    if (dep.updates.length) {
      logger.debug(
        { dependency: depName },
        `${dep.updates.length} result(s): ${dep.updates.map(
          upgrade => upgrade.newValue
        )}`
      );
    }
    logger.trace({
      packageFile,
      manager,
      depName,
      currentValue,
      updates: dep.updates,
    });
  }
  /* eslint-enable no-param-reassign */
}

async function fetchManagerPackagerFileUpdates(config, managerConfig, pFile) {
  const packageFileConfig = mergeChildConfig(managerConfig, pFile);
  const queue = pFile.deps.map(dep => () =>
    fetchDepUpdates(packageFileConfig, dep)
  );
  await pAll(queue, { concurrency: 10 });
}

async function fetchManagerUpdates(config, packageFiles, manager) {
  const managerConfig = getManagerConfig(config, manager);
  const queue = packageFiles[manager].map(pFile => () =>
    fetchManagerPackagerFileUpdates(config, managerConfig, pFile)
  );
  await pAll(queue, { concurrency: 5 });
}

async function fetchUpdates(config, packageFiles) {
  logger.debug(`manager.fetchUpdates()`);
  const allManagerJobs = Object.keys(packageFiles).map(manager =>
    fetchManagerUpdates(config, packageFiles, manager)
  );
  await Promise.all(allManagerJobs);
}
