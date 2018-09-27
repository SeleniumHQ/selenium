const URL = require('url');

const defaults = {
  bitbucket: { name: 'Bitbucket', endpoint: 'https://api.bitbucket.org/' },
  github: { name: 'GitHub', endpoint: 'https://api.github.com/' },
  gitlab: { name: 'GitLab', endpoint: 'https://gitlab.com/api/v4/' },
  vsts: { name: 'VSTS' },
};

module.exports = {
  update,
  find,
  clear,
  defaults,
  hosts,
};

const platforms = {};

function update(params) {
  const { platform } = params;
  if (!platform) {
    throw new Error('Failed to set configuration: no platform specified');
  }
  const config = { ...defaults[platform], ...params };
  const { endpoint } = config;
  if (!endpoint) {
    // istanbul ignore if
    if (platform === 'docker') {
      platforms.docker = params;
      return true;
    }
    throw new Error(
      `Failed to configure platform '${platform}': no endpoint defined`
    );
  }
  config.endpoint = endpoint.replace(/[^/]$/, '$&/');
  let { host } = config;
  // extract host from endpoint
  host = host || (endpoint && URL.parse(endpoint).host);
  // endpoint is in the format host/path (protocol missing)
  host = host || (endpoint && URL.parse('http://' + endpoint).host);
  if (!host) {
    throw new Error(
      `Failed to configure platform '${platform}': no host for endpoint '${endpoint}'`
    );
  }
  platforms[platform] = { ...platforms[platform] };
  if (config.default) {
    for (const conf of Object.values(platforms[platform])) {
      delete conf.default;
    }
  }
  platforms[platform][host] = { ...platforms[platform][host], ...config };
  return true;
}

function find({ platform, host }, overrides) {
  if (!platforms[platform]) {
    return merge(null, overrides);
  }
  // istanbul ignore if
  if (platform === 'docker') {
    if (platforms.docker.platform === 'docker') {
      return merge(platform.docker, overrides);
    }
    return merge(platforms.docker[host], overrides);
  }
  if (host) {
    return merge(platforms[platform][host], overrides);
  }
  const configs = Object.values(platforms[platform]);
  let config = configs.find(c => c.default);
  if (!config && configs.length === 1) {
    [config] = configs;
  }
  return merge(config, overrides);
}

function hosts({ platform }) {
  return Object.keys({ ...platforms[platform] });
}

function merge(config, overrides) {
  if (!overrides) {
    return config || null;
  }
  const locals = { ...overrides };
  Object.keys(locals).forEach(key => {
    if (locals[key] === undefined || locals[key] === null) {
      delete locals[key];
    }
  });
  return { ...config, ...locals };
}

function clear() {
  Object.keys(platforms).forEach(key => delete platforms[key]);
}
