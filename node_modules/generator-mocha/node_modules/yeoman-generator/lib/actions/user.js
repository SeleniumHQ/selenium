'use strict';
var shell = require('shelljs');
var githubUsername = require('github-username');

var nameCache = {};
var emailCache = {};

/**
 * @mixin
 * @alias actions/user
 */
var user = module.exports;

user.git = {};
user.github = {};

/**
 * Retrieves user's name from Git in the global scope or the project scope
 * (it'll take what Git will use in the current context)
 */

user.git.name = function () {
  var name = nameCache[process.cwd()];

  if (name) {
    return name;
  }

  if (shell.which('git')) {
    name = shell.exec('git config --get user.name', {silent: true}).stdout.trim();
    nameCache[process.cwd()] = name;
  }

  return name;
};

/**
 * Retrieves user's email from Git in the global scope or the project scope
 * (it'll take what Git will use in the current context)
 */

user.git.email = function () {
  var email = emailCache[process.cwd()];

  if (email) {
    return email;
  }

  if (shell.which('git')) {
    email = shell.exec('git config --get user.email', {silent: true}).stdout.trim();
    emailCache[process.cwd()] = email;
  }

  return email;
};

/**
 * Retrieves GitHub's username from the GitHub API.
 */

user.github.username = function (cb) {
  var promise = githubUsername(user.git.email());

  if (cb) {
    promise.then(
      val => cb(null, val),
      err => cb(err)
    );
  }

  return promise;
};
