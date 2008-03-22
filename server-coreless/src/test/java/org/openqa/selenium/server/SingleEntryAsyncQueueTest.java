package org.openqa.selenium.server;

import junit.framework.TestCase;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;
import org.openqa.selenium.server.log.StdOutHandler;
import org.openqa.selenium.server.log.TerseFormatter;
import org.openqa.selenium.testworker.TrackableRunnable;
import org.openqa.selenium.testworker.TrackableThread;

import java.util.logging.Handler;
import java.util.logging.Logger;

public class SingleEntryAsyncQueueTest extends TestCase {

  private static Log log = LogFactory.getLog(SingleEntryAsyncQueueTest.class);

  private static final String testCommand = "testCommand";
  private static final String completeCommand = "testComplete";
  private static final String poisonString = "POISON";
  private static final int timeout = 3;
  
  private SingleEntryAsyncQueue<String> holder;
  
  @Override
  public void setUp() {
    configureLogging();
    holder = new SingleEntryAsyncQueue<String>(timeout);
    holder.setPoison(poisonString);
    log.info("Start test: " + getName());
  }
  
  private void configureLogging() {
      SeleniumServer.setDebugMode(true);
      SeleniumServer.configureLogging();
      Logger logger = Logger.getLogger("");
      for (Handler handler : logger.getHandlers()) {
          if (handler instanceof StdOutHandler) {
              handler.setFormatter(new TerseFormatter(true));
              break;
          }
      }
  }
  
  @Override
  public void tearDown() {
      SeleniumServer.setDebugMode(false);
      SeleniumServer.configureLogging();
  }

  public void testAssertStartingState() {
    assertNull(holder.peek());
  }
  
  public void testPollReturnsPoisonWhenPoisoned() throws Throwable {
	  TrackableThread getter = launchGetter();
	  holder.poisonPollers();
	  expectContent(getter, poisonString);
  }

	public void testPollReturnsNullAfterTimeout() {
		long now = System.currentTimeMillis();
		String nextRes = holder.pollToGetContentUntilTimeout();
		long after = System.currentTimeMillis();
		assertNull(nextRes);
		long diff = after - now;
		long expected = timeout*999;
		assertTrue("diff was too short; was <" + diff +
				"> expected at least <" + expected +
				">", after - now >= expected); // at least retry seconds
	}

	public void testPutContentPuts() {
		assertTrue(holder.isEmpty());
    boolean res = holder.putContent(testCommand);
		assertTrue(res);
		assertFalse(holder.isEmpty());
	}

	public void testPutContentTwiceFails() {
  	  assertTrue(holder.isEmpty());
      boolean res = holder.putContent(testCommand);
      assertTrue(res);
      assertFalse(holder.isEmpty());
      res = holder.putContent(completeCommand);
      assertFalse(res);
      assertEquals(testCommand, holder.peek());
	}

  public void testSimpleSingleThreaded() throws Throwable {
    injectContent(testCommand, true);
    expectContent(testCommand);
    assertTrue(holder.isEmpty()); // command got picked up.
  }

  public void testRealSimple() throws Throwable {
    TrackableThread sender = launchSender(testCommand);
    assertNotNull(sender);
    expectContent(testCommand);
    assertNull(holder.peek());
  }

	/** Note that you can't do listener first in the same thread */
  public void testListenerFirst() throws Throwable {
    // try to get "something" in a different thread
    TrackableThread getter = launchGetter();
		// now send something in this thread
		injectContent(testCommand, true);
		// can't do the expect until after we send the command; it blocks in this thread
    expectContent(getter, testCommand);
		assertNull(holder.peek());
  }

  public void testTwoRoundsSingleThreaded() throws Throwable {
    testSimpleSingleThreaded();
    injectContent(completeCommand, true);
    expectContent(completeCommand);
  }

  public void testRealTwoRounds() throws Throwable {
    // send "something"
    TrackableThread sender = launchSender(testCommand);
    assertNotNull(sender);
    // try to get "something"
    TrackableThread getter = launchGetter();
    expectContent(getter, testCommand);

    // send a final "testComplete" in the current foreground thread
		injectContent(completeCommand, true);
		// create a new getter
    TrackableThread getter2 = launchGetter();
    expectContent(getter2, completeCommand);
  }

  private void injectContent(TrackableThread commandSender, String content, boolean expected) throws Throwable {
		Boolean actual = (Boolean) commandSender.getResult();
		assertEquals(content + "content got sent", expected, actual.booleanValue());
  }

  private void injectContent(String content, boolean expected) throws Throwable {
		boolean actual = holder.putContent(content);
		assertEquals(content + "content got sent", expected, actual);
  }

  private void expectContent(TrackableThread commandGetter, String expected) throws Throwable {
    String actual = (String) commandGetter.getResult();
    assertEquals(expected + " content retrieved", expected, actual);
  }

  private void expectContent(String expected) throws Throwable {
    String actual = holder.pollToGetContentUntilTimeout();
    assertEquals(expected + " content retrieved", expected, actual);
  }

  /** start a thread to put the next command */
  private TrackableThread launchSender(String content) {
    String name = "launching sender";
    TrackableThread t = new TrackableThread(new AsyncCommandSender(content), name);
    t.start();
    return t;
  }

  /** start a thread to wait for the next command */
  private TrackableThread launchGetter() {
    String name = "launching getter";
    TrackableThread t = new TrackableThread(new AsyncCommandGetter(), name);
    t.start();
    return t;
  }

  /** Passes the specified command to command holder */
  private class AsyncCommandSender extends TrackableRunnable {
	private String content;
    
    public AsyncCommandSender(String content) {
		this.content = content;
    }
    
    @Override
    public Object go() throws Throwable {
        boolean result = holder.putContent(content);
        log.debug(Thread.currentThread().getName() + " got result: " + result);
        return new Boolean(result);
    }
  }

  /** Gets the command from the command holder */
  private class AsyncCommandGetter extends TrackableRunnable {
    
    public AsyncCommandGetter() {
    }
    
    @Override
    public Object go() throws Throwable {
        String result = holder.pollToGetContentUntilTimeout();
        log.debug(Thread.currentThread().getName() + " got result: " + result);
        return result;
    }
  }
  
}