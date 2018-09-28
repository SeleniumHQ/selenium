const parse = require('github-url-from-git');
const got = require('got');
const xmlParser = require('fast-xml-parser');
const { isVersion, sortVersions } = require('../versioning/semver');

module.exports = {
  getPkgReleases,
};

async function getPkgReleases(purl) {
  const { fullname: name } = purl;
  logger.trace(`nuget.getPkgReleases(${name})`);
  const pkgUrl = `https://api.nuget.org/v3-flatcontainer/${name.toLowerCase()}/index.json`;
  try {
    const res = (await got(pkgUrl, {
      json: true,
      retries: 5,
    })).body;
    const dep = {
      name,
    };
    dep.releases = res.versions
      .filter(isVersion)
      .sort(sortVersions)
      .map(version => ({ version }));
    // look up nuspec for latest release to get repository
    const url = `https://api.nuget.org/v3-flatcontainer/${name.toLowerCase()}/${res.versions.pop()}/${name.toLowerCase()}.nuspec`;
    try {
      const result = await got(url);
      const nuspec = xmlParser.parse(result.body, { ignoreAttributes: false });
      if (nuspec) {
        const repositoryUrl = parse(
          nuspec.package.metadata.repository['@_url']
        );
        if (repositoryUrl) {
          dep.repositoryUrl = repositoryUrl;
        }
      }
    } catch (err) /* istanbul ignore next */ {
      logger.debug({ dependency: name }, 'Error looking up nuspec');
    }
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
    logger.warn({ err, name }, 'nuget registry failure: Unknown error');
    return null;
  }
}
