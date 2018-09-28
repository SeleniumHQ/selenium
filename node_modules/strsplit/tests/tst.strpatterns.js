#!/usr/bin/env node

/*
 * JavaScript-special test cases.  These are required to test string patterns
 * rather than regular expressions.
 */

var mod_assert = require('assert');
var strsplit = require('../lib/strsplit');

/* basic case with string pattern (uses String.split) */
mod_assert.deepEqual([ 'one', 'two', 'three' ],
    strsplit('one two three', ' '));

/* limit ineffective, simple cases */
mod_assert.deepEqual([ 'one', 'two', 'three', 'four', 'five' ],
    strsplit('one two three four five', ' ', 10));
mod_assert.deepEqual([ 'one', 'two three', 'four', 'five' ],
    strsplit('one  two three  four  five', '  ', 10));

/* limit ineffective, empty fields */
mod_assert.deepEqual([ 'one', 'two', '', 'three' ],
    strsplit('one two  three', ' ', 10));

/* regexp escaping for string patterns */
mod_assert.deepEqual([ 'one', 'two', 'three' ],
    strsplit('one.two.three', '.', 10));
mod_assert.deepEqual([ '', '', '', '', 'two.three' ],
    strsplit('one.two.three', /./, 5));

/* limit effective */
mod_assert.deepEqual([ 'one', 'two three' ],
    strsplit('one two three', ' ', 2));

/* no pattern is equivalent to \s+ */
mod_assert.deepEqual([ 'one', 'two', 'three', 'four' ],
    strsplit('one \t two   three\t\nfour'));
