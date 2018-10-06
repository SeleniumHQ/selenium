function getScheduleDesc(config) {
  logger.debug('getScheduleDesc()');
  logger.trace({ config });
  if (!(config.schedule && config.schedule.length)) {
    logger.debug('No schedule');
    return [];
  }
  const desc = `Run Renovate on following schedule: ${config.schedule}`;
  return [desc];
}

function getDescriptionArray(config) {
  logger.debug('getDescriptionArray()');
  logger.trace({ config });
  return (config.description || []).concat(getScheduleDesc(config));
}

function getConfigDesc(config, packageFiles) {
  logger.debug('getConfigDesc()');
  logger.trace({ config });
  let descriptionArr = getDescriptionArray(config);
  if (!descriptionArr.length) {
    logger.debug('No config description found');
    return '';
  }
  logger.debug({ length: descriptionArr.length }, 'Found description array');
  const managers = packageFiles ? Object.keys(packageFiles) : [];
  if (
    !(managers.includes('dockerfile') || managers.includes('docker-compose'))
  ) {
    descriptionArr = descriptionArr.filter(val => !val.includes('Docker-only'));
  }
  let desc = `\n### Configuration Summary\n\nBased on the default config's presets, Renovate will:\n\n`;
  desc +=
    '  - Start dependency updates only once this Configure Renovate PR is merged\n';
  descriptionArr.forEach(d => {
    desc += `  - ${d}\n`;
  });
  desc += '\n';
  desc += `:abcd: Would you like to change the way Renovate is upgrading your dependencies?`;
  desc += ` Simply edit the \`renovate.json\` in this branch with your custom config and the list of Pull Requests in the "What to Expect" section below will be updated the next time Renovate runs.`;
  desc += '\n\n---\n';
  return desc;
}

module.exports = {
  getScheduleDesc,
  getConfigDesc,
};
