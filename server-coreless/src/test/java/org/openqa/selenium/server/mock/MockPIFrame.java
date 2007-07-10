package org.openqa.selenium.server.mock;

import static junit.framework.Assert.fail;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;
import org.openqa.selenium.server.RemoteCommand;

/**
 * Impersonates a single frame running in PI mode.  This is basically a helper object
 * to manage BrowserRequests.
 * @author Dan Fabulich
 *
 */
public class MockPIFrame {
    static Log log = LogFactory.getLog(MockPIFrame.class);
    final String driverUrl;
    final String sessionId;
    final String uniqueId;
    String localFrameAddress;
    String seleniumWindowName;
    BrowserRequest mostRecentRequest;
    
    /** Constructs a top-level frame with a blank window name.
     * 
     * @param driverUrl the url of the Selenium Server
     * @param sessionId sessionId, should already exist in the server
     * @param uniqueId a unique string to identify this frame; normally this would be randomly generated in selenium-remoterunner.js
     */
    public MockPIFrame(String driverUrl, String sessionId, String uniqueId) {
        this(driverUrl, sessionId, uniqueId, "top", "");
    }
    
    /** Constructs a frame.
     * 
     * @param driverUrl the url of the Selenium Server
     * @param sessionId sessionId, should already exist in the server
     * @param uniqueId a unique string to identify this frame; normally this would be randomly generated in selenium-remoterunner.js
     * @param localFrameAddress the address of the current frame; the top frame is called "top".
     * @param seleniumWindowName the name of the current window (usually this is calculated by selenium-remoterunner.js)
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
        + seleniumWindowName;
    }
    
    /** Transmits the result of the previous command
     * 
     * @param body the result of the command, e.g. "OK" or "OK,123"
     * @return request object, used to acquire the next command
     */
    public BrowserRequest sendResult(String body) {
        log.info(uniqueId + " sends " + body);
        mostRecentRequest = BrowserRequest.request(getUrl(), body);
        return mostRecentRequest;
    }
    
    /** Takes a "getWhetherThisFrameMatchFrameExpression" command and tells you
     * whether this frame matches the embedded expression
     * @param identifyCommand the "getWhetherThisFrameMatchFrameExpression" command we're supposed to run
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
    
    /** Gets the most recend request's command, assumes it's a "getWhetherThisFrameMatchFrameExpression"
     * command, runs {@link #frameMatchesFrameExpression(RemoteCommand)} and reports the result to the server.
     * This is a convenience method, because this boilerplate comes up a lot
     * @return request object, used to acquire the next command
     * @throws InterruptedException
     * @see {@link #frameMatchesFrameExpression(RemoteCommand)}
     */
    public BrowserRequest handleIdentifyCommand() throws InterruptedException {
        RemoteCommand identifyCommand = mostRecentRequest.getCommand();
        boolean matches = frameMatchesFrameExpression(identifyCommand);
        return sendResult("OK," + matches);
    }

    /** returns the most recent BrowserRequest object we've seen */
    public BrowserRequest getMostRecentRequest() {
        return mostRecentRequest;
    }
}
