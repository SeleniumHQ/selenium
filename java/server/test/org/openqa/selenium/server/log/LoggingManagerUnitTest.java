package org.openqa.selenium.server.log;

import org.junit.Test;
import org.openqa.selenium.server.RemoteControlConfiguration;

import static junit.framework.Assert.assertNotNull;

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

