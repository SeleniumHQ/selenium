package org.openqa.selenium.server;

import static org.junit.Assert.*;
import static org.easymock.classextension.EasyMock.*;

import java.io.File;
import java.net.URL;
import java.util.Vector;

import org.junit.Test;


public class SeleniumDriverResourceHandlerUnitTest {

  private static String firstSessionId = "session 1";
  private static int defaultSpeed = CommandQueue.getSpeed();
  private static int newSpeed = defaultSpeed + 42;
  private static String defaultSpeedString = "OK," + defaultSpeed;
  private static String newSpeedString = "OK," + newSpeed;
  
  @Test
  public void testGetDefaultSpeedNullSession() {
    assertEquals(defaultSpeed, CommandQueue.getSpeed());
    String speed = SeleniumDriverResourceHandler.getSpeedForSession(null);
    assertEquals(defaultSpeedString, speed);
  }
  
  @Test
  public void testGetPresetSpeedNullSession() {
    assertEquals(defaultSpeed, CommandQueue.getSpeed());
    CommandQueue.setSpeed(newSpeed);
    String speed = SeleniumDriverResourceHandler.getSpeedForSession(null);
    assertEquals(newSpeedString, speed);
    CommandQueue.setSpeed(defaultSpeed);
  }
  
  @Test
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
  
  @Test
  public void testThrowsExceptionOnFailedBrowserLaunch() throws Exception {
    RemoteControlConfiguration configuration = new RemoteControlConfiguration();
    configuration.setTimeoutInSeconds(3);
    SeleniumServer server = new SeleniumServer(false, configuration);
    server.start();
    SeleniumDriverResourceHandler sdrh = new SeleniumDriverResourceHandler(server);
    try {
      sdrh.getNewBrowserSession("*mock", null, "", new BrowserConfigurationOptions());
      fail("Launch should have failed");
    } catch (RemoteCommandException rce) {
      // passes.
    } finally {
        if (server != null) {
            server.stop();
        }
    }
  }

  @SuppressWarnings("serial")
  @Test
  public void attachFile_preservesFileName() throws Exception {
	  
	  String fileName = "toDownload";
	  String locator = "field";
	  
	  final SeleniumServer server = createMock(SeleniumServer.class);
	  final FrameGroupCommandQueueSet queueSet = createMock(FrameGroupCommandQueueSet.class);
	  
	  SeleniumDriverResourceHandler handler = new SeleniumDriverResourceHandler(server) {
		@Override
		protected FrameGroupCommandQueueSet getQueueSet(String sessionId) {
			return queueSet;
		}
		
		@Override
		protected void downloadWithAnt(URL url, File outputFile) {
		}
		
	  };
	  
	  queueSet.addTemporaryFile((File)anyObject());
	  expectLastCall().once();
	  
	  // Hack for windows...
	  String tmpDir = System.getProperty("java.io.tmpdir");
	  
	  int tmpDirLength = tmpDir.length();
	  if (tmpDir.lastIndexOf(File.separator) == tmpDirLength - 1) {
		  tmpDir = tmpDir.substring(0, tmpDirLength - 1);
	  }
	  // This is where the previously downloaded file will be referenced with the same name as in the call to attachFile
	  expect(queueSet.doCommand("type", locator, tmpDir + File.separator + fileName)).andReturn("OK");
	  replay(queueSet);
	  
	  Vector<String> values = new Vector<String>();
	  values.add(locator);
	  values.add("file:///" + fileName);
	  
	  String result = handler.doCommand("attachFile", values, "sessionId", null);
	  
	  assertEquals("OK", result);
	  
	  verify(queueSet);
  }
}
