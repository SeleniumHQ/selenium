package org.openqa.selenium.server.log;

import static junit.framework.Assert.assertNotNull;

import org.junit.Test;
import org.openqa.selenium.server.RemoteControlConfiguration;

/**
 * @author Kristian Rosenvold
 */
public class LoggingManagerUnitTest {

  @Test
  public void checkInit() {
    RemoteControlConfiguration remoteControlConfiguration = new RemoteControlConfiguration();
    LoggingManager.configureLogging(remoteControlConfiguration, true);
    assertNotNull(LoggingManager.perSessionLogHandler());
  }

  @Test
  public void testWithDontTouchLogging() {
    RemoteControlConfiguration remoteControlConfiguration = new RemoteControlConfiguration();
    remoteControlConfiguration.setDontTouchLogging(true);
    LoggingManager.configureLogging(remoteControlConfiguration, true);
    assertNotNull(LoggingManager.perSessionLogHandler());
  }
}

