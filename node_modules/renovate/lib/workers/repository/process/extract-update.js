const { writeUpdates } = require('./write');
const { sortBranches } = require('./sort');
const { fetchUpdates } = require('./fetch');
const { raiseDeprecationWarnings } = require('./deprecated');
const { branchifyUpgrades } = require('../updates/branchify');
const { extractAllDependencies } = require('../extract');

module.exports = {
  extractAndUpdate,
};

async function extractAndUpdate(config) {
  logger.debug('extractAndUpdate()');
  const packageFiles = await extractAllDependencies(config);
  logger.trace({ config: packageFiles }, 'packageFiles');
  await fetchUpdates(config, packageFiles);
  logger.debug({ config: packageFiles }, 'packageFiles with updates');
  await raiseDeprecationWarnings(config, packageFiles);
  const { branches, branchList } = branchifyUpgrades(config, packageFiles);
  sortBranches(branches);
  let res;
  if (config.repoIsOnboarded) {
    res = await writeUpdates(config, packageFiles, branches);
  }
  return { res, branches, branchList, packageFiles };
}
