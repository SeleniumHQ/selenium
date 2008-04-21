package org.openqa.selenium.server;

import junit.framework.TestCase;

public class SeleniumDriverResourceHandlerUnitTest extends TestCase {

  private static String firstSessionId = "session 1";
  private static int defaultSpeed = CommandQueue.getSpeed();
  private static int newSpeed = defaultSpeed + 42;
  private static String defaultSpeedString = "OK," + defaultSpeed;
  private static String newSpeedString = "OK," + newSpeed;
  
  public void testGetDefaultSpeedNullSession() {
    assertEquals(defaultSpeed, CommandQueue.getSpeed());
    String speed = SeleniumDriverResourceHandler.getSpeedForSession(null);
    assertEquals(defaultSpeedString, speed);
  }
  
  public void testGetPresetSpeedNullSession() {
    assertEquals(defaultSpeed, CommandQueue.getSpeed());
    CommandQueue.setSpeed(newSpeed);
    String speed = SeleniumDriverResourceHandler.getSpeedForSession(null);
    assertEquals(newSpeedString, speed);
    CommandQueue.setSpeed(defaultSpeed);
  }
  
  public void testGetPresetSpeedValidSession() {
    assertEquals(defaultSpeed, CommandQueue.getSpeed());
    FrameGroupCommandQueueSet session1 = 
      FrameGroupCommandQueueSet.makeQueueSet(firstSessionId, RemoteControlConfiguration.DEFAULT_PORT, new RemoteControlConfiguration());
    assertNotNull(session1);
    SeleniumDriverResourceHandler.setSpeedForSession(firstSessionId, newSpeed);
    String speed = SeleniumDriverResourceHandler.getSpeedForSession(firstSessionId);
    assertEquals(newSpeedString, speed);
    FrameGroupCommandQueueSet.clearQueueSet(firstSessionId);
  }
  
  public void testThrowsExceptionOnFailedBrowserLaunch() throws Exception {
    RemoteControlConfiguration configuration = new RemoteControlConfiguration();
    configuration.setTimeoutInSeconds(3);
    SeleniumServer server = new SeleniumServer(false, configuration);
    server.start();
    SeleniumDriverResourceHandler sdrh = new SeleniumDriverResourceHandler(server);
    try {
      sdrh.getNewBrowserSession("*mock", null);
      fail("Launch should have failed");
    } catch (RemoteCommandException rce) {
      // passes.
    } finally {
        if (server != null) {
            server.stop();
        }
    }
  }
}
