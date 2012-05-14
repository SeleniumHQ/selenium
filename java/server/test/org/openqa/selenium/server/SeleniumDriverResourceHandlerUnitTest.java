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

import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.classextension.EasyMock.createMock;
import static org.easymock.classextension.EasyMock.createNiceMock;
import static org.easymock.classextension.EasyMock.replay;
import static org.easymock.classextension.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;

import org.junit.Ignore;
import org.junit.Test;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.selenium.server.browserlaunchers.BrowserOptions;
import org.openqa.selenium.server.commands.CaptureEntirePageScreenshotToStringCommand;
import org.openqa.selenium.server.commands.CaptureScreenshotToStringCommand;
import org.openqa.selenium.server.commands.RetrieveLastRemoteControlLogsCommand;
import org.openqa.selenium.server.commands.SeleniumCoreCommand;

import java.io.File;
import java.io.OutputStream;
import java.net.URL;
import java.util.Vector;


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
        FrameGroupCommandQueueSet.makeQueueSet(firstSessionId,
            RemoteControlConfiguration.DEFAULT_PORT, new RemoteControlConfiguration());
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
    SeleniumDriverResourceHandler sdrh = new SeleniumDriverResourceHandler(server, null);
    try {
      sdrh.getNewBrowserSession("*mock", null, "", BrowserOptions.newBrowserOptions());
      fail("Launch should have failed");
    } catch (RemoteCommandException rce) {
      // passes.
    } finally {
      server.stop();
    }
  }

  @SuppressWarnings("serial")
  @Test
  public void attachFile_preservesFileName() throws Exception {

    String fileName = "toDownload";
    String locator = "field";

    final SeleniumServer server = createMock(SeleniumServer.class);
    final FrameGroupCommandQueueSet queueSet = createMock(FrameGroupCommandQueueSet.class);

    SeleniumDriverResourceHandler handler = new SeleniumDriverResourceHandler(server, null) {
      @Override
      protected FrameGroupCommandQueueSet getQueueSet(String sessionId) {
        return queueSet;
      }

      @Override
      protected void download(URL url, File outputFile) {
      }

    };

    queueSet.addTemporaryFile((File) anyObject());
    expectLastCall().once();

    // Hack for windows...
    String tmpDir = System.getProperty("java.io.tmpdir");

    int tmpDirLength = tmpDir.length();
    if (tmpDir.lastIndexOf(File.separator) == tmpDirLength - 1) {
      tmpDir = tmpDir.substring(0, tmpDirLength - 1);
    }
    // This is where the previously downloaded file will be referenced with the same name as in the
    // call to attachFile
    expect(queueSet.doCommand("type", locator, tmpDir + File.separator + fileName)).andReturn("OK");
    replay(queueSet);

    Vector<String> values = new Vector<String>();
    values.add(locator);
    values.add("file:///" + fileName);

    String result = handler.doCommand("attachFile", values, "sessionId", null);

    assertEquals("OK", result);

    verify(queueSet);
  }

  // Running this test nukes the JVM with a System.exit. Hilarious.
  @Test @Ignore
  public void shutDownSeleniumServer_willBeProcessedInDoCommand() throws Exception {
    SeleniumServer server = createNiceMock(SeleniumServer.class);
    HttpResponse response = createNiceMock(HttpResponse.class);
    OutputStream stream = createNiceMock(OutputStream.class);

    SeleniumDriverResourceHandler handler = new SeleniumDriverResourceHandler(server, null);

    expect(response.getOutputStream()).andReturn(stream);
    response.commit();
    expectLastCall().once();
    replay(response);

    String result =
        handler.doCommand(SpecialCommand.shutDownSeleniumServer.toString(), new Vector<String>(),
            "sessionId", response);
    verify(response);

    assertEquals("OK", result);

  }

  @Test
  public void commandResultsLogMessageForARandomCommand() {
    final SeleniumDriverResourceHandler handler;

    handler = new SeleniumDriverResourceHandler(null, null);
    assertEquals("Got result: the results on session a_session_id",
        handler.commandResultsLogMessage("a command", "a_session_id", "the results"));
  }

  @Test
  public void commandResultsLogMessageForCaptureScreenshotToStringCommand() {
    final SeleniumDriverResourceHandler handler;

    handler = new SeleniumDriverResourceHandler(null, null);
    assertEquals("Got result: [base64 encoded PNG] on session a_session_id",
        handler.commandResultsLogMessage(CaptureScreenshotToStringCommand.ID, "a_session_id",
            "the results"));
  }

  @Test
  public void commandResultsLogMessageForCaptureEntirePageScreenshotToStringCommand() {
    final SeleniumDriverResourceHandler handler;

    handler = new SeleniumDriverResourceHandler(null, null);
    assertEquals("Got result: [base64 encoded PNG] on session a_session_id",
        handler.commandResultsLogMessage(CaptureEntirePageScreenshotToStringCommand.ID,
            "a_session_id", "the results"));
  }

  @Test
  public void commandResultsLogMessageForCaptureEntirePageScreenshotCommand() {
    final SeleniumDriverResourceHandler handler;

    handler = new SeleniumDriverResourceHandler(null, null);
    assertEquals("Got result: [base64 encoded PNG] on session a_session_id",
        handler.commandResultsLogMessage(SeleniumCoreCommand.CAPTURE_ENTIRE_PAGE_SCREENSHOT_ID,
            "a_session_id", "the results"));
  }

  @Test
  public void commandResultsLogMessageForRetrieveLastRemoteControlLogsCommandWhenResultsAreAShortString() {
    final SeleniumDriverResourceHandler handler;

    handler = new SeleniumDriverResourceHandler(null, null);
    assertEquals("Got result:the results... on session a_session_id",
        handler.commandResultsLogMessage(RetrieveLastRemoteControlLogsCommand.ID, "a_session_id",
            "the results"));
  }

  @Test
  public void commandResultsLogMessageForRetrieveLastRemoteControlLogsCommandWhenResultsIsA30CharacterString() {
    final SeleniumDriverResourceHandler handler;

    handler = new SeleniumDriverResourceHandler(null, null);
    assertEquals("Got result:123456789012345678901234567890... on session a_session_id",
        handler.commandResultsLogMessage(RetrieveLastRemoteControlLogsCommand.ID, "a_session_id",
            "123456789012345678901234567890"));
  }

  @Test
  public void commandResultsLogMessageForRetrieveLastRemoteControlLogsCommandTruncatesWhenResultsIsALongString() {
    final SeleniumDriverResourceHandler handler;

    handler = new SeleniumDriverResourceHandler(null, null);
    assertEquals("Got result:a very very very very very ver... on session a_session_id",
        handler.commandResultsLogMessage(RetrieveLastRemoteControlLogsCommand.ID, "a_session_id",
            "a very very very very very very very very very  long result"));
  }

}
