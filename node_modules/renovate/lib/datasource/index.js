const { parse } = require('../util/purl');

const docker = require('./docker');
const github = require('./github');
const npm = require('./npm');
const nuget = require('./nuget');
const packagist = require('./packagist');
const pypi = require('./pypi');

const datasources = {
  docker,
  github,
  npm,
  nuget,
  packagist,
  pypi,
};

function getPkgReleases(purlStr, config) {
  const purl = parse(purlStr);
  if (!purl) {
    return null;
  }
  if (!datasources[purl.type]) {
    logger.warn('Unknown purl type: ' + purl.type);
    return null;
  }
  return datasources[purl.type].getPkgReleases(purl, config);
}

function supportsDigests(purlStr) {
  const purl = parse(purlStr);
  return !!datasources[purl.type].getDigest;
}

function getDigest(config, value) {
  const purl = parse(config.purl);
  return datasources[purl.type].getDigest(config, value);
}

module.exports = {
  getPkgReleases,
  supportsDigests,
  getDigest,
};
