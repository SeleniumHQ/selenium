'use strict';

const assert = require('assert');
const PushStream = require('./');

class MockObserver {
  next(x) { this.nextValue = x; }
  error(e) { this.errorValue = e; }
  complete(x) { this.completeCalled = true; }
}

{ // Sending values and errors
  let pusher = new PushStream();
  let a = new MockObserver();
  let b = new MockObserver();

  pusher.observable.subscribe(a);
  pusher.observable.subscribe(b);

  pusher.next(1);

  assert.equal(a.nextValue, 1);
  assert.equal(b.nextValue, 1);

  pusher.next(2);

  assert.equal(a.nextValue, 2);
  assert.equal(b.nextValue, 2);

  pusher.error(3);

  assert.equal(a.errorValue, 3);
  assert.equal(b.errorValue, 3);
}

{ // Sending complete
  let pusher = new PushStream();
  let a = new MockObserver();
  let b = new MockObserver();

  pusher.observable.subscribe(a);
  pusher.observable.subscribe(b);

  pusher.complete();
  assert.equal(a.completeCalled, true);
  assert.equal(b.completeCalled, true);
}

{ // No observers
  let pusher = new PushStream();
  pusher.next(1);
  pusher.complete();
}

{ // Single observers
  let pusher = new PushStream();
  let a = new MockObserver();

  pusher.observable.subscribe(a);
  pusher.next(1);
  assert.equal(a.nextValue, 1);

  pusher.next(2);
  assert.equal(a.nextValue, 2);

  pusher.complete(1);
  assert.equal(a.completeCalled, true);
}

{ // Errors should not be sent to closed subscriptions
  let pusher = new PushStream();
  let subscription;

  pusher.observable.subscribe({
    next() {},
    error() { subscription.unsubscribe(); },
  });

  subscription = pusher.observable.subscribe(() => null);
  pusher.error(new Error('Should not be thrown'));
}

{ // Start and pause options
  let calls = [];

  let pusher = new PushStream({
    start(x) { calls.push(['start', x]); },
    pause(x) { calls.push(['pause', x]); },
  });

  assert.equal(calls.length, 0);

  let s1 = pusher.observable.subscribe(() => calls.push(['handler1']));
  pusher.next(1);
  let s2 = pusher.observable.subscribe(() => calls.push(['handler2']));
  s1.unsubscribe();
  pusher.next(2);
  s2.unsubscribe();

  assert.deepEqual(calls, [
    ['start', undefined],
    ['handler1'],
    ['handler2'],
    ['pause', undefined],
  ]);
}
