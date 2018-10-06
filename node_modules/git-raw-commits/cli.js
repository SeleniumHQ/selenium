#!/usr/bin/env node
'use strict';
var meow = require('meow');
var gitRawCommits = require('./');

var cli = meow({
  help: [
    'Usage',
    '  git-raw-commits [<git-log(1)-options>]',
    '',
    'Example',
    '  git-raw-commits --from HEAD~2 --to HEAD^'
  ].join('\n')
});

gitRawCommits(cli.flags)
  .on('error', function(err) {
    process.stderr.write(err);
    process.exit(1);
  })
  .pipe(process.stdout);
