const handlebars = require('handlebars');
const { DateTime } = require('luxon');
const semver = require('semver');
const { mergeChildConfig } = require('../../../config');

function generateBranchConfig(branchUpgrades) {
  logger.debug(`generateBranchConfig(${branchUpgrades.length})`);
  logger.trace({ config: branchUpgrades });
  let config = {
    upgrades: [],
  };
  const hasGroupName = branchUpgrades[0].groupName !== null;
  logger.debug(`hasGroupName: ${hasGroupName}`);
  // Use group settings only if multiple upgrades or lazy grouping is disabled
  const depNames = [];
  const newValue = [];
  branchUpgrades.forEach(upg => {
    if (!depNames.includes(upg.depName)) {
      depNames.push(upg.depName);
    }
    if (upg.commitMessageExtra) {
      const extra = handlebars.compile(upg.commitMessageExtra)(upg);
      if (!newValue.includes(extra)) {
        newValue.push(extra);
      }
    }
  });
  const groupEligible =
    depNames.length > 1 ||
    newValue.length > 1 ||
    branchUpgrades[0].lazyGrouping === false;
  logger.debug(`groupEligible: ${groupEligible}`);
  const useGroupSettings = hasGroupName && groupEligible;
  logger.debug(`useGroupSettings: ${useGroupSettings}`);
  let releaseTimestamp;
  for (const branchUpgrade of branchUpgrades) {
    let upgrade = { ...branchUpgrade };
    upgrade.prettyDepType =
      upgrade.prettyDepType || upgrade.depType || 'dependency';
    if (useGroupSettings) {
      // Now overwrite original config with group config
      upgrade = mergeChildConfig(upgrade, upgrade.group);
      upgrade.isGroup = true;
    } else {
      delete upgrade.groupName;
    }
    // Delete group config regardless of whether it was applied
    delete upgrade.group;
    delete upgrade.lazyGrouping;
    const isTypesGroup =
      depNames.length === 2 &&
      !hasGroupName &&
      ((branchUpgrades[0].depName.startsWith('@types/') &&
        branchUpgrades[0].depName.endsWith(branchUpgrades[1].depName)) ||
        (branchUpgrades[1].depName.startsWith('@types/') &&
          branchUpgrades[1].depName.endsWith(branchUpgrades[0].depName)));
    // istanbul ignore else
    if (newValue.length > 1 && !isTypesGroup) {
      logger.debug({ newValue });
      delete upgrade.commitMessageExtra;
      upgrade.recreateClosed = true;
    } else if (semver.valid(newValue[0])) {
      upgrade.isRange = false;
    }
    // Use templates to generate strings
    logger.debug('Compiling branchName: ' + upgrade.branchName);
    upgrade.branchName = handlebars.compile(upgrade.branchName)(upgrade);
    if (upgrade.semanticCommits && !upgrade.commitMessagePrefix) {
      logger.debug('Upgrade has semantic commits enabled');
      let semanticPrefix = upgrade.semanticCommitType;
      if (upgrade.semanticCommitScope) {
        semanticPrefix += `(${handlebars.compile(upgrade.semanticCommitScope)(
          upgrade
        )})`;
      }
      upgrade.commitMessagePrefix = `${semanticPrefix}: `;
      upgrade.toLowerCase = upgrade.semanticCommitType.match(/[A-Z]/) === null;
    }
    // Compile a few times in case there are nested templates
    upgrade.commitMessage = handlebars.compile(upgrade.commitMessage || '')(
      upgrade
    );
    upgrade.commitMessage = handlebars.compile(upgrade.commitMessage)(upgrade);
    upgrade.commitMessage = handlebars.compile(upgrade.commitMessage)(upgrade);
    upgrade.commitMessage = upgrade.commitMessage.trim(); // Trim exterior whitespace
    upgrade.commitMessage = upgrade.commitMessage.replace(/\s+/g, ' '); // Trim extra whitespace inside string
    upgrade.commitMessage = upgrade.commitMessage.replace(
      /to vv(\d)/,
      'to v$1'
    );
    if (upgrade.toLowerCase) {
      // We only need to lowercvase the first line
      const splitMessage = upgrade.commitMessage.split('\n');
      splitMessage[0] = splitMessage[0].toLowerCase();
      upgrade.commitMessage = splitMessage.join('\n');
    }
    if (upgrade.commitBody) {
      upgrade.commitMessage = `${upgrade.commitMessage}\n\n${handlebars.compile(
        upgrade.commitBody
      )(upgrade)}`;
    }
    logger.debug(`commitMessage: ` + JSON.stringify(upgrade.commitMessage));
    if (upgrade.prTitle) {
      upgrade.prTitle = handlebars.compile(upgrade.prTitle)(upgrade);
      upgrade.prTitle = handlebars.compile(upgrade.prTitle)(upgrade);
      upgrade.prTitle = handlebars
        .compile(upgrade.prTitle)(upgrade)
        .trim()
        .replace(/\s+/g, ' ');
      if (upgrade.toLowerCase) {
        upgrade.prTitle = upgrade.prTitle.toLowerCase();
      }
    } else {
      [upgrade.prTitle] = upgrade.commitMessage.split('\n');
    }
    upgrade.prTitle += upgrade.hasBaseBranches ? ' ({{baseBranch}})' : '';
    if (upgrade.isGroup) {
      upgrade.prTitle +=
        upgrade.updateType === 'major' && upgrade.separateMajorMinor
          ? ' (major)'
          : '';
      upgrade.prTitle +=
        upgrade.updateType === 'minor' && upgrade.separateMinorPatch
          ? ' (minor)'
          : '';
      upgrade.prTitle += upgrade.updateType === 'patch' ? ' (patch)' : '';
    }
    // Compile again to allow for nested handlebars templates
    upgrade.prTitle = handlebars.compile(upgrade.prTitle)(upgrade);
    logger.debug(`prTitle: ` + JSON.stringify(upgrade.prTitle));
    config.upgrades.push(upgrade);
    if (upgrade.releaseTimestamp) {
      if (releaseTimestamp) {
        const existingStamp = DateTime.fromISO(releaseTimestamp);
        const upgradeStamp = DateTime.fromISO(upgrade.releaseTimestamp);
        if (upgradeStamp > existingStamp) {
          releaseTimestamp = upgrade.releaseTimestamp; // eslint-disable-line
        }
      } else {
        releaseTimestamp = upgrade.releaseTimestamp; // eslint-disable-line
      }
    }
  }
  if (
    depNames.length === 2 &&
    !hasGroupName &&
    config.upgrades[0].depName.startsWith('@types/') &&
    config.upgrades[0].depName.endsWith(config.upgrades[1].depName)
  ) {
    logger.debug('Found @types - reversing upgrades to use depName in PR');
    config.upgrades.reverse();
    config.upgrades[0].recreateClosed = false;
    config.hasTypes = true;
  } else {
    config.upgrades.sort((a, b) => {
      if (a.depName < b.depName) return -1;
      if (a.depName > b.depName) return 1;
      return 0;
    });
  }
  // Now assign first upgrade's config as branch config
  config = { ...config, ...config.upgrades[0], releaseTimestamp };
  config.canBeUnpublished = config.upgrades.some(
    upgrade => upgrade.canBeUnpublished
  );
  config.reuseLockFiles = config.upgrades.every(
    upgrade => upgrade.updateType !== 'lockFileMaintenance'
  );
  config.automerge = config.upgrades.every(upgrade => upgrade.automerge);
  config.blockedByPin = config.upgrades.every(upgrade => upgrade.blockedByPin);
  if (config.upgrades.every(upgrade => upgrade.updateType === 'pin')) {
    logger.debug('Overriding schedule for Pin PR');
    config.schedule = [];
  }
  return config;
}

module.exports = {
  generateBranchConfig,
};
