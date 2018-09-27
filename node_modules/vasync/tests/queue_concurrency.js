/* vim: set ts=8 sts=8 sw=8 noet: */

var mod_tap = require('tap');
var mod_vasync = require('..');

function
latched_worker(task, cb)
{
	if (task.immediate) {
		cb();
	} else {
		task.latched = true;
		task.unlatch = function () {
			task.latched = false;
			cb();
		};
	}
}

function
unlatchAll(tasks)
{
	tasks.forEach(function (t) {
		if (t.latched) {
			t.unlatch();
		}
	});
}

function
setAllImmediate(tasks)
{
	tasks.forEach(function (t) {
		t.immediate = true;
	});
}

mod_tap.test('test serial tasks', function (test) {
	test.plan(2);

	var q = mod_vasync.queuev({
		worker: latched_worker,
		concurrency: 1
	});
	test.ok(q);

	var tasks = [];
	for (var i = 0; i < 2; ++i) {
		tasks.push({
			'id': i,
			'latched': false,
			'immediate': false
		});
	}

	setTimeout(function () {
		var latched = 0;
		tasks.forEach(function (t) {
			if (t.latched) {
				++latched;
			}
		});
		test.ok(latched === 1);
		unlatchAll(tasks);
		setAllImmediate(tasks);
	}, 10);

	q.on('drain', function () {
		q.close();
	});

	q.on('end', function () {
		test.end();
	});

	q.push(tasks);
});

mod_tap.test('test parallel tasks', function (test) {
	test.plan(2);

	var q = mod_vasync.queuev({
		worker: latched_worker,
		concurrency: 2
	});
	test.ok(q);

	var tasks = [];
	for (var i = 0; i < 3; ++i) {
		tasks.push({
			'id': i,
			'latched': false,
			'immediate': false
		});
	}

	setTimeout(function () {
		var latched = 0;
		tasks.forEach(function (t) {
			if (t.latched) {
				++latched;
			}
		});
		test.ok(latched === 2);
		unlatchAll(tasks);
		setAllImmediate(tasks);
	}, 10);

	q.on('drain', function () {
		q.close();
	});

	q.on('end', function () {
		test.end();
	});

	q.push(tasks);
});

mod_tap.test('test ratchet up and down', function (test) {
	test.plan(8);

	var q = mod_vasync.queuev({
		worker: latched_worker,
		concurrency: 2
	});
	test.ok(q);

	var bounced = 0;
	var tasks = [];
	for (var i = 0; i < 21; ++i) {
		tasks.push({
			'id': i,
			'latched': false,
			'immediate': false
		});
	}

	function count() {
		var latched = 0;
		tasks.forEach(function (t) {
			if (t.latched) {
				++latched;
			}
		});
		return (latched);
	}

	function fiveLatch() {
		if (!q.closed) {
			++bounced;
			test.ok(count() === 5);
			q.updateConcurrency(2);
			unlatchAll(tasks);
			setTimeout(twoLatch, 10);
		}
	}

	function twoLatch() {
		if (!q.closed) {
			++bounced;
			test.ok(count() === 2);
			q.updateConcurrency(5);
			unlatchAll(tasks);
			setTimeout(fiveLatch, 10);
		}
	}
	setTimeout(twoLatch, 10);

	q.on('drain', function () {
		q.close();
	});

	q.on('end', function () {
		// 21 tasks === 5 * 3 + 2 * 3 === 6 bounces
		test.ok(bounced === 6);
		test.end();
	});

	q.push(tasks);
});
