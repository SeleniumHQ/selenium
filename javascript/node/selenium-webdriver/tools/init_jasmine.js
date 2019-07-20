// Initialize `global.jasmine` so it can be patched 
require('@bazel/jasmine').boot();

global.after = global.afterAll;
global.before = global.beforeAll;

global.jasmine.DEFAULT_TIMEOUT_INTERVAL = 120 * 1000;
