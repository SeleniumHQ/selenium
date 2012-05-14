/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.server;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import org.apache.commons.logging.Log;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestName;
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.server.log.LoggingManager;
import org.openqa.selenium.server.log.StdOutHandler;
import org.openqa.selenium.server.log.TerseFormatter;
import org.openqa.selenium.testworker.TrackableRunnable;
import org.openqa.selenium.testworker.TrackableThread;

import java.util.logging.Handler;
import java.util.logging.Logger;

public class SingleEntryAsyncQueueUnitTest {

  @Rule public TestName name = new TestName();
  
  private static final Log logger = LogFactory.getLog(SingleEntryAsyncQueueUnitTest.class);

  private static final String testCommand = "testCommand";
  private static final String completeCommand = "testComplete";
  private static final String poisonString = "POISON";
  private static final int timeout = 3;
  private static final int MILLISECONDS = 1000;

  private SingleEntryAsyncQueue<String> queue;

  @Before
  public void setUp() throws Exception {
    configureLogging();
    queue = new SingleEntryAsyncQueue<String>(timeout);
    logger.info("Start test: " + name.getMethodName());
  }

  @After
  public void tearDown() throws Exception {
    LoggingManager.configureLogging(new RemoteControlConfiguration(), false);
  }

  @Test
  public void testPeekReturnsNullWhenEmpty() {
    assertNull(queue.peek());
  }

  @Test
  public void testPollReturnsNullAfterTimeout() {
    final String nextRes;

    nextRes = queue.pollToGetContentUntilTimeout();
    assertNull(nextRes);
  }

  @Test
  public void testPollDoesNotReturnBeforeTheTimeoutWhenTimingOut() {
    final long duration;
    final long after;
    final long now;

    now = System.currentTimeMillis();
    queue.pollToGetContentUntilTimeout();
    after = System.currentTimeMillis();
    duration = after - now;
    assertTrue("Returned too fast : " + duration + " ms", duration >= timeout * MILLISECONDS);
  }

  @Test
  public void testPollReturnAtLeastWithinTwiceTheTimeoutValueWhenTimingOut() {
    final long duration;
    final long after;
    final long now;

    now = System.currentTimeMillis();
    queue.pollToGetContentUntilTimeout();
    after = System.currentTimeMillis();
    duration = after - now;
    assertTrue("Duration more than twice the timeout: " + duration + " ms",
        duration / MILLISECONDS <= 2 * timeout);
  }

  @Test
  public void testQueueIsEmptyWhenCreated() {
    assertTrue(queue.isEmpty());
  }

  @Test
  public void testQueueNotEmptyWhenContentIsPut() {
    assertTrue(queue.putContent(testCommand));
    assertFalse(queue.isEmpty());
  }

  @Test
  public void testPutContentReturnsFalseWhenPuttingTwice() {
    queue.putContent(testCommand);
    assertFalse(queue.putContent(completeCommand));
  }

  @Test
  public void testPutContentReturnsPreviousCommandWhenPuttingTwice() {
    queue.putContent(testCommand);
    queue.putContent(completeCommand);
    assertEquals(testCommand, queue.peek());
  }

  @Test
  public void testPollingContentReturnsCommandPreviouslyPut() throws Throwable {
    queue.putContent(testCommand);
    assertEquals(testCommand, queue.pollToGetContentUntilTimeout());
  }

  @Test
  public void testCommandGotPickedUpAndQueueIsEmptyWhenPollingContentReturns() throws Throwable {
    queue.putContent(testCommand);
    queue.pollToGetContentUntilTimeout();
    assertTrue(queue.isEmpty());
  }

  @Test
  public void testCanPollTwice() throws Throwable {
    queue.putContent(testCommand);
    assertEquals(testCommand, queue.pollToGetContentUntilTimeout());
    assertTrue(queue.isEmpty());

    queue.putContent(completeCommand);
    assertEquals(completeCommand, queue.pollToGetContentUntilTimeout());
    assertTrue(queue.isEmpty());
  }

  @Test
  public void testCanPollContentThatWhatPutByADifferentThread() throws Throwable {
    new Thread(new AsyncCommandSender(testCommand), "launching sender").start();  // Thread safety reviewed
    assertEquals(testCommand, queue.pollToGetContentUntilTimeout());
    assertNull(queue.peek());
  }

  @Test
  public void testCanGetResultPostedByTheMainThreadFromAnotherThread() throws Throwable {
    final TrackableThread getter;

    /*
     * Note that you can't do listener first in the same thread
     */
    getter = new TrackableThread(new AsyncCommandGetter(), "launching getter");
    getter.start();
    assertTrue(queue.putContent(testCommand));
    assertEquals(testCommand, getter.getResult());
    assertNull(queue.peek());
  }

  @Test
  public void testCanPutAndGetResultsFromDifferentThreads() throws Throwable {
    final TrackableThread firstGetter;
    final TrackableThread secondGetter;

    new TrackableThread(new AsyncCommandSender(testCommand), "launching sender").start();
    firstGetter = new TrackableThread(new AsyncCommandGetter(), "launching firstGetter");
    firstGetter.start();
    assertEquals(testCommand, firstGetter.getResult());

    assertTrue(queue.putContent(completeCommand));
    secondGetter = new TrackableThread(new AsyncCommandGetter(), "launching firstGetter");
    secondGetter.start();
    assertEquals(completeCommand, secondGetter.getResult());
  }

  @Test
  public void testPollReturnsPoisonOncePoisonedAndPoisonPollersIsCalled() throws Throwable {
    queue.setPoison(poisonString);
    TrackableThread getter = new TrackableThread(new AsyncCommandGetter(), "launching getter");
    getter.start();
    assertTrue(queue.poisonPollers());
    assertEquals(poisonString, getter.getResult());
  }

  @Test
  public void testPoisonPollersClearContentWhenThereIsNoPoison() throws Throwable {
    queue.putContent("some command");
    assertFalse(queue.poisonPollers());
    assertTrue(queue.isEmpty());
  }


  /**
   * Passes the specified command to command holder
   */
  private class AsyncCommandSender extends TrackableRunnable {
    private final String content;

    public AsyncCommandSender(String content) {
      this.content = content;
    }

    @Override
    public Object go() throws Throwable {
      boolean result = queue.putContent(content);
      logger.debug(Thread.currentThread().getName() + " got result: " + result);
      return Boolean.valueOf(result);
    }
  }

  /**
   * Gets the command from the command holder
   */
  private class AsyncCommandGetter extends TrackableRunnable {

    public AsyncCommandGetter() {
    }

    @Override
    public Object go() throws Throwable {
      String result = queue.pollToGetContentUntilTimeout();
      logger.debug(Thread.currentThread().getName() + " got result: " + result);
      return result;
    }
  }

  private void configureLogging() throws Exception {
    LoggingManager.configureLogging(new RemoteControlConfiguration(), true);
    Logger logger = Logger.getLogger("");
    for (Handler handler : logger.getHandlers()) {
      if (handler instanceof StdOutHandler) {
        handler.setFormatter(new TerseFormatter(true));
        break;
      }
    }
  }

}
