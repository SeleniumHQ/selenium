const assert = require('assert');
const Color = require('../color');

console.log('Running Color tests...');

// HEX to RGB
let c1 = new Color('#ff0000');
assert.strictEqual(c1.getHex(), '#ff0000');
assert.strictEqual(c1.getRgb(), 'rgb(255, 0, 0)');
assert.strictEqual(c1.getRgba(), 'rgba(255, 0, 0, 1)');

// RGB to HEX
let c2 = new Color('rgb(0, 255, 0)');
assert.strictEqual(c2.getHex(), '#00ff00');
assert.strictEqual(c2.getRgb(), 'rgb(0, 255, 0)');
assert.strictEqual(c2.getRgba(), 'rgba(0, 255, 0, 1)');

// RGBA
let c3 = new Color('rgba(0, 0, 255, 0.5)');
assert.strictEqual(c3.getHex(), '#0000ff');
assert.strictEqual(c3.getRgb(), 'rgb(0, 0, 255)');
assert.strictEqual(c3.getRgba(), 'rgba(0, 0, 255, 0.5)');

console.log('All Color tests passed!');
