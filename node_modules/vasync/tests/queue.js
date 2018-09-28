/* vim: set ts=8 sts=8 sw=8 noet: */

var mod_tap = require('tap');
var mod_vasync = require('..');

function
immediate_worker(task, next)
{
	setImmediate(function () {
		next();
	});
}

function
sametick_worker(task, next)
{
	next();
}

function
random_delay_worker(task, next)
{
	setTimeout(function () {
		next();
	}, Math.floor(Math.random() * 250));
}

mod_tap.test('must not push after close', function (test) {
	test.plan(3);

	var q = mod_vasync.queuev({
		worker: immediate_worker,
		concurrency: 10
	});
	test.ok(q);

	test.doesNotThrow(function () {
		q.push({});
	}, 'push should not throw _before_ close()');

	q.close();

	/*
	 * If we attempt to add tasks to the queue _after_ calling close(),
	 * we should get an exception:
	 */
	test.throws(function () {
		q.push({});
	}, 'push should throw _after_ close()');

	test.end();
});

mod_tap.test('get \'end\' event with close()', function (test) {
	var task_count = 45;
	var tasks_finished = 0;
	var seen_end = false;
	var seen_drain = false;

	test.plan(14 + task_count);

	var q = mod_vasync.queuev({
		worker: random_delay_worker,
		concurrency: 5
	});
	test.ok(q);

	/*
	 * Enqueue a bunch of tasks; more than our concurrency:
	 */
	for (var i = 0; i < 45; i++) {
		q.push({}, function () {
			tasks_finished++;
			test.ok(true);
		});
	}

	/*
	 * Close the queue to signify that we're done now.
	 */
	test.equal(q.ended, false);
	test.equal(q.closed, false);
	q.close();
	test.equal(q.closed, true);
	test.equal(q.ended, false);

	q.on('drain', function () {
		/*
		 * 'drain' should fire before 'end':
		 */
		test.notOk(seen_drain);
		test.notOk(seen_end);
		seen_drain = true;
	});
	q.on('end', function () {
		/*
		 * 'end' should fire after 'drain':
		 */
		test.ok(seen_drain);
		test.notOk(seen_end);
		seen_end = true;

		/*
		 * Check the public state:
		 */
		test.equal(q.closed, true);
		test.equal(q.ended, true);

		/*
		 * We should have fired the callbacks for _all_ enqueued
		 * tasks by now:
		 */
		test.equal(task_count, tasks_finished);
		test.end();
	});

	/*
	 * Check that we see neither the 'drain', nor the 'end' event before
	 * the end of this tick:
	 */
	test.notOk(seen_drain);
	test.notOk(seen_end);
});

mod_tap.test('get \'end\' event with close() and no tasks', function (test) {
	var seen_drain = false;
	var seen_end = false;

	test.plan(10);

	var q = mod_vasync.queuev({
		worker: immediate_worker,
		concurrency: 10
	});

	setImmediate(function () {
		test.notOk(seen_end);
	});

	test.equal(q.ended, false);
	test.equal(q.closed, false);
	q.close();
	test.equal(q.closed, true);
	test.equal(q.ended, false);
	test.notOk(seen_end);

	q.on('drain', function () {
		seen_drain = true;
	});
	q.on('end', function () {
		/*
		 * We do not expect to see a 'drain' event, as there were no
		 * tasks pushed onto the queue before we closed it.
		 */
		test.notOk(seen_drain);
		test.notOk(seen_end);
		test.equal(q.closed, true);
		test.equal(q.ended, true);
		seen_end = true;
		test.end();
	});
});

/*
 * We want to ensure that both the 'drain' event and the q.drain() hook are
 * called the same number of times:
 */
mod_tap.test('equivalence of on(\'drain\') and q.drain()', function (test) {
	var enqcount = 4;
	var drains = 4;
	var ee_count = 0;
	var fn_count = 0;

	test.plan(enqcount + drains + 3);

	var q = mod_vasync.queuev({
		worker: immediate_worker,
		concurrency: 10
	});

	var enq = function () {
		if (--enqcount < 0)
			return;

		q.push({}, function () {
			test.ok(true, 'task completion');
		});
	};

	var draino = function () {
		test.ok(true, 'drain called');
		if (--drains === 0) {
			test.equal(q.closed, false, 'not closed');
			test.equal(q.ended, false, 'not ended');
			test.equal(fn_count, ee_count, 'same number of calls');
			test.end();
		}
	};

	enq();
	enq();

	q.on('drain', function () {
		ee_count++;
		enq();
		draino();
	});
	q.drain = function () {
		fn_count++;
		enq();
		draino();
	};
});

/*
 * In the past, we've only handed on the _first_ argument to the task completion
 * callback.  Make sure we hand on _all_ of the arguments now:
 */
mod_tap.test('ensure all arguments passed to push() callback', function (test) {
	test.plan(13);

	var q = mod_vasync.queuev({
		worker: function (task, callback) {
			if (task.fail) {
				callback(new Error('guru meditation'));
				return;
			}
			callback(null, 1, 2, 3, 5, 8);
		},
		concurrency: 1
	});

	q.push({ fail: true }, function (err, a, b, c, d, e) {
		test.ok(err, 'got the error');
		test.equal(err.message, 'guru meditation');
		test.type(a, 'undefined');
		test.type(b, 'undefined');
		test.type(c, 'undefined');
		test.type(d, 'undefined');
		test.type(e, 'undefined');
	});

	q.push({ fail: false }, function (err, a, b, c, d, e) {
		test.notOk(err, 'got no error');
		test.equal(a, 1);
		test.equal(b, 2);
		test.equal(c, 3);
		test.equal(d, 5);
		test.equal(e, 8);
	});

	q.drain = function () {
		test.end();
	};
});

mod_tap.test('queue kill', function (test) {
	// Derived from async queue.kill test
	var count = 0;
	var q = mod_vasync.queuev({
		worker: function (task, callback) {
			setImmediate(function () {
				test.ok(++count < 2,
				    'Function should be called once');
				callback();
			});
		},
		concurrency: 1
	});
	q.drain = function () {
		test.ok(false, 'Function should never be called');
	};

	// Queue twice, the first will exec immediately
	q.push(0);
	q.push(0);

	q.kill();

	q.on('end', function () {
		test.ok(q.killed);
		test.end();
	});
});
