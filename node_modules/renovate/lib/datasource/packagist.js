const URL = require('url');
const got = require('got');
const parse = require('github-url-from-git');
const { isVersion, sortVersions } = require('../versioning')('semverComposer');

module.exports = {
  getPkgReleases,
};

async function getPkgReleases(purl) {
  const { fullname: name } = purl;
  logger.trace(`getPkgReleases(${name})`);

  const regUrl = 'https://packagist.org';

  const pkgUrl = URL.resolve(regUrl, `/packages/${name}.json`);

  try {
    const res = (await got(pkgUrl, {
      json: true,
      retries: 5,
    })).body.package;

    // Simplify response before caching and returning
    const dep = {
      name: res.name,
      versions: {},
    };

    if (res.repository) {
      dep.repositoryUrl = parse(res.repository);
    }
    const versions = Object.keys(res.versions)
      .filter(isVersion)
      .sort(sortVersions);

    dep.releases = versions.map(version => {
      const release = res.versions[version];
      dep.homepage = dep.homepage || release.homepage;
      return {
        version: version.replace(/^v/, ''),
        gitRef: version,
        releaseTimestamp: release.time,
      };
    });
    dep.homepage = dep.homepage || res.repository;
    logger.trace({ dep }, 'dep');
    return dep;
  } catch (err) {
    if (err.statusCode === 404 || err.code === 'ENOTFOUND') {
      logger.info({ dependency: name }, `Dependency lookup failure: not found`);
      logger.debug({
        err,
      });
      return null;
    }
    logger.warn({ err, name }, 'packagist registry failure: Unknown error');
    return null;
  }
}
