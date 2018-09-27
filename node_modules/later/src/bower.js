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
  "main": "later.js",
  "license": "MIT"
}, null, 2));