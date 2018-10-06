const ghGot = require('../platform/github/gh-got-wrapper');
const versioning = require('../versioning');

module.exports = {
  getPreset,
  getDigest,
  getPkgReleases,
};

const map = new Map();

async function getPreset(pkgName, presetName = 'default') {
  if (presetName !== 'default') {
    throw new Error(
      { pkgName, presetName },
      'Sub-preset names are not supported with GitHub datasource'
    );
  }
  let res;
  try {
    const url = `https://api.github.com/repos/${pkgName}/contents/renovate.json`;
    res = Buffer.from((await ghGot(url)).body.content, 'base64').toString();
  } catch (err) {
    logger.debug('Failed to retrieve renovate.json from repo');
    throw new Error('dep not found');
  }
  try {
    return JSON.parse(res);
  } catch (err) {
    logger.debug('Failed to parse renovate.json');
    throw new Error('invalid preset JSON');
  }
}

const cacheNamespace = 'datasource-github';
function getCacheKey(repo, type) {
  return `${repo}:${type}`;
}

async function getDigest(config) {
  const cachedResult = await renovateCache.get(
    cacheNamespace,
    getCacheKey(config.githubRepo, 'commit')
  );
  if (cachedResult) {
    return cachedResult;
  }
  let digest;
  try {
    const url = `https://api.github.com/repos/${
      config.githubRepo
    }/commits?per_page=1`;
    digest = (await ghGot(url)).body[0].sha;
  } catch (err) {
    logger.info(
      { githubRepo: config.githubRepo, err },
      'Error getting latest commit from GitHub repo'
    );
  }
  if (!digest) {
    return null;
  }
  const cacheMinutes = 10;
  await renovateCache.set(
    cacheNamespace,
    getCacheKey(config.githubRepo, 'commit'),
    digest,
    cacheMinutes
  );
  return digest;
}

async function getPkgReleases(purl, config) {
  const { versionScheme } = config || {};
  const { fullname: repo, qualifiers: options } = purl;
  options.ref = options.ref || 'tags';
  let versions;
  const cachedResult = await renovateCache.get(
    cacheNamespace,
    getCacheKey(repo, options.ref)
  );
  if (cachedResult) {
    return cachedResult;
  }
  try {
    if (options.ref === 'release') {
      const url = `https://api.github.com/repos/${repo}/releases?per_page=100`;
      versions = (await ghGot(url, { paginate: true })).body.map(
        o => o.tag_name
      );
    } else {
      // tag
      const url = `https://api.github.com/repos/${repo}/tags?per_page=100`;
      versions = (await ghGot(url, {
        cache: process.env.RENOVATE_SKIP_CACHE ? undefined : map,
        paginate: true,
      })).body.map(o => o.name);
    }
  } catch (err) {
    logger.info(
      { repo, err, message: err.message },
      'Error retrieving from github'
    );
  }
  if (!versions) {
    return null;
  }
  // Filter by semver if no versionScheme provided
  const { isVersion, sortVersions } = versioning(versionScheme);
  // Return a sorted list of valid Versions
  versions = versions.filter(isVersion).sort(sortVersions);
  const dependency = {
    repositoryUrl: 'https://github.com/' + repo,
  };
  dependency.releases = versions.map(version => ({
    version: options.sanitize === 'true' ? isVersion(version) : version,
    gitRef: version,
  }));
  const cacheMinutes = 10;
  await renovateCache.set(
    cacheNamespace,
    getCacheKey(repo, options.ref),
    dependency,
    cacheMinutes
  );
  return dependency;
}
