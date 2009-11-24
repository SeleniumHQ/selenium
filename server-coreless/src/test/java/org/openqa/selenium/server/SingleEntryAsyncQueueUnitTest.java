package org.openqa.selenium.server;

import junit.framework.TestCase;
import org.apache.commons.logging.Log;
import org.openqa.jetty.log.LogFactory;
import org.openqa.selenium.server.log.LoggingManager;
import org.openqa.selenium.server.log.StdOutHandler;
import org.openqa.selenium.server.log.TerseFormatter;
import org.openqa.selenium.testworker.TrackableRunnable;
import org.openqa.selenium.testworker.TrackableThread;

import java.util.logging.Handler;
import java.util.logging.Logger;

public class SingleEntryAsyncQueueUnitTest extends TestCase {

    private static final Log logger = LogFactory.getLog(SingleEntryAsyncQueueUnitTest.class);

    private static final String testCommand = "testCommand";
    private static final String completeCommand = "testComplete";
    private static final String poisonString = "POISON";
    private static final int timeout = 3;
    private static final int MILLISECONDS = 1000;

    private SingleEntryAsyncQueue<String> queue;

    @Override
    public void setUp() throws Exception {
        configureLogging();
        queue = new SingleEntryAsyncQueue<String>(timeout);
        logger.info("Start test: " + getName());
    }

    @Override
    public void tearDown() throws Exception {
        LoggingManager.configureLogging(new RemoteControlConfiguration(), false);
    }

    public void testPeekReturnsNullWhenEmpty() {
        assertNull(queue.peek());
    }

    public void testPollReturnsNullAfterTimeout() {
        final String nextRes;

        nextRes = queue.pollToGetContentUntilTimeout();
        assertNull(nextRes);
    }

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

    public void testQueueIsEmptyWhenCreated() {
        assertTrue(queue.isEmpty());
    }

    public void testQueueNotEmptyWhenContentIsPut() {
        assertTrue(queue.putContent(testCommand));
        assertFalse(queue.isEmpty());
    }

    public void testPutContentReturnsFalseWhenPuttingTwice() {
        queue.putContent(testCommand);
        assertFalse(queue.putContent(completeCommand));
    }

    public void testPutContentReturnsPreviousCommandWhenPuttingTwice() {
        queue.putContent(testCommand);
        queue.putContent(completeCommand);
        assertEquals(testCommand, queue.peek());
    }

    public void testPollingContentReturnsCommandPreviouslyPut() throws Throwable {
        queue.putContent(testCommand);
        assertEquals(testCommand, queue.pollToGetContentUntilTimeout());
    }

    public void testCommandGotPickedUpAndQueueIsEmptyWhenPollingContentReturns() throws Throwable {
        queue.putContent(testCommand);
        queue.pollToGetContentUntilTimeout();
        assertTrue(queue.isEmpty());
    }

    public void testCanPollTwice() throws Throwable {
        queue.putContent(testCommand);
        assertEquals(testCommand, queue.pollToGetContentUntilTimeout());
        assertTrue(queue.isEmpty());

        queue.putContent(completeCommand);
        assertEquals(completeCommand, queue.pollToGetContentUntilTimeout());
        assertTrue(queue.isEmpty());
    }

    public void testCanPollContentThatWhatPutByADifferentThread() throws Throwable {
        new Thread(new AsyncCommandSender(testCommand), "launching sender").start();
        assertEquals(testCommand, queue.pollToGetContentUntilTimeout());
        assertNull(queue.peek());
    }

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

    public void testPollReturnsPoisonOncePoisonedAndPoisonPollersIsCalled() throws Throwable {
        queue.setPoison(poisonString);        
        TrackableThread getter = new TrackableThread(new AsyncCommandGetter(), "launching getter");
        getter.start();
        assertTrue(queue.poisonPollers());
        assertEquals(poisonString, getter.getResult());
    }

    public void testPoisonPollersClearContentWhenThereIsNoPoison() throws Throwable {
        queue.putContent("some command");
        assertFalse(queue.poisonPollers());
        assertTrue(queue.isEmpty());
    }


    /**
     * Passes the specified command to command holder
     */
    private class AsyncCommandSender extends TrackableRunnable {
        private String content;

        public AsyncCommandSender(String content) {
            this.content = content;
        }

        @Override
        public Object go() throws Throwable {
            boolean result = queue.putContent(content);
            logger.debug(Thread.currentThread().getName() + " got result: " + result);
            return new Boolean(result);
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