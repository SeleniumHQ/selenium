// Copyright 2019 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.module('goog.streams.fullTestCases');
goog.setTestOnly();

const recordFunction = goog.require('goog.testing.recordFunction');
const {ReadableStream, ReadableStreamDefaultController, ReadableStreamStrategy, ReadableStreamUnderlyingSource} = goog.require('goog.streams.fullTypes');
const {TestCases: LiteTestCases} = goog.require('goog.streams.liteTestCases');

/**
 * @return {number}
 */
const chunkSizeTwo = () => 2;

class TestCases extends LiteTestCases {
  /**
   * @param {function(!ReadableStreamUnderlyingSource=,
   *     !ReadableStreamStrategy=): !ReadableStream} newReadableStream
   */
  constructor(newReadableStream) {
    super(newReadableStream);

    /**
     * @type {function(!ReadableStreamUnderlyingSource=,
     *     !ReadableStreamStrategy=): !ReadableStream}
     * @override
     */
    this.newReadableStream;
  }

  /**
   * @param {!ReadableStreamUnderlyingSource=} underlyingSource
   * @param {!ReadableStreamStrategy=} strategy
   * @return {{stream: !ReadableStream<string>, controller:
   *     !ReadableStreamDefaultController<string>}}
   * @override
   */
  newReadableStreamWithController(underlyingSource = {}, strategy = {}) {
    let controller;
    const start = underlyingSource.start;
    underlyingSource = Object.assign({}, underlyingSource, {
      start(ctlr) {
        controller = ctlr;
        return start && start(ctlr);
      },
    });
    const stream = this.newReadableStream(underlyingSource, strategy);
    return {stream, controller};
  }

  async testCancel() {
    const stream = this.newReadableStream();
    const cancelResult = await stream.cancel(new Error('error'));
    assertUndefined(cancelResult);
    const {done} = await stream.getReader().read();
    assertTrue(done);
  }

  async testCancel_Closed() {
    const {stream, controller} = this.newReadableStreamWithController();
    controller.close();
    const cancelResult = await stream.cancel(new Error('error'));
    assertUndefined(cancelResult);
    const {done} = await stream.getReader().read();
    assertTrue(done);
  }

  async testCancel_Errored() {
    const {stream, controller} = this.newReadableStreamWithController();
    const error = new Error('error');
    controller.error(error);
    const cancelError =
        await assertRejects(stream.cancel(new Error('other-error')));
    assertEquals(error, cancelError);
  }

  async testCancel_Locked() {
    const stream = this.newReadableStream();
    stream.getReader();
    await assertRejects(stream.cancel(new Error('error')));
  }

  async testCancel_Source() {
    const cancel = recordFunction();
    const stream = this.newReadableStream({cancel});
    const reason = new Error('error');
    await stream.cancel(reason);
    cancel.assertCallCount(1);
    assertArrayEquals([reason], cancel.getLastCall().getArguments());
  }

  async testCancel_ThrowingSource() {
    const thrownError = new Error('error');
    const cancel = recordFunction(() => {
      throw thrownError;
    });
    const stream = this.newReadableStream({cancel});
    const cancelError =
        await assertRejects(stream.cancel(new Error('other-error')));
    assertEquals(thrownError, cancelError);
  }

  async testCancel_RejectingSource() {
    const rejectedError = new Error('error');
    const cancel = recordFunction(() => Promise.reject(rejectedError));
    const stream = this.newReadableStream({cancel});
    const cancelError =
        await assertRejects(stream.cancel(new Error('other-error')));
    assertEquals(rejectedError, cancelError);
  }

  async testReaderCancel() {
    const stream = this.newReadableStream();
    const reader = stream.getReader();
    const cancelResult = await reader.cancel(new Error('error'));
    assertUndefined(cancelResult);
    const {done} = await reader.read();
    assertTrue(done);
  }

  async testReaderCancel_Closed() {
    const {stream, controller} = this.newReadableStreamWithController();
    const reader = stream.getReader();
    controller.close();
    const cancelResult = await reader.cancel(new Error('error'));
    assertUndefined(cancelResult);
    const {done} = await reader.read();
    assertTrue(done);
  }

  async testReaderCancel_Errored() {
    const {stream, controller} = this.newReadableStreamWithController();
    const error = new Error('error');
    controller.error(error);
    const cancelError = await assertRejects(
        stream.getReader().cancel(new Error('other-error')));
    assertEquals(error, cancelError);
  }

  async testReaderCancel_Source() {
    const cancel = recordFunction();
    const stream = this.newReadableStream({cancel});
    const reason = new Error('error');
    await stream.getReader().cancel(reason);
    cancel.assertCallCount(1);
    assertArrayEquals([reason], cancel.getLastCall().getArguments());
  }

  async testReaderCancel_ThrowingSource() {
    const thrownError = new Error('error');
    const cancel = recordFunction(() => {
      throw thrownError;
    });
    const stream = this.newReadableStream({cancel});
    const cancelError = await assertRejects(
        stream.getReader().cancel(new Error('other-error')));
    assertEquals(thrownError, cancelError);
  }

  async testReaderCancel_RejectingSource() {
    const rejectedError = new Error('error');
    const cancel = recordFunction(() => Promise.reject(rejectedError));
    const stream = this.newReadableStream({cancel});
    const cancelError = await assertRejects(
        stream.getReader().cancel(new Error('other-error')));
    assertEquals(rejectedError, cancelError);
  }

  async testReaderCancel_ReleasedReader() {
    const stream = this.newReadableStream();
    const reader = stream.getReader();
    reader.releaseLock();
    await assertRejects(reader.cancel(new Error('error')));
  }

  testDesiredSize_Default_Decreases() {
    const {controller} = this.newReadableStreamWithController();
    assertEquals(1, controller.desiredSize);
    controller.enqueue('foo');
    assertEquals(0, controller.desiredSize);
    controller.enqueue('bar');
    assertEquals(-1, controller.desiredSize);
  }

  async testDesiredSize_Default_Increases() {
    const {stream, controller} = this.newReadableStreamWithController();
    controller.enqueue('foo');
    controller.enqueue('bar');
    controller.enqueue('baz');
    assertEquals(-2, controller.desiredSize);
    const reader = stream.getReader();
    await reader.read();
    assertEquals(-1, controller.desiredSize);
    await reader.read();
    assertEquals(0, controller.desiredSize);
    await reader.read();
    assertEquals(1, controller.desiredSize);
  }

  testDesiredSize_Default_Errored() {
    const {controller} = this.newReadableStreamWithController();
    controller.error(new Error('error'));
    assertNull(controller.desiredSize);
  }

  testDesiredSize_Default_Closed() {
    const {controller} = this.newReadableStreamWithController();
    controller.close();
    assertEquals(0, controller.desiredSize);
  }

  testDesiredSize_CustomSize_Decreases() {
    const {controller} =
        this.newReadableStreamWithController(/* underlyingSource */ undefined, {
          size: chunkSizeTwo,
        });
    assertEquals(1, controller.desiredSize);
    controller.enqueue('foo');
    assertEquals(-1, controller.desiredSize);
    controller.enqueue('bar');
    assertEquals(-3, controller.desiredSize);
  }

  async testDesiredSize_CustomSize_Increases() {
    const {stream, controller} =
        this.newReadableStreamWithController(/* underlyingSource */ undefined, {
          size: chunkSizeTwo,
        });
    controller.enqueue('foo');
    controller.enqueue('bar');
    controller.enqueue('baz');
    assertEquals(-5, controller.desiredSize);
    const reader = stream.getReader();
    await reader.read();
    assertEquals(-3, controller.desiredSize);
    await reader.read();
    assertEquals(-1, controller.desiredSize);
    await reader.read();
    assertEquals(1, controller.desiredSize);
  }

  testDesiredSize_CustomSize_Errored() {
    const {controller} =
        this.newReadableStreamWithController(/* underlyingSource */ undefined, {
          size: chunkSizeTwo,
        });
    controller.error(new Error('error'));
    assertNull(controller.desiredSize);
  }

  testDesiredSize_CustomSize_Closed() {
    const {controller} =
        this.newReadableStreamWithController(/* underlyingSource */ undefined, {
          size: chunkSizeTwo,
        });
    controller.close();
    assertEquals(0, controller.desiredSize);
  }

  testDesiredSize_CustomHighWaterMark_Decreases() {
    const {controller} =
        this.newReadableStreamWithController(/* underlyingSource */ undefined, {
          highWaterMark: 4,
        });
    assertEquals(4, controller.desiredSize);
    controller.enqueue('foo');
    assertEquals(3, controller.desiredSize);
    controller.enqueue('bar');
    assertEquals(2, controller.desiredSize);
  }

  async testDesiredSize_CustomHighWaterMark_Increases() {
    const {stream, controller} =
        this.newReadableStreamWithController(/* underlyingSource */ undefined, {
          highWaterMark: 4,
        });
    controller.enqueue('foo');
    controller.enqueue('bar');
    controller.enqueue('baz');
    assertEquals(1, controller.desiredSize);
    const reader = stream.getReader();
    await reader.read();
    assertEquals(2, controller.desiredSize);
    await reader.read();
    assertEquals(3, controller.desiredSize);
    await reader.read();
    assertEquals(4, controller.desiredSize);
  }

  testDesiredSize_CustomHighWaterMark_Errored() {
    const {controller} =
        this.newReadableStreamWithController(/* underlyingSource */ undefined, {
          highWaterMark: 4,
        });
    controller.error(new Error('error'));
    assertNull(controller.desiredSize);
  }

  testDesiredSize_CustomHighWaterMark_Closed() {
    const {controller} =
        this.newReadableStreamWithController(/* underlyingSource */ undefined, {
          highWaterMark: 4,
        });
    controller.close();
    assertEquals(0, controller.desiredSize);
  }

  testSize_Chunks() {
    const size = recordFunction(() => 1);
    const {controller} =
        this.newReadableStreamWithController(/* underlyingSource */ undefined, {
          size,
        });
    controller.enqueue('foo');
    controller.enqueue('bar');
    controller.enqueue('baz');
    size.assertCallCount(3);
    assertObjectEquals(
        [['foo'], ['bar'], ['baz']],
        size.getCalls().map((call) => call.getArguments()));
  }

  testSize_Negative() {
    const {controller} =
        this.newReadableStreamWithController(/* underlyingSource */ undefined, {
          size: () => -1,
        });
    assertThrows(() => {
      controller.enqueue('foo');
    });
  }

  testSize_Infinity() {
    const {controller} =
        this.newReadableStreamWithController(/* underlyingSource */ undefined, {
          size: () => Infinity,
        });
    assertThrows(() => {
      controller.enqueue('foo');
    });
  }

  testSize_NonNumber() {
    const {controller} =
        this.newReadableStreamWithController(/* underlyingSource */ undefined, {
          size: () => 'bar',
        });
    assertThrows(() => {
      controller.enqueue('foo');
    });
  }

  testSize_Throws() {
    const {controller} =
        this.newReadableStreamWithController(/* underlyingSource */ undefined, {
          size: () => {
            throw new Error('error');
          }
        });
    assertThrows(() => {
      controller.enqueue('foo');
    });
  }

  async testPull() {
    const pull = recordFunction();
    this.newReadableStreamWithController({pull});
    // Pull is called once after start is resolved.
    await undefined;
    pull.assertCallCount(1);
    await undefined;
    pull.assertCallCount(1);
  }

  async testPull_StartEnqueue() {
    const pull = recordFunction();
    this.newReadableStreamWithController({
      start(controller) {
        controller.enqueue('foo');
      },
      pull,
    });
    await undefined;
    // Pull is not called because the queue is full.
    pull.assertCallCount(0);
  }

  async testPull_AfterAsyncStart() {
    const pull = recordFunction();
    let resolveStart;
    const startPromise = new Promise((resolve) => {
      resolveStart = resolve;
    });
    const start = recordFunction(() => startPromise);
    this.newReadableStreamWithController({start, pull});
    await undefined;
    pull.assertCallCount(0);
    resolveStart();
    await startPromise;
    // Pull is finally called after the start promise is resolved.
    pull.assertCallCount(1);
  }

  async testPull_AfterAsyncStart_PreventsReadPulls() {
    const pull = recordFunction();
    let resolveStart;
    const startPromise = new Promise((resolve) => {
      resolveStart = resolve;
    });
    const start = recordFunction(() => startPromise);
    const {stream} = this.newReadableStreamWithController({start, pull});
    pull.assertCallCount(0);
    stream.getReader().read();
    pull.assertCallCount(0);
    resolveStart();
    await startPromise;
    // Pull is called only once for the start.
    pull.assertCallCount(1);
  }

  async testPull_AfterRead() {
    const pull = recordFunction();
    const {stream} = this.newReadableStreamWithController({pull});
    // Wait for start to finish.
    await pull.waitForCalls(1);
    pull.reset();
    stream.getReader().read();
    // Synchronously calls pull.
    pull.assertCallCount(1);
  }

  async testPull_AfterReadOnEmptyStream() {
    const pull = recordFunction();
    const {stream} = this.newReadableStreamWithController({pull});
    // Wait for start to finish.
    await pull.waitForCalls(1);
    pull.reset();
    stream.getReader().read();
    // Synchronously calls pull.
    pull.assertCallCount(1);
  }

  async testPull_AfterTwoReadsOnEmptyStream() {
    const pull = recordFunction();
    const {stream} = this.newReadableStreamWithController({pull});
    // Wait for start to finish.
    await pull.waitForCalls(1);
    pull.reset();
    const reader = stream.getReader();
    reader.read();
    // First call is synchronous.
    pull.assertCallCount(1);
    reader.read();
    // Second call is deferred.
    pull.assertCallCount(1);
    await undefined;
    pull.assertCallCount(2);
  }

  async testPull_AfterManyReadsOnEmptyStream() {
    const pull = recordFunction();
    const {stream} = this.newReadableStreamWithController({pull});
    // Wait for start to finish.
    await pull.waitForCalls(1);
    pull.reset();
    const reader = stream.getReader();
    reader.read();
    reader.read();
    reader.read();
    reader.read();
    reader.read();
    await 0;
    // Only two calls to pull happen, no matter how many reads.
    pull.assertCallCount(2);
  }

  async testPull_Asynchronous() {
    let pullResolve;
    const pullPromise = new Promise((resolve) => {
      pullResolve = resolve;
    });
    const pull = recordFunction(() => pullPromise);
    const {stream} = this.newReadableStreamWithController({pull});
    // Called by start.
    await pull.waitForCalls(1);
    const reader = stream.getReader();
    reader.read();
    reader.read();
    reader.read();
    // No calls because pull is still resolving.
    pull.assertCallCount(1);
    pullResolve();
    await pullPromise;
    // Called once the first pull resolves.
    pull.assertCallCount(2);
  }

  async testPull_Throws() {
    const pull = recordFunction(() => {
      throw new Error('error');
    });
    const {stream} = this.newReadableStreamWithController({pull});
    const reader = stream.getReader();
    await assertRejects(reader.read());
  }

  async testPull_Rejects() {
    const pull = recordFunction(() => Promise.reject(new Error('error')));
    const {stream} = this.newReadableStreamWithController({pull});
    const reader = stream.getReader();
    await assertRejects(reader.read());
  }

  async testTee() {
    const {stream, controller} = this.newReadableStreamWithController();
    controller.enqueue('1');
    controller.enqueue('2');
    controller.enqueue('3');
    controller.close();
    const [stream1, stream2] = stream.tee();
    const chunks1 = [];
    const reader1 = stream1.getReader();
    let result1 = await reader1.read();
    while (!result1.done) {
      chunks1.push(result1.value);
      result1 = await reader1.read();
    }
    assertArrayEquals(['1', '2', '3'], chunks1);
    const chunks2 = [];
    const reader2 = stream2.getReader();
    let result2 = await reader2.read();
    while (!result2.done) {
      chunks2.push(result2.value);
      result2 = await reader2.read();
    }
    assertArrayEquals(['1', '2', '3'], chunks2);
  }

  async testTee_Cancel() {
    const cancel = recordFunction();
    const {stream, controller} = this.newReadableStreamWithController({
      cancel,
    });
    const [stream1, stream2] = stream.tee();
    const cancel1Result = stream1.cancel('reason1');
    cancel.assertCallCount(0);
    await 0;  // Just in case the cancel resolves on the next tick.
    cancel.assertCallCount(0);
    const cancel2Result = stream2.cancel('reason2');
    cancel.assertCallCount(1);
    assertArrayEquals(
        ['reason1', 'reason2'], cancel.getLastCall().getArguments()[0]);
    const cancel1Value = await cancel1Result;
    const cancel2Value = await cancel2Result;
    assertUndefined(cancel1Value);
    assertUndefined(cancel2Value);
  }

  async testTee_Cancel_ReverseOrder() {
    const cancel = recordFunction();
    const {stream, controller} = this.newReadableStreamWithController({
      cancel,
    });
    const [stream1, stream2] = stream.tee();
    const cancel2Result = stream2.cancel('reason2');
    cancel.assertCallCount(0);
    await 0;  // Just in case the cancel resolves on the next tick.
    cancel.assertCallCount(0);
    const cancel1Result = stream1.cancel('reason1');
    cancel.assertCallCount(1);
    assertArrayEquals(
        ['reason1', 'reason2'], cancel.getLastCall().getArguments()[0]);
    const cancel1Value = await cancel1Result;
    const cancel2Value = await cancel2Result;
    assertUndefined(cancel1Value);
    assertUndefined(cancel2Value);
  }

  async testTee_Cancel_NoCancelOnSource() {
    const {stream, controller} = this.newReadableStreamWithController();
    const [stream1, stream2] = stream.tee();
    const cancel1Result = stream1.cancel('reason1');
    const cancel2Result = stream2.cancel('reason2');
    const cancel1Value = await cancel1Result;
    const cancel2Value = await cancel2Result;
    assertUndefined(cancel1Value);
    assertUndefined(cancel2Value);
  }

  async testTee_Cancel_Rejects() {
    const error = new Error('error');
    const cancel = recordFunction(() => {
      throw error;
    });
    const {stream, controller} = this.newReadableStreamWithController({
      cancel,
    });
    const [stream1, stream2] = stream.tee();
    const cancel1Result = stream1.cancel('reason1');
    const cancel2Result = stream2.cancel('reason2');
    const error1 = await assertRejects(cancel1Result);
    const error2 = await assertRejects(cancel2Result);
    assertEquals(error, error1);
    assertEquals(error, error2);
  }

  async testTee_Locked() {
    const stream = this.newReadableStream();
    stream.getReader();
    assertThrows(() => {
      stream.tee();
    });
  }
}

class TestCasesWithIterator extends TestCases {
  async testAsyncIterator() {
    const {stream, controller} = this.newReadableStreamWithController();
    controller.enqueue('foo');
    controller.enqueue('bar');
    controller.close();
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    assertArrayEquals(['foo', 'bar'], chunks);
  }

  async testAsyncIterator_Closed() {
    const {stream, controller} = this.newReadableStreamWithController();
    controller.close();
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    assertArrayEquals([], chunks);
  }

  async testAsyncIterator_Error() {
    const {stream, controller} = this.newReadableStreamWithController();
    controller.error(new Error('error'));
    const itr = stream[Symbol.asyncIterator]();
    assertRejects(itr.next());
  }

  async testAsyncIterator_Locked() {
    const stream = this.newReadableStream();
    stream.getReader();
    assertThrows(() => {
      stream[Symbol.asyncIterator]();
    });
  }

  async testAsyncIterator_Partial() {
    const {stream, controller} = this.newReadableStreamWithController();
    controller.enqueue('foo');
    controller.enqueue('bar');
    controller.close();
    const reader = stream.getReader();
    await reader.read();
    reader.releaseLock();
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    assertArrayEquals(['bar'], chunks);
  }

  async testAsyncIterator_Released() {
    const {stream, controller} = this.newReadableStreamWithController();
    controller.close();
    const itr = stream[Symbol.asyncIterator]();
    const {done} = await itr.next();
    assertTrue(done);
    assertRejects(itr.next());
  }

  async testAsyncIterator_Return() {
    const cancel = recordFunction();
    const {stream, controller} = this.newReadableStreamWithController({
      cancel,
    });
    const itr = stream[Symbol.asyncIterator]();
    const error = new Error('error');
    const returnResult = await itr.return(error);
    cancel.assertCallCount(1);
    assertArrayEquals([error], cancel.getLastCall().getArguments());
    assertEquals(error, returnResult.value);
    assertTrue(returnResult.done);
    const reader = stream.getReader();
    const readResult = await reader.read();
    assertUndefined(readResult.value);
    assertTrue(readResult.done);
  }

  async testAsyncIterator_PreventCancel_Return() {
    const cancel = recordFunction();
    const {stream, controller} = this.newReadableStreamWithController({
      cancel,
    });
    const itr = stream[Symbol.asyncIterator]({preventCancel: true});
    const error = new Error('error');
    const returnResult = await itr.return(error);
    cancel.assertCallCount(0);
    assertEquals(error, returnResult.value);
    assertTrue(returnResult.done);
    await assertRejects(itr.next());
  }

  testGetIterator() {
    const stream = this.newReadableStream();
    assertEquals(stream.getIterator, stream[Symbol.asyncIterator]);
  }
}

exports = {
  TestCases,
  TestCasesWithIterator,
};
