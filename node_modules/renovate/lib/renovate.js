#!/usr/bin/env node

const globalWorker = require('./workers/global');

(async () => {
  await globalWorker.start();
  // istanbul ignore if
  if (global.renovateError) {
    process.exitCode = 1;
  }
})();
