const got = require('got');
const url = require('url');
const is = require('@sindresorhus/is');
const { isVersion, sortVersions } = require('../versioning')('pep440');

module.exports = {
  getPkgReleases,
};

function normalizeName(input) {
  return input.toLowerCase().replace(/(-|\.)/g, '_');
}

// This is a manual list of changelog URLs for dependencies that don't publish to repositoryUrl
const changelogUrls = {
  'pytest-django':
    'https://pytest-django.readthedocs.io/en/latest/changelog.html#changelog',
};

async function getPkgReleases(purl, config = {}) {
  const { fullname: depName } = purl;
  let hostUrl = 'https://pypi.org/pypi/';
  if (!is.empty(config.registryUrls)) {
    [hostUrl] = config.registryUrls;
  }
  if (process.env.PIP_INDEX_URL) {
    [hostUrl] = [process.env.PIP_INDEX_URL];
  }
  const lookupUrl = url.resolve(hostUrl, `${depName}/json`);
  try {
    const dependency = {};
    const rep = await got(lookupUrl, {
      json: true,
    });
    const dep = rep && rep.body;
    if (!dep) {
      logger.debug({ dependency: depName }, 'pip package not found');
      return null;
    }
    if (
      !(dep.info && normalizeName(dep.info.name) === normalizeName(depName))
    ) {
      logger.warn(
        { lookupUrl, lookupName: depName, returnedName: dep.info.name },
        'Returned name does not match with requested name'
      );
      return null;
    }
    if (dep.info && dep.info.home_page) {
      if (dep.info.home_page.startsWith('https://github.com')) {
        dependency.repositoryUrl = dep.info.home_page;
      } else {
        dependency.homepage = dep.info.home_page;
      }
    }
    const manualRepositories = {
      mkdocs: 'https://github.com/mkdocs/mkdocs',
    };
    dependency.repositoryUrl =
      dependency.repositoryUrl || manualRepositories[depName];
    dependency.releases = [];
    if (dep.releases) {
      const versions = Object.keys(dep.releases)
        .filter(isVersion)
        .sort(sortVersions);
      dependency.releases = versions.map(version => ({
        version,
        releaseTimestamp: (dep.releases[version][0] || {}).upload_time,
      }));
    }
    // istanbul ignore if
    if (changelogUrls[purl.fullname]) {
      dependency.changelogUrl =
        changelogUrls[purl.fullname] || dependency.changelogUrl;
    }
    return dependency;
  } catch (err) {
    logger.info('pypi dependency not found: ' + depName);
    return null;
  }
}
