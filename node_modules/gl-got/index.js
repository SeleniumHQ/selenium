'use strict';
const got = require('got');
const isPlainObj = require('is-plain-obj');

function glGot(path, opts) {
  if (typeof path !== 'string') {
    return Promise.reject(
      new TypeError(`Expected \`path\` to be a string, got ${typeof path}`)
    );
  }

  const env = process.env;

  opts = Object.assign(
    {
      json: true,
      token: env.GITLAB_TOKEN,
      endpoint: env.GITLAB_ENDPOINT
        ? env.GITLAB_ENDPOINT.replace(/[^/]$/, '$&/')
        : 'https://gitlab.com/api/v4/',
    },
    opts
  );

  opts.headers = Object.assign(
    {
      'user-agent': 'https://github.com/singapore/gl-got',
    },
    opts.headers
  );

  if (opts.token) {
    opts.headers['PRIVATE-TOKEN'] = opts.token;
  }

  const url = /^https?/.test(path) ? path : opts.endpoint + path;

  if (opts.stream) {
    return got.stream(url, opts);
  }

  return got(url, opts).catch(err => {
    if (err.response && isPlainObj(err.response.body)) {
      err.name = 'GitLabError';
      err.message = `${err.response.body.message} (${err.statusCode})`;
    }

    throw err;
  });
}

const helpers = ['get', 'post', 'put', 'patch', 'head', 'delete'];

glGot.stream = (url, opts) =>
  glGot(
    url,
    Object.assign({}, opts, {
      json: false,
      stream: true,
    })
  );

for (const x of helpers) {
  const method = x.toUpperCase();
  glGot[x] = (url, opts) => glGot(url, Object.assign({}, opts, { method }));
  glGot.stream[x] = (url, opts) =>
    glGot.stream(url, Object.assign({}, opts, { method }));
}

module.exports = glGot;
