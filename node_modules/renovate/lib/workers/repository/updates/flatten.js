const is = require('@sindresorhus/is');
const {
  getManagerConfig,
  mergeChildConfig,
  filterConfig,
} = require('../../../config');
const { applyPackageRules } = require('../../../util/package-rules');
const { get } = require('../../../manager');

module.exports = {
  flattenUpdates,
};

// Return only rules that contain an updateType
function getUpdateTypeRules(packageRules) {
  return packageRules.filter(rule => !is.empty(rule.updateTypes));
}

function flattenUpdates(config, packageFiles) {
  const updates = [];
  const updateTypes = [
    'major',
    'minor',
    'patch',
    'pin',
    'digest',
    'lockFileMaintenance',
  ];
  for (const [manager, files] of Object.entries(packageFiles)) {
    const managerConfig = getManagerConfig(config, manager);
    for (const packageFile of files) {
      const packageFileConfig = mergeChildConfig(managerConfig, packageFile);
      for (const dep of packageFile.deps) {
        if (dep.updates.length) {
          const depConfig = mergeChildConfig(packageFileConfig, dep);
          delete depConfig.deps;
          for (const update of dep.updates) {
            let updateConfig = mergeChildConfig(depConfig, update);
            delete updateConfig.updates;
            updateConfig = applyPackageRules(updateConfig);
            // Keep only rules that haven't been applied yet (with updateTypes)
            updateConfig.packageRules = getUpdateTypeRules(
              updateConfig.packageRules
            );
            // apply major/minor/patch/pin/digest
            updateConfig = mergeChildConfig(
              updateConfig,
              updateConfig[updateConfig.updateType]
            );
            for (const updateType of updateTypes) {
              delete updateConfig[updateType];
            }
            // Apply again in case any were added by the updateType config
            updateConfig = applyPackageRules(updateConfig);
            delete updateConfig.packageRules;
            updateConfig.depNameSanitized = updateConfig.depName
              ? updateConfig.depName
                  .replace('@types/', '')
                  .replace('@', '')
                  .replace('/', '-')
                  .replace(/\s+/g, '-')
                  .toLowerCase()
              : undefined;
            if (
              updateConfig.language === 'docker' &&
              updateConfig.depName.match(/(^|\/)node$/) &&
              updateConfig.depName !== 'calico/node'
            ) {
              updateConfig.managerBranchPrefix = '';
              updateConfig.depNameSanitized = 'node';
            }
            delete updateConfig.repoIsOnboarded;
            delete updateConfig.renovateJsonPresent;
            updates.push(updateConfig);
          }
        }
      }
      if (
        get(manager, 'supportsLockFileMaintenance') &&
        packageFileConfig.lockFileMaintenance.enabled
      ) {
        // Apply lockFileMaintenance config before packageRules
        let lockFileConfig = mergeChildConfig(
          packageFileConfig,
          packageFileConfig.lockFileMaintenance
        );
        lockFileConfig.updateType = 'lockFileMaintenance';
        lockFileConfig = applyPackageRules(lockFileConfig);
        // Apply lockFileMaintenance and packageRules again
        lockFileConfig = mergeChildConfig(
          lockFileConfig,
          lockFileConfig.lockFileMaintenance
        );
        lockFileConfig = applyPackageRules(lockFileConfig);
        // Remove unnecessary objects
        for (const updateType of updateTypes) {
          delete lockFileConfig[updateType];
        }
        delete lockFileConfig.packageRules;
        delete lockFileConfig.deps;
        updates.push(lockFileConfig);
      }
    }
  }
  return updates
    .filter(update => update.enabled)
    .map(update => filterConfig(update, 'branch'));
}
