const is = require('@sindresorhus/is');
const later = require('later');
const deepcopy = require('deepcopy');
const options = require('./definitions').getOptions();

let optionTypes;

module.exports = {
  migrateConfig,
};

const removedOptions = [
  'maintainYarnLock',
  'yarnCacheFolder',
  'yarnMaintenanceBranchName',
  'yarnMaintenanceCommitMessage',
  'yarnMaintenancePrTitle',
  'yarnMaintenancePrBody',
  'groupBranchName',
  'groupBranchName',
  'groupCommitMessage',
  'groupPrTitle',
  'groupPrBody',
];

// Returns a migrated config
function migrateConfig(config) {
  try {
    if (!optionTypes) {
      optionTypes = {};
      options.forEach(option => {
        optionTypes[option.name] = option.type;
      });
    }
    let isMigrated = false;
    const migratedConfig = deepcopy(config);
    const depTypes = [
      'dependencies',
      'devDependencies',
      'optionalDependencies',
      'peerDependencies',
    ];
    for (const [key, val] of Object.entries(config)) {
      if (removedOptions.includes(key)) {
        isMigrated = true;
        delete migratedConfig[key];
      } else if (key === 'pathRules') {
        isMigrated = true;
        if (is.array(val)) {
          migratedConfig.packageRules = migratedConfig.packageRules || [];
          const migratedPathRules = migratedConfig.pathRules.map(
            p => migrateConfig(p).migratedConfig
          );
          migratedConfig.packageRules = migratedPathRules.concat(
            migratedConfig.packageRules
          );
        }
        delete migratedConfig.pathRules;
      } else if (key === 'packageFiles' && is.array(val)) {
        isMigrated = true;
        const fileList = [];
        for (const packageFile of val) {
          if (is.object(packageFile) && !is.array(packageFile)) {
            fileList.push(packageFile.packageFile);
            if (Object.keys(packageFile).length > 1) {
              migratedConfig.packageRules = migratedConfig.packageRules || [];
              const payload = migrateConfig(packageFile).migratedConfig;
              for (const subrule of payload.packageRules || []) {
                subrule.paths = [packageFile.packageFile];
                migratedConfig.packageRules.push(subrule);
              }
              delete payload.packageFile;
              delete payload.packageRules;
              if (Object.keys(payload).length) {
                migratedConfig.packageRules.push({
                  ...payload,
                  paths: [packageFile.packageFile],
                });
              }
            }
          } else {
            fileList.push(packageFile);
          }
        }
        migratedConfig.includePaths = fileList;
        delete migratedConfig.packageFiles;
      } else if (depTypes.includes(key)) {
        isMigrated = true;
        migratedConfig.packageRules = migratedConfig.packageRules || [];
        const depTypePackageRule = migrateConfig(val).migratedConfig;
        depTypePackageRule.depTypeList = [key];
        delete depTypePackageRule.packageRules;
        migratedConfig.packageRules.push(depTypePackageRule);
        delete migratedConfig[key];
      } else if (key === 'pinVersions') {
        isMigrated = true;
        delete migratedConfig.pinVersions;
        if (val === true) {
          migratedConfig.rangeStrategy = 'pin';
        } else if (val === false) {
          migratedConfig.rangeStrategy = 'replace';
        }
      } else if (key === 'upgradeInRange') {
        isMigrated = true;
        delete migratedConfig.upgradeInRange;
        if (val === true) {
          migratedConfig.rangeStrategy = 'bump';
        }
      } else if (key === 'versionStrategy') {
        isMigrated = true;
        delete migratedConfig.versionStrategy;
        if (val === 'widen') {
          migratedConfig.rangeStrategy = 'widen';
        }
      } else if (key === 'semanticPrefix') {
        isMigrated = true;
        delete migratedConfig.semanticPrefix;
        let [text] = val.split(':');
        text = text.split('(');
        [migratedConfig.semanticCommitType] = text;
        if (text.length > 1) {
          [migratedConfig.semanticCommitScope] = text[1].split(')');
        } else {
          migratedConfig.semanticCommitScope = null;
        }
      } else if (key === 'extends' && is.array(val)) {
        for (let i = 0; i < val.length; i += 1) {
          if (val[i] === 'config:application' || val[i] === ':js-app') {
            isMigrated = true;
            migratedConfig.extends[i] = 'config:js-app';
          } else if (val[i] === ':library' || val[i] === 'config:library') {
            isMigrated = true;
            migratedConfig.extends[i] = 'config:js-lib';
          }
        }
      } else if (key === 'automergeType' && val.startsWith('branch-')) {
        isMigrated = true;
        migratedConfig.automergeType = 'branch';
      } else if (key === 'automergeMinor') {
        isMigrated = true;
        migratedConfig.minor = migratedConfig.minor || {};
        migratedConfig.minor.automerge = val == true; // eslint-disable-line eqeqeq
        delete migratedConfig[key];
      } else if (key === 'automergeMajor') {
        isMigrated = true;
        migratedConfig.major = migratedConfig.major || {};
        migratedConfig.major.automerge = val == true; // eslint-disable-line eqeqeq
        delete migratedConfig[key];
      } else if (key === 'multipleMajorPrs') {
        isMigrated = true;
        delete migratedConfig.multipleMajorPrs;
        migratedConfig.separateMultipleMajor = val;
      } else if (key === 'separateMajorReleases') {
        isMigrated = true;
        delete migratedConfig.separateMultipleMajor;
        migratedConfig.separateMajorMinor = val;
      } else if (key === 'separatePatchReleases') {
        isMigrated = true;
        delete migratedConfig.separatePatchReleases;
        migratedConfig.separateMinorPatch = val;
      } else if (key === 'automergePatch') {
        isMigrated = true;
        migratedConfig.patch = migratedConfig.patch || {};
        migratedConfig.patch.automerge = val == true; // eslint-disable-line eqeqeq
        delete migratedConfig[key];
      } else if (key === 'ignoreNodeModules') {
        isMigrated = true;
        delete migratedConfig.ignoreNodeModules;
        migratedConfig.ignorePaths = val ? ['node_modules/'] : [];
      } else if (
        key === 'automerge' &&
        is.string(val) &&
        ['none', 'patch', 'minor', 'any'].includes(val)
      ) {
        delete migratedConfig.automerge;
        isMigrated = true;
        if (val === 'none') {
          migratedConfig.automerge = false;
        } else if (val === 'patch') {
          migratedConfig.patch = migratedConfig.patch || {};
          migratedConfig.patch.automerge = true;
          migratedConfig.minor = migratedConfig.minor || {};
          migratedConfig.minor.automerge = false;
          migratedConfig.major = migratedConfig.major || {};
          migratedConfig.major.automerge = false;
        } else if (val === 'minor') {
          migratedConfig.minor = migratedConfig.minor || {};
          migratedConfig.minor.automerge = true;
          migratedConfig.major = migratedConfig.major || {};
          migratedConfig.major.automerge = false;
        } else if (val === 'any') {
          migratedConfig.automerge = true;
        }
      } else if (key === 'packages') {
        isMigrated = true;
        migratedConfig.packageRules = migratedConfig.packageRules || [];
        migratedConfig.packageRules = migratedConfig.packageRules.concat(
          migratedConfig.packages.map(p => migrateConfig(p).migratedConfig)
        );
        delete migratedConfig.packages;
      } else if (key === 'excludedPackageNames') {
        isMigrated = true;
        migratedConfig.excludePackageNames = val;
        delete migratedConfig.excludedPackageNames;
      } else if (key === 'packageName') {
        isMigrated = true;
        migratedConfig.packageNames = [val];
        delete migratedConfig.packageName;
      } else if (key === 'packagePattern') {
        isMigrated = true;
        migratedConfig.packagePatterns = [val];
        delete migratedConfig.packagePattern;
      } else if (key === 'baseBranch') {
        isMigrated = true;
        migratedConfig.baseBranches = is.array(val) ? val : [val];
        delete migratedConfig.baseBranch;
      } else if (key === 'schedule' && !val) {
        isMigrated = true;
        migratedConfig.schedule = [];
      } else if (key === 'schedule') {
        // massage to array first
        const schedules = is.string(val) ? [val] : val;
        // split 'and'
        for (let i = 0; i < schedules.length; i += 1) {
          if (
            schedules[i].includes(' and ') &&
            schedules[i].includes('before ') &&
            schedules[i].includes('after ')
          ) {
            const parsedSchedule = later.parse.text(
              // We need to massage short hours first before we can parse it
              schedules[i].replace(/( \d?\d)((a|p)m)/g, '$1:00$2')
            ).schedules[0];
            // Only migrate if the after time is greater than before, e.g. "after 10pm and before 5am"
            if (
              parsedSchedule &&
              parsedSchedule.t_a &&
              parsedSchedule.t_b &&
              parsedSchedule.t_a[0] > parsedSchedule.t_b[0]
            ) {
              isMigrated = true;
              const toSplit = schedules[i];
              schedules[i] = toSplit
                .replace(
                  /^(after|before) (.*?) and (after|before) (.*?)( |$)(.*)/,
                  '$1 $2 $6'
                )
                .trim();
              schedules.push(
                toSplit
                  .replace(
                    /^(after|before) (.*?) and (after|before) (.*?)( |$)(.*)/,
                    '$3 $4 $6'
                  )
                  .trim()
              );
            }
          }
        }
        for (let i = 0; i < schedules.length; i += 1) {
          if (schedules[i].includes('on the last day of the month')) {
            isMigrated = true;
            schedules[i] = schedules[i].replace(
              'on the last day of the month',
              'on the first day of the month'
            );
          }
          if (schedules[i].includes('on every weekday')) {
            isMigrated = true;
            schedules[i] = schedules[i].replace(
              'on every weekday',
              'every weekday'
            );
          }
          if (schedules[i].endsWith(' every day')) {
            isMigrated = true;
            schedules[i] = schedules[i].replace(' every day', '');
          }
          if (
            schedules[i].match(
              /every (mon|tues|wednes|thurs|fri|satur|sun)day$/
            )
          ) {
            isMigrated = true;
            schedules[i] = schedules[i].replace(/every ([a-z]*day)$/, 'on $1');
          }
          if (schedules[i].endsWith('days')) {
            isMigrated = true;
            schedules[i] = schedules[i].replace('days', 'day');
          }
        }
        if (isMigrated) {
          if (is.string(val) && schedules.length === 1) {
            [migratedConfig.schedule] = schedules;
          } else {
            migratedConfig.schedule = schedules;
          }
        }
      } else if (is.string(val) && val.startsWith('{{semanticPrefix}}')) {
        isMigrated = true;
        migratedConfig[key] = val.replace(
          '{{semanticPrefix}}',
          '{{#if semanticCommitType}}{{semanticCommitType}}{{#if semanticCommitScope}}({{semanticCommitScope}}){{/if}}: {{/if}}'
        );
      } else if (key === 'depTypes' && is.array(val)) {
        val.forEach(depType => {
          if (is.object(depType) && !is.array(depType)) {
            const depTypeName = depType.depType;
            if (depTypeName) {
              migratedConfig.packageRules = migratedConfig.packageRules || [];
              const newPackageRule = migrateConfig(depType).migratedConfig;
              delete newPackageRule.depType;
              newPackageRule.depTypeList = [depTypeName];
              migratedConfig.packageRules.push(newPackageRule);
            }
          }
        });
        isMigrated = true;
        delete migratedConfig.depTypes;
      } else if (optionTypes[key] === 'json' && is.boolean(val)) {
        isMigrated = true;
        migratedConfig[key] = { enabled: val };
      } else if (optionTypes[key] === 'boolean') {
        if (val === 'true') {
          migratedConfig[key] = true;
        } else if (val === 'false') {
          migratedConfig[key] = false;
        }
      } else if (
        optionTypes[key] === 'string' &&
        is.array(val) &&
        val.length === 1
      ) {
        migratedConfig[key] = `${val[0]}`;
      } else if (key === 'node' && val.enabled === true) {
        isMigrated = true;
        delete migratedConfig.node.enabled;
        migratedConfig.travis = migratedConfig.travis || {};
        migratedConfig.travis.enabled = true;
        if (!Object.keys(migratedConfig.node).length) {
          delete migratedConfig.node;
        } else {
          const subMigrate = migrateConfig(migratedConfig.node);
          migratedConfig.node = subMigrate.migratedConfig;
        }
      } else if (is.array(val)) {
        const newArray = [];
        for (const item of migratedConfig[key]) {
          if (is.object(item) && !is.array(item)) {
            const arrMigrate = migrateConfig(item);
            newArray.push(arrMigrate.migratedConfig);
            if (arrMigrate.isMigrated) {
              isMigrated = true;
            }
          } else {
            newArray.push(item);
          }
        }
        migratedConfig[key] = newArray;
      } else if (is.object(val)) {
        const subMigrate = migrateConfig(migratedConfig[key]);
        if (subMigrate.isMigrated) {
          isMigrated = true;
          migratedConfig[key] = subMigrate.migratedConfig;
        }
      } else if (
        key.startsWith('commitMessage') &&
        val &&
        (val.includes('currentVersion') || val.includes('newVersion'))
      ) {
        isMigrated = true;
        migratedConfig[key] = val
          .replace(/currentVersion/g, 'currentValue')
          .replace(/newVersion/g, 'newValue')
          .replace(/newValueMajor/g, 'newMajor')
          .replace(/newValueMinor/g, 'newMinor');
      }
    }
    if (migratedConfig.endpoints) {
      migratedConfig.hostRules = migratedConfig.endpoints;
      delete migratedConfig.endpoints;
      isMigrated = true;
    }
    return { isMigrated, migratedConfig };
  } catch (err) /* istanbul ignore next */ {
    logger.debug({ config }, 'migrateConfig() error');
    throw err;
  }
}
