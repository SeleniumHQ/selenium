/*
 * Tests the "waterfall" primitive.
 */

var mod_tap = require('tap');
var mod_vasync = require('..');

var count = 0;
var st;

mod_tap.test('empty waterfall', function (test) {
	st = mod_vasync.waterfall([], function (err) {
		test.ok(err === null);
		test.ok(st.ndone === 0);
		test.ok(st.nerrors === 0);
		test.ok(st.operations.length === 0);
		test.ok(st.successes.length === 0);
		test.equal(count, 1);
		test.end();
	});
	count++;
	test.ok(st.ndone === 0);
	test.ok(st.nerrors === 0);
	test.ok(st.operations.length === 0);
	test.ok(st.successes.length === 0);
});

mod_tap.test('normal 4-stage waterfall', function (test) {
	count = 0;
	st = mod_vasync.waterfall([
		function func1(cb) {
			test.ok(count === 0, 'func1: count === 0');
			test.ok(st.ndone === 0);
			count++;
			setTimeout(cb, 20, null, { 'hello': 'world' });
		},
		function func2(extra, cb) {
			test.equal(extra.hello, 'world', 'func2: extra arg');
			test.ok(count == 1, 'func2: count == 1');
			test.ok(st.ndone === 1);
			test.ok(st.operations[0].status == 'ok');
			test.ok(st.operations[1].status == 'pending');
			test.ok(st.operations[2].status == 'waiting');
			count++;
			setTimeout(cb, 20, null, 5, 6, 7);
		},
		function (five, six, seven, cb) {
			test.equal(five, 5, 'func3: extra arg');
			test.equal(six, 6, 'func3: extra arg');
			test.equal(seven, 7, 'func3: extra arg');
			test.ok(count == 2, 'func3: count == 2');
			test.ok(st.ndone === 2);
			count++;
			setTimeout(cb, 20);
		},
		function func4(cb) {
			test.ok(count == 3, 'func4: count == 2');
			test.ok(st.ndone === 3);
			count++;
			setTimeout(cb, 20, null, 8, 9);
		}
	], function (err, eight, nine) {
		test.ok(count == 4, 'final: count == 4');
		test.ok(err === null, 'no error');
		test.ok(eight == 8);
		test.ok(nine == 9);
		test.ok(st.ndone === 4);
		test.ok(st.nerrors === 0);
		test.ok(st.operations.length === 4);
		test.ok(st.successes.length === 4);
		test.ok(st.operations[0].status == 'ok');
		test.ok(st.operations[1].status == 'ok');
		test.ok(st.operations[2].status == 'ok');
		test.ok(st.operations[3].status == 'ok');
		test.end();
	});
	test.ok(st.ndone === 0);
	test.ok(st.nerrors === 0);
	test.ok(st.operations.length === 4);
	test.ok(st.operations[0].funcname == 'func1', 'func1 name');
	test.ok(st.operations[0].status == 'pending');
	test.ok(st.operations[1].funcname == 'func2', 'func2 name');
	test.ok(st.operations[1].status == 'waiting');
	test.ok(st.operations[2].funcname == '(anon)', 'anon name');
	test.ok(st.operations[2].status == 'waiting');
	test.ok(st.operations[3].funcname == 'func4', 'func4 name');
	test.ok(st.operations[3].status == 'waiting');
	test.ok(st.successes.length === 0);
});

mod_tap.test('bailing out early', function (test) {
	count = 0;
	st = mod_vasync.waterfall([
		function func1(cb) {
			test.ok(count === 0, 'func1: count === 0');
			count++;
			setTimeout(cb, 20);
		},
		function func2(cb) {
			test.ok(count == 1, 'func2: count == 1');
			count++;
			setTimeout(cb, 20, new Error('boom!'));
		},
		function func3(cb) {
			test.ok(count == 2, 'func3: count == 2');
			count++;
			setTimeout(cb, 20);
		}
	], function (err) {
		test.ok(count == 2, 'final: count == 3');
		test.equal(err.message, 'boom!');
		test.ok(st.ndone == 2);
		test.ok(st.nerrors == 1);
		test.ok(st.operations[0].status == 'ok');
		test.ok(st.operations[1].status == 'fail');
		test.ok(st.operations[2].status == 'waiting');
		test.ok(st.successes.length == 1);
		test.end();
	});
});

mod_tap.test('bad function', function (test) {
	count = 0;
	st = mod_vasync.waterfall([
		function func1(cb) {
			count++;
			cb();
			setTimeout(function () {
				test.throws(
				    function () { cb(); process.abort(); },
				    'vasync.waterfall: ' +
				    'function 0 ("func1") invoked its ' +
				    'callback twice');
				test.equal(count, 2);
				test.end();
			}, 100);
		},
		function func2(cb) {
			count++;
			/* do nothing -- we'll throw an exception first */
		}
	], function (err) {
		/* not reached */
		console.error('didn\'t expect to finish');
		process.abort();
	});
});

mod_tap.test('badargs', function (test) {
	test.throws(function () { mod_vasync.waterfall(); });
	test.throws(function () { mod_vasync.waterfall([], 'foo'); });
	test.throws(function () { mod_vasync.waterfall('foo', 'bar'); });
	test.end();
});

mod_tap.test('normal waterfall, no callback', function (test) {
	count = 0;
	st = mod_vasync.waterfall([
	    function func1(cb) {
		test.ok(count === 0);
		count++;
		setImmediate(cb);
	    },
	    function func2(cb) {
		test.ok(count == 1);
		count++;
		setImmediate(cb);
		setTimeout(function () {
			test.ok(count == 2);
			test.end();
		}, 100);
	    }
	]);
});

mod_tap.test('empty waterfall, no callback', function (test) {
	st = mod_vasync.waterfall([]);
	setTimeout(function () { test.end(); }, 100);
});
