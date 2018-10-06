'use strict'

module.exports = gh

/* Return a URL to GitHub, relative to an optional
 * `repo` object, or `user` and `project`. */
function gh(repo, project) {
  var base = 'https://github.com/'

  if (project) {
    repo = {user: repo, project: project}
  }

  if (repo) {
    base += repo.user + '/' + repo.project + '/'
  }

  return base
}
