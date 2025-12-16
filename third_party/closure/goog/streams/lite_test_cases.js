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

goog.module('goog.streams.liteTestCases');
goog.setTestOnly();

const {ReadableStream, ReadableStreamDefaultController, ReadableStreamUnderlyingSource} = goog.require('goog.streams.liteTypes');
/** @suppress {extraRequire} */
goog.require('goog.testing.jsunit');

class TestCases {
  /**
   * @param {function(!ReadableStreamUnderlyingSource): !ReadableStream}
   *     newReadableStream
   */
  constructor(newReadableStream) {
    /** @const */
    this.newReadableStream = newReadableStream;
  }

  /**
   * @param {!ReadableStreamUnderlyingSource=} underlyingSource
   * @return {{stream: !ReadableStream<string>, controller:
   *     !ReadableStreamDefaultController<string>}}
   */
  newReadableStreamWithController(underlyingSource = {}) {
    let controller;
    const start = underlyingSource.start;
    underlyingSource = Object.assign({}, underlyingSource, {
      start(ctlr) {
        controller = ctlr;
        return start && start(ctlr);
      },
    });
    const stream = this.newReadableStream(underlyingSource);
    return {stream, controller};
  }

  async testEnqueue_ThenRead() {
    const {stream, controller} = this.newReadableStreamWithController();
    const chunk = 'foo';
    controller.enqueue(chunk);
    const reader = stream.getReader();
    const readResult = await reader.read();
    assertFalse(readResult.done);
    assertEquals(chunk, readResult.value);
  }

  testEnqueue_Closed() {
    const {controller} = this.newReadableStreamWithController();
    controller.close();
    assertThrows(() => {
      controller.enqueue('foo');
    });
  }

  testEnqueue_Closing() {
    const {controller} = this.newReadableStreamWithController();
    controller.enqueue('foo');
    controller.close();
    assertThrows(() => {
      controller.enqueue('bar');
    });
  }

  testEnqueue_Errored() {
    const {controller} = this.newReadableStreamWithController();
    controller.error(new Error('error'));
    assertThrows(() => {
      controller.enqueue('foo');
    });
  }

  async testRead_ThenEnqueue() {
    const {stream, controller} = this.newReadableStreamWithController();
    const chunk = 'foo';
    const reader = stream.getReader();
    const read = reader.read();
    controller.enqueue(chunk);
    const readResult = await read;
    assertFalse(readResult.done);
    assertEquals(chunk, readResult.value);
  }

  async testRead_Closed() {
    const {stream, controller} = this.newReadableStreamWithController();
    controller.close();
    const reader = stream.getReader();
    const readResult = await reader.read();
    assertTrue(readResult.done);
    assertUndefined(readResult.value);
  }

  async testRead_Closing() {
    const {stream, controller} = this.newReadableStreamWithController();
    const chunk = 'foo';
    controller.enqueue(chunk);
    controller.close();
    const reader = stream.getReader();
    let readResult = await reader.read();
    assertFalse(readResult.done);
    assertEquals(chunk, readResult.value);
    readResult = await reader.read();
    assertTrue(readResult.done);
    assertUndefined(readResult.value);
  }

  async testRead_Errored() {
    const {stream, controller} = this.newReadableStreamWithController();
    const error = new Error('error');
    controller.error(error);
    const reader = stream.getReader();
    const rejectedError = await assertRejects(reader.read());
    assertEquals(error, rejectedError);
  }

  async testRead_ThenClosed() {
    const {stream, controller} = this.newReadableStreamWithController();
    const reader = stream.getReader();
    const read = reader.read();
    controller.close();
    const readResult = await read;
    assertTrue(readResult.done);
    assertUndefined(readResult.value);
  }

  async testRead_ThenErrored() {
    const {stream, controller} = this.newReadableStreamWithController();
    const error = new Error('error');
    const reader = stream.getReader();
    const read = reader.read();
    controller.error(error);
    const rejectedError = await assertRejects(read);
    assertEquals(error, rejectedError);
  }

  testClose_Closed() {
    const {controller} = this.newReadableStreamWithController();
    controller.close();
    assertThrows(() => {
      controller.close();
    });
  }

  testClose_Closing() {
    const {controller} = this.newReadableStreamWithController();
    controller.enqueue('foo');
    controller.close();
    assertThrows(() => {
      controller.close();
    });
  }

  async testLocked() {
    const {stream, controller} = this.newReadableStreamWithController();
    assertFalse(stream.locked);
    const reader = stream.getReader();
    assertTrue(stream.locked);
    reader.releaseLock();
    assertFalse(stream.locked);
  }

  testLocked_Closed() {
    const {stream, controller} = this.newReadableStreamWithController();
    const reader = stream.getReader();
    assertTrue(stream.locked);
    controller.close();
    assertTrue(stream.locked);
    reader.releaseLock();
    assertFalse(stream.locked);
  }

  testLocked_Closing() {
    const {stream, controller} = this.newReadableStreamWithController();
    const reader = stream.getReader();
    controller.enqueue('foo');
    assertTrue(stream.locked);
    controller.close();
    assertTrue(stream.locked);
    reader.releaseLock();
    assertFalse(stream.locked);
  }

  testLocked_Errored() {
    const {stream, controller} = this.newReadableStreamWithController();
    const reader = stream.getReader();
    assertTrue(stream.locked);
    controller.error(new Error('error'));
    assertTrue(stream.locked);
    reader.releaseLock();
    assertFalse(stream.locked);
  }

  async testClosed_Close() {
    const {stream, controller} = this.newReadableStreamWithController();
    controller.close();
    const reader = stream.getReader();
    const closed = reader.closed;
    const closedResult = await closed;
    assertUndefined(closedResult);
  }

  async testClosed_ThenClosed() {
    const {stream, controller} = this.newReadableStreamWithController();
    const reader = stream.getReader();
    const closed = reader.closed;
    controller.close();
    const closedResult = await closed;
    assertUndefined(closedResult);
  }

  async testClosed_Closing() {
    const {stream, controller} = this.newReadableStreamWithController();
    controller.enqueue('foo');
    controller.close();
    const reader = stream.getReader();
    const closed = reader.closed;
    await reader.read();
    const closedResult = await closed;
    assertUndefined(closedResult);
  }

  async testClosed_ThenClosing() {
    const {stream, controller} = this.newReadableStreamWithController();
    const reader = stream.getReader();
    const closed = reader.closed;
    controller.enqueue('foo');
    controller.close();
    await reader.read();
    const closedResult = await closed;
    assertUndefined(closedResult);
  }

  async testClosed_Errored() {
    const {stream, controller} = this.newReadableStreamWithController();
    const error = new Error('error');
    controller.error(error);
    const reader = stream.getReader();
    const rejectedError = await assertRejects(reader.closed);
    assertEquals(error, rejectedError);
  }

  async testClosed_ThenErrored() {
    const {stream, controller} = this.newReadableStreamWithController();
    const reader = stream.getReader();
    const closed = reader.closed;
    controller.error(new Error('error'));
    await assertRejects(closed);
  }

  async testClosed_ThenReleaseLock() {
    const {stream} = this.newReadableStreamWithController();
    const reader = stream.getReader();
    const closed = reader.closed;
    reader.releaseLock();
    await assertRejects(closed);
  }

  testGetReader_WhileLocked() {
    const {stream} = this.newReadableStreamWithController();
    stream.getReader();
    assertThrows(() => {
      stream.getReader();
    });
  }

  testReleaseLock_WhileOutstandingReads() {
    const {stream} = this.newReadableStreamWithController();
    const reader = stream.getReader();
    reader.read();
    assertThrows(() => {
      reader.releaseLock();
    });
  }

  testReleaseLock_Released() {
    const {stream} = this.newReadableStreamWithController();
    const reader = stream.getReader();
    reader.releaseLock();
    reader.releaseLock();
  }

  async testStart_RejectedPromise() {
    const error = new Error('error');
    const stream = this.newReadableStream({
      start() {
        return Promise.reject(error);
      }
    });
    const reader = stream.getReader();
    const rejectedError = await assertRejects(reader.read());
    assertEquals(error, rejectedError);
  }
}

exports = {
  TestCases,
};
