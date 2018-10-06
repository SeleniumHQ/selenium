const URL = require('url');
const hostRules = require('../../../util/host-rules');
const versioning = require('../../../versioning');
const ghGot = require('../../../platform/github/gh-got-wrapper');
const { addReleaseNotes } = require('./release-notes');

module.exports = {
  getChangeLogJSON,
};

async function getTags(endpoint, versionScheme, repository) {
  const { isVersion } = versioning(versionScheme);
  let url = endpoint
    ? endpoint.replace(/\/?$/, '/')
    : 'https://api.github.com/';
  url += `repos/${repository}/tags?per_page=100`;
  try {
    const res = await ghGot(url, {
      paginate: true,
    });

    const tags = (res && res.body) || [];

    if (!tags.length) {
      logger.debug({ repository }, 'repository has no Github tags');
    }

    return tags.filter(tag => isVersion(tag.name)).map(tag => tag.name);
  } catch (err) {
    logger.info({ sourceRepo: repository }, 'Failed to fetch Github tags');
    logger.debug({ err });
    // istanbul ignore if
    if (err.message && err.message.includes('Bad credentials')) {
      logger.warn('Bad credentials triggering tag fail lookup in changelog');
      throw err;
    }
    return [];
  }
}

async function getChangeLogJSON({
  versionScheme,
  fromVersion,
  toVersion,
  repositoryUrl,
  releases,
}) {
  if (repositoryUrl === 'https://github.com/DefinitelyTyped/DefinitelyTyped') {
    logger.debug('No release notes for @types');
    return null;
  }
  const { isVersion, equals, isGreaterThan, sortVersions } = versioning(
    versionScheme
  );
  const { protocol, host, pathname } = URL.parse(repositoryUrl);
  const githubBaseURL = `${protocol}//${host}/`;
  const config = hostRules.find({
    platform: 'github',
    host: host === 'github.com' ? 'api.github.com' : host,
  });
  if (!config) {
    logger.debug('Repository URL does not match any hnown hosts');
    return null;
  }
  const repository = pathname.slice(1);
  if (repository.split('/').length !== 2) {
    logger.info('Invalid github URL found');
    return null;
  }
  if (!(releases && releases.length)) {
    logger.debug('No releases');
    return null;
  }
  // This extra filter/sort should not be necessary, but better safe than sorry
  const validReleases = [...releases]
    .filter(release => isVersion(release.version))
    .sort((a, b) => sortVersions(a.version, b.version));

  if (validReleases.length < 2) {
    logger.debug('Not enough valid releases');
    return null;
  }

  let tags;

  async function getRef(release) {
    if (!tags) {
      tags = await getTags(config.endpoint, versionScheme, repository);
    }
    const tagName = tags.find(tag => equals(tag, release.version));
    if (tagName) {
      return tagName;
    }
    if (release.gitRef) {
      return release.gitRef;
    }
    return null;
  }

  const cacheNamespace = 'changelog-github-release';
  function getCacheKey(prev, next) {
    return `${repository}:${prev}:${next}`;
  }

  const changelogReleases = [];
  // compare versions
  const include = version =>
    isGreaterThan(version, fromVersion) && !isGreaterThan(version, toVersion);
  for (let i = 1; i < validReleases.length; i += 1) {
    const prev = validReleases[i - 1];
    const next = validReleases[i];
    if (include(next.version)) {
      let release = await renovateCache.get(
        cacheNamespace,
        getCacheKey(prev.version, next.version)
      );
      if (!release) {
        release = {
          version: next.version,
          date: next.releaseTimestamp,
          // put empty changes so that existing templates won't break
          changes: [],
          compare: {},
        };
        const prevHead = await getRef(prev);
        const nextHead = await getRef(next);
        if (prevHead && nextHead) {
          release.compare.url = `${githubBaseURL}${repository}/compare/${prevHead}...${nextHead}`;
        }
        const cacheMinutes = 55;
        await renovateCache.set(
          cacheNamespace,
          getCacheKey(prev.version, next.version),
          release,
          cacheMinutes
        );
      }
      changelogReleases.unshift(release);
    }
  }

  let res = {
    project: {
      githubBaseURL,
      github: repository,
      repository: repositoryUrl,
    },
    versions: changelogReleases,
  };

  res = await addReleaseNotes(res);

  return res;
}
