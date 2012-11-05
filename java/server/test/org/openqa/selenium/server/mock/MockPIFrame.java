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

package org.openqa.selenium.server.mock;

import org.openqa.selenium.server.RemoteCommand;
import org.openqa.selenium.server.WindowClosedException;

import java.util.logging.Logger;

import static org.junit.Assert.fail;

/**
 * Impersonates a single frame running in PI mode. This is basically a helper object to manage
 * BrowserRequests.
 * 
 * @author Dan Fabulich
 * 
 */
public class MockPIFrame {
  static Logger log = Logger.getLogger(MockPIFrame.class.getName());
  final String driverUrl;
  final String sessionId;
  final String uniqueId;
  String localFrameAddress;
  String seleniumWindowName;
  BrowserRequest mostRecentRequest;
  int sequenceNumber;

  /**
   * Constructs a top-level frame with a blank window name.
   * 
   * @param driverUrl the url of the Selenium Server
   * @param sessionId sessionId, should already exist in the server
   * @param uniqueId a unique string to identify this frame; normally this would be randomly
   *        generated in selenium-remoterunner.js
   */
  public MockPIFrame(String driverUrl, String sessionId, String uniqueId) {
    this(driverUrl, sessionId, uniqueId, "top", "");
  }

  /**
   * Constructs a frame.
   * 
   * @param driverUrl the url of the Selenium Server
   * @param sessionId sessionId, should already exist in the server
   * @param uniqueId a unique string to identify this frame; normally this would be randomly
   *        generated in selenium-remoterunner.js
   * @param localFrameAddress the address of the current frame; the top frame is called "top".
   * @param seleniumWindowName the name of the current window (usually this is calculated by
   *        selenium-remoterunner.js)
   */
  public MockPIFrame(String driverUrl, String sessionId, String uniqueId,
      String localFrameAddress, String seleniumWindowName) {
    this.driverUrl = driverUrl;
    this.sessionId = sessionId;
    this.uniqueId = uniqueId;
    this.localFrameAddress = localFrameAddress;
    this.seleniumWindowName = seleniumWindowName;
  }

  /** Sends a "start" request to the browser, to request the first command */
  public BrowserRequest seleniumStart() {
    log.info(uniqueId + " sends START");
    mostRecentRequest = BrowserRequest.request(getUrl() + "&seleniumStart=true", "START");
    return mostRecentRequest;
  }

  private String getUrl() {
    return driverUrl
        + '?'
        + "sessionId="
        + sessionId
        + "&uniqueId="
        + uniqueId
        + "&localFrameAddress="
        + localFrameAddress
        + "&seleniumWindowName="
        + seleniumWindowName
        + "&sequenceNumber="
        + sequenceNumber++;
  }

  /**
   * Transmits the result of the previous command
   * 
   * @param body the result of the command, e.g. "OK" or "OK,123"
   * @return request object, used to acquire the next command
   */
  public BrowserRequest sendResult(String body) {
    log.info(uniqueId + " sends " + body);
    mostRecentRequest = BrowserRequest.request(getUrl(), body);
    return mostRecentRequest;
  }

  public BrowserRequest sendClose() {
    log.info(uniqueId + "sends close");
    mostRecentRequest =
        BrowserRequest.request(getUrl() + "&closing=true",
            WindowClosedException.WINDOW_CLOSED_ERROR);
    return mostRecentRequest;
  }

  public RemoteCommand expectCommand(String cmd, String arg1, String arg2) {
    return mostRecentRequest.expectCommand(cmd, arg1, arg2);
  }

  public BrowserRequest sendRetry() {
    log.info(uniqueId + "sends retry");
    mostRecentRequest = BrowserRequest.request(getUrl() + "&retry=true", "RETRY");
    return mostRecentRequest;
  }

  /**
   * Takes a "getWhetherThisFrameMatchFrameExpression" command and tells you whether this frame
   * matches the embedded expression
   * 
   * @param identifyCommand the "getWhetherThisFrameMatchFrameExpression" command we're supposed to
   *        run
   * @return true if we match the frame expression
   */
  public boolean frameMatchesFrameExpression(RemoteCommand identifyCommand) {
    if (!"getWhetherThisFrameMatchFrameExpression".equals(identifyCommand.getCommand())) {
      fail("this isn't a frame expression: " + identifyCommand);
    }
    if ("top".equals(localFrameAddress)) {
      if (localFrameAddress.equals(identifyCommand.getField())) {
        if (localFrameAddress.equals(identifyCommand.getValue())) {
          return true;
        }
      }
    }
    fail("I'm just a mock; I can't tell whether my frame expression <" +
        seleniumWindowName + ':' + localFrameAddress +
        "> matches: " + identifyCommand);
    throw new RuntimeException("unreachable; fail() will throw");
  }

  /** returns the most recent BrowserRequest object we've seen */
  public BrowserRequest getMostRecentRequest() {
    return mostRecentRequest;
  }

  public int getSequenceNumber() {
    return sequenceNumber;
  }

  public void setSequenceNumber(int sequenceNumber) {
    this.sequenceNumber = sequenceNumber;
  }
}
