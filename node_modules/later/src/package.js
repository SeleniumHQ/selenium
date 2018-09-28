var later = require("../index");

console.log(JSON.stringify({
  "name": "later",
  "version": later.version,
  "description": "Determine later (or previous) occurrences of recurring schedules",
  "keywords": ["schedule", "occurrences", "recur", "cron"],
  "author": "BunKat <bill@levelstory.com>",
  "repository" : {
    "type" : "git",
    "url" : "git://github.com/bunkat/later.git"
  },
  "main": "index.js",
  "browserify": "index-browserify.js",
  "jam": {
    "main": "later.js",
    "shim": {
      "exports": "later"
    }
  },
  "devDependencies": {
    "smash": "~0.0.8",
    "mocha": "*",
    "should": ">=0.6.3",
    "jslint": "*",
    "uglify-js": "*",
    "benchmark": "*"
  },
  "license": "MIT",
  "scripts": {
    "test": "./node_modules/.bin/mocha test/**/*-test.js --reporter dot"
  }
}, null, 2));