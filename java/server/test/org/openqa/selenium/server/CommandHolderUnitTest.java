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
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestName;
import org.openqa.selenium.server.log.LoggingManager;
import org.openqa.selenium.server.log.StdOutHandler;
import org.openqa.selenium.server.log.TerseFormatter;
import org.openqa.selenium.testworker.TrackableRunnable;
import org.openqa.selenium.testworker.TrackableThread;

import java.util.logging.Handler;
import java.util.logging.Logger;

public class CommandHolderUnitTest {

  @Rule public TestName name = new TestName();
  
  private static Logger log = Logger.getLogger(CommandHolderUnitTest.class.getName());

  private static final String sessionId = "1";
  private static final String testCommand = "testCommand";
  private static final String testArg1 = "arg1";
  private static final String testArg2 = "arg2";
  private static final RemoteCommand testRemoteCommand =
      new DefaultRemoteCommand(testCommand, testArg1, testArg2);

  private static final int retryTimeout = 2;
  private CommandHolder holder;

  @Before
  public void setUp() throws Exception {
    configureLogging();
    holder = new CommandHolder(sessionId, retryTimeout);
    log.info("Start test: " + name.getMethodName());
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

  @After
  public void tearDown() throws Exception {
    LoggingManager.configureLogging(new RemoteControlConfiguration(), false);
  }

  @Test
  public void testGetCommandGeneratesRetryWhenNoCommand() {
    long now = System.currentTimeMillis();
    RemoteCommand nextCmd = holder.getCommand();
    long after = System.currentTimeMillis();
    assertNotNull(nextCmd);
    assertEquals(CommandHolder.RETRY_CMD_STRING, nextCmd.getCommand());
    assertTrue(after - now >= (retryTimeout * 999)); // at least retry seconds
    assertNull(holder.peek());
  }

  @Test
  public void testGetCommandGeneratesNullWhenPoisoned() throws Throwable {
    TrackableRunnable internalGetter = new TrackableRunnable() {
      @Override
      public Object go() throws Throwable {
        RemoteCommand result = holder.getCommand();
        log.fine(Thread.currentThread().getName() + " got result: " + result);
        return result;
      }
    };
    String name = "launching getter";
    TrackableThread t = new TrackableThread(internalGetter, name);
    t.start();
    holder.poisonPollers();
    assertNull(t.getResult());
  }

  @Test
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
