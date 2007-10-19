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

public class CommandHolderTest extends TestCase {

  private static Log log = LogFactory.getLog(CommandHolderTest.class);

  private static final String sessionId = "1";
  private static final String testCommand = "testCommand";
  private static final String testArg1 = "arg1";
  private static final String testArg2 = "arg2";
	private static final RemoteCommand testRemoteCommand =
		new DefaultRemoteCommand(testCommand, testArg1, testArg2);
  
	private static final int retryTimeout = 2;
  private CommandHolder holder;
  
  @Override
  public void setUp() {
    configureLogging();
    holder = new CommandHolder(sessionId, retryTimeout);
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

  public void testGetCommandGeneratesRetryWhenNoCommand() {
    long now = System.currentTimeMillis();
	RemoteCommand nextCmd = holder.getCommand();
	long after = System.currentTimeMillis();
	assertNotNull(nextCmd);
	assertEquals(CommandHolder.RETRY_CMD_STRING, nextCmd.getCommand());
	assertTrue(after - now >= (retryTimeout*1000)); // at least retry seconds
	assertNull(holder.peek());
  }
	
    public void testGetCommandGeneratesNullWhenPoisoned() throws Throwable {
        TrackableRunnable internalGetter = new TrackableRunnable() {
            @Override
            public Object go() throws Throwable {
                RemoteCommand result = holder.getCommand();
                log.debug(Thread.currentThread().getName() + " got result: " + result);
                return result;
            }
        };
        String name = "launching getter";
        TrackableThread t = new TrackableThread(internalGetter, name);
        t.start();
        holder.poisonPollers();
        assertNull(t.getResult());
    }

  public void testSimpleSingleThreaded() throws Throwable {
    injectCommand(testRemoteCommand, true);
    expectCommand(testRemoteCommand);
    assertTrue(holder.isEmpty()); // command got picked up.
  }

  private void injectCommand(RemoteCommand cmd, boolean expected) throws Throwable {
		boolean actual = holder.putCommand(cmd);
		assertEquals(cmd + "command got sent", expected, actual);
  }

  private void expectCommand(RemoteCommand expected) throws Throwable {
    RemoteCommand actual = holder.getCommand();
    assertEquals(expected + " command retrieved", expected, actual);
  }
  
}
