package org.openqa.selenium.server.mock;

import java.io.File;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;
import org.openqa.selenium.server.DefaultRemoteCommand;
import org.openqa.selenium.server.InjectionHelper;
import org.openqa.selenium.server.RemoteCommand;
import org.openqa.selenium.server.SeleniumServer;
import org.openqa.selenium.server.WindowClosedException;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncherFactory;

public class MockPIFrameTest extends TestCase {
    
    static Log log = LogFactory.getLog(MockPIFrameTest.class);

    private static final String DRIVER_URL = "http://localhost:4444/selenium-server/driver/";
    private String sessionId;
    private SeleniumServer server;

    public MockPIFrameTest(String name) {
        super(name);
    }
    
    public static Test suitex() {
        TestSuite suite = new TestSuite();
        //for (int i= 0; i < 100; i++)
        suite.addTest(new MockPIFrameTest("testClickAndPause"));
        return suite;
    }
    
    public void setUp() throws Exception {
        setLogProperty();
        //SeleniumServer.setDebugMode(true);
        server = new SeleniumServer();
        server.setProxyInjectionMode(true);
        server.start();
        BrowserLauncherFactory.addBrowserLauncher("dummy", DummyBrowserLauncher.class);
        InjectionHelper.setFailOnError(false);
        log.info("Starting " + getName());
    }

    private void setLogProperty() {
        File target = new File("target");
        if (target.exists() && target.isDirectory()) {
            System.setProperty("selenium.log", "target/mockpiframe.log");
        } else {
            System.setProperty("selenium.log", "mockpiframe.log");
        }
    }
    
    public void tearDown() {
        server.stop();
        DummyBrowserLauncher.clearSessionId();
        InjectionHelper.setFailOnError(true);
        server.setProxyInjectionMode(false);
    }
    
    /** start a basic browser session */
    public void testStartSession() {
        startSession();
    }
    /** start a basic browser session
     * 
     * @return the currently running MockPIFrame
     * @throws Exception
     */
    public MockPIFrame startSession() {
        // 1. driver requests new session
        DriverRequest driverRequest = sendCommand("getNewBrowserSession", "*dummy", "http://x");
        // 2. server generates new session, awaits browser launch
        sessionId = waitForSessionId(driverRequest);
        // 3. browser starts, requests work
        MockPIFrame frame = new MockPIFrame(DRIVER_URL, sessionId, "frame1");
        frame.seleniumStart();
        // 4. server requests identification, asks for "getTitle"
        frame.expectCommand("getTitle", "", "");
        // 5. browser replies "selenium remote runner" to getTitle
        frame.sendResult("OK,selenium remote runner");
        // 6. server requests setContext
        frame.expectCommand("setContext", sessionId, "");
        // 7. browser replies "OK" to setContext
        frame.sendResult("OK");
        // 8. server replies "OK,123" to driver
        driverRequest.expectResult("OK,"+sessionId);
        return frame;
    }
    
    /** create a session and issue a valid "open" command */
    public void testRegularOpen() {
        openUrl();
    }

    private MockPIFrame openUrl() {
        MockPIFrame frame1 = startSession();
        
        // 1. driver issues an "open" command
        DriverRequest driverRequest = sendCommand("open", "blah.html", "");
        // 2. original frame receives open request; replies "OK" and then closes
        frame1.expectCommand("open", "blah.html", "");
        frame1.sendResult("OK");
        // 3. old frame unloads
        frame1.sendClose();
        // 4. new frame with same frame address loads and replies "START"
        MockPIFrame frame2 = new MockPIFrame(DRIVER_URL, sessionId, "frame2");
        frame2.seleniumStart();
        // 5. server automatically begins waiting for load; requests frame2 for "getTitle"
        frame2.expectCommand("getTitle", "", "");
        // 6. browser replies "blah.html"
        frame2.sendResult("OK,blah.html");
        // 7. server replies "OK" to driver's original "open" command
        driverRequest.expectResult("OK");
        return frame2;
    }
    
    /** create a session and issue a valid open command, simulating an out-of-order
     * response from the browser, as the new page load request comes in before the
     * "OK" from the original page
     */
    public void testEvilOpen() {
        MockPIFrame frame1 = startSession();
        
        // 1. driver issues an "open" command
        DriverRequest driverRequest = sendCommand("open", "blah.html", "");
        // 2. original frame receives open request
        // ... but doesn't reply "OK" yet (this is the evil part!)
        frame1.expectCommand("open", "blah.html", "");
        // 3. old frame unloads; new frame with same frame address loads and replies "START"
        MockPIFrame frame2 = new MockPIFrame(DRIVER_URL, sessionId, "frame2");
        frame2.seleniumStart();
        // X. original frame finally manages to reply "OK" to original "open" command
        sleep(100);
        frame1.sendResult("OK");
        // 4. server automatically begins waiting for load; asks frame2 for "getTitle"
        frame2.expectCommand("getTitle", "", "");
        // 5. browser replies "blah.html"
        frame2.sendResult("OK,blah.html");
        // 6. server replies "OK" to driver's original "open" command
        driverRequest.expectResult("OK");
    }
    
    /** Click, then waitForPageToLoad */
    public void testClickThenWait() {
    	MockPIFrame frame1 = startSession();
        
        DriverRequest driverRequest = sendCommand("click", "foo", "");
        frame1.expectCommand("click", "foo", "");
        frame1.sendResult("OK");
        driverRequest.expectResult("OK");
        
        driverRequest = sendCommand("waitForPageToLoad", "5000", "");
        frame1.sendClose().expectCommand("testComplete", "", "");
        MockPIFrame frame2 = new MockPIFrame(DRIVER_URL, sessionId, "frame2");
        frame2.seleniumStart();
        frame2.expectCommand("getTitle", "", "");
        frame2.sendResult("OK,newpage.html");
        driverRequest.expectResult("OK");
        
        driverRequest = sendCommand("click", "bar", "");
        frame2.expectCommand("click", "bar", "");
        frame2.sendResult("OK");
        driverRequest.expectResult("OK");
    }
    
    /** Click, then wait for page to load; but this time, frame2 starts before frame1 declares close */
    public void testEvilClickThenWait() {
    	MockPIFrame frame1 = startSession();
        BrowserRequest browserRequest = frame1.getMostRecentRequest();
        
        DriverRequest driverRequest = sendCommand("click", "foo", "");
        browserRequest.expectCommand("click", "foo", "");
        frame1.sendResult("OK");
        driverRequest.expectResult("OK");
        driverRequest = sendCommand("waitForPageToLoad", "5000", "");
        
        // this is the evil part: frame2 starts before frame1 declares close
        MockPIFrame frame2 = new MockPIFrame(DRIVER_URL, sessionId, "frame2");
        browserRequest = frame2.seleniumStart();
        
        sleep(100);
        frame1.sendClose().expectCommand("testComplete", "", "");
        
        browserRequest.expectCommand("getTitle", "", "");
        browserRequest = frame2.sendResult("OK,newpage.html");
        driverRequest.expectResult("OK");
        
        driverRequest = sendCommand("click", "bar", "");
        browserRequest.expectCommand("click", "bar", "");
        frame2.sendResult("OK");
        driverRequest.expectResult("OK");
    }
    
    /** click, then wait for page to load, but frame1 may send close before sending OK result */
    public void testEvilClickThenWaitRaceCondition() {
    	MockPIFrame frame1 = startSession();
        BrowserRequest browserRequest = frame1.getMostRecentRequest();
        
        DriverRequest driverRequest = sendCommand("click", "foo", "");
        browserRequest.expectCommand("click", "foo", "");
        
        // ideally, "OK" arrives first; in practice, server may handle these requests in any order
        frame1.sendClose();
        frame1.sendResult("OK");
        
        driverRequest.expectResult("OK");
        driverRequest = sendCommand("waitForPageToLoad", "5000", "");
        
        MockPIFrame frame2 = new MockPIFrame(DRIVER_URL, sessionId, "frame2");
        browserRequest = frame2.seleniumStart();
        
        browserRequest.expectCommand("getTitle", "", "");
        browserRequest = frame2.sendResult("OK,newpage.html");
        driverRequest.expectResult("OK");
        
        driverRequest = sendCommand("click", "bar", "");
        browserRequest.expectCommand("click", "bar", "");
        frame2.sendResult("OK");
        driverRequest.expectResult("OK");
    }
    
    /** Click, then sleep for a while, then send commands.  
     * We expect this to work; waitForPageToLoad should not be mandatory */
    public void testClickAndPause() {
    	MockPIFrame frame1 = startSession();
        BrowserRequest browserRequest = frame1.getMostRecentRequest();
        
        DriverRequest driverRequest = sendCommand("click", "foo", "");
        browserRequest.expectCommand("click", "foo", "");
        frame1.sendResult("OK");
        driverRequest.expectResult("OK");
        
        frame1.sendClose();
        MockPIFrame frame2 = new MockPIFrame(DRIVER_URL, sessionId, "frame2");
        browserRequest = frame2.seleniumStart();
        sleep(1500);
        
        driverRequest = sendCommand("click", "bar", "");
        browserRequest.expectCommand("getTitle", "", "");
        browserRequest = frame2.sendResult("OK,blah");
        browserRequest.expectCommand("click", "bar", "");
        frame2.sendResult("OK");
        driverRequest.expectResult("OK");
    }
    
    /** Click, then sleep for a while, then start waiting for page to load.
     * WaitForPageToLoad should work regardles of whether it runs before or after
     * the page loads.
     */
    public void testClickAndPauseThenWait() {
    	MockPIFrame frame1 = startSession();
        BrowserRequest browserRequest = frame1.getMostRecentRequest();
        
        DriverRequest driverRequest = sendCommand("click", "foo", "");
        browserRequest.expectCommand("click", "foo", "");
        frame1.sendResult("OK");
        driverRequest.expectResult("OK");
        
        frame1.sendClose();
        MockPIFrame frame2 = new MockPIFrame(DRIVER_URL, sessionId, "frame2");
        browserRequest = frame2.seleniumStart();
        sleep(500);
        
        driverRequest = sendCommand("waitForPageToLoad", "5000", "");
        browserRequest.expectCommand("getTitle", "", "");
        browserRequest = frame2.sendResult("OK,newpage.html");
        driverRequest.expectResult("OK");
        
        driverRequest = sendCommand("click", "bar", "");
        browserRequest.expectCommand("click", "bar", "");
        frame2.sendResult("OK");
        driverRequest.expectResult("OK");
    }
    
    /** Click, causing a page load (i.e. close and open).  Try clicking again too early;
     * you'll get a WindowClosedException, even if you click more than once.  Eventually
     * the page will load and then clicking will work again.
     */
    public void testClickForgetToWait() {
    	MockPIFrame frame1 = startSession();
        BrowserRequest browserRequest = frame1.getMostRecentRequest();
        
        DriverRequest driverRequest = sendCommand("click", "foo", "");
        browserRequest.expectCommand("click", "foo", "");
        frame1.sendResult("OK");
        driverRequest.expectResult("OK");
        
        driverRequest = sendCommand("click", "bar", "");
        frame1.sendClose();
        driverRequest.expectResult(WindowClosedException.WINDOW_CLOSED_ERROR);
        
        sendCommand("click", "bar", "").expectResult(WindowClosedException.WINDOW_CLOSED_ERROR);
        sendCommand("click", "bar", "").expectResult(WindowClosedException.WINDOW_CLOSED_ERROR);
        
        MockPIFrame frame2 = new MockPIFrame(DRIVER_URL, sessionId, "frame2");
        browserRequest = frame2.seleniumStart();
        sleep(100);
        
        driverRequest = sendCommand("click", "bar", "");
        browserRequest.expectCommand("getTitle", "", "");
        browserRequest = frame2.sendResult("OK,blah");
        browserRequest.expectCommand("click", "bar", "");
        frame2.sendResult("OK");
        driverRequest.expectResult("OK");
    }
    
    /** Test out the retryLast logic. 
     * 
     */
    public void testRetryLast() throws Exception {
        MockPIFrame frame = startSession();
        
        // 1. driver requests getTitle
        DriverRequest getTitle = sendCommand("getTitle", "", "");
        // 2. browser receives getTitle; replies "OK,foo"
        frame.expectCommand("getTitle", "", "");
        frame.sendResult("OK,foo");
        // 3. driver receives "OK,foo"
        getTitle.expectResult("OK,foo");
        // 4. browser waits around for another command that never arrives.  In 10 seconds, server replies "retryLast"
        frame.expectCommand("retryLast", "", "");
        // 5. browser retries
        frame.sendRetry();
        // 6. driver requests click
        DriverRequest click = sendCommand("click", "foo", "");
        // 7. browser receives click; replies "OK"
        frame.expectCommand("click", "foo", "");
        frame.sendResult("OK");
        // 8. server receives "OK"
        click.expectResult("OK");
    }
    
    public void testSetTimeout() throws Exception {
        MockPIFrame frame = startSession();
        
        // 1. driver requests setTimeout, server replies "OK" without contacting the browser
        sendCommand("setTimeout", "100", "").expectResult("OK");
        // 2. driver requests open
        DriverRequest open = sendCommand("open", "blah.html", "", 5000);
        // 3. original frame receives open request; replies "OK"
        frame.expectCommand("open", "blah.html", "");
        frame.sendResult("OK");
        // 4. normally, a new frame instance would come into existence, and
        // send back a "START".  But instead, time passes.
        Thread.sleep(2000);
        // 5. server replies to driver with an error message
        assertEquals("wrong error message on timeout", "timed out waiting for window \"\" to appear", open.getResult());
    }
    
    /** Open a subWindow, close the subWindow, select the mainWindow, and send it a command. */
    public void testMultiWindow() throws Exception {
        MockPIFrame frame = openUrl();
        MockPIFrame subWindow = openSubWindow(frame);
        
		// Send subWindow a "close" command
        DriverRequest driverRequest1 = sendCommand("close", "", "");
        subWindow.expectCommand("close", "", "");
        subWindow.sendResult("OK");
        subWindow.sendClose();
        driverRequest1.expectResult("OK");
        
        sendCommand("selectWindow", "null", "").expectResult("OK");
        
        DriverRequest driverRequest = sendCommand("doubleClick", "", "");
        frame.expectCommand("doubleClick", "", "");
        frame.sendResult("OK");
        driverRequest.expectResult("OK");
    }
    
    /** Open a subWindow, close the subWindow, and send a command to the closed subWindow.
     * This will fail; then we select the main window and send commands to it. */
    public void testEvilClosingWindow() throws Exception {
    	MockPIFrame frame = startSession();
        MockPIFrame subWindow = openSubWindow(frame);
        BrowserRequest mainBrowserRequest = frame.getMostRecentRequest();
        
		// Send subWindow a "close" command
        DriverRequest driverRequest = sendCommand("close", "", "");
        subWindow.expectCommand("close", "", "");
        subWindow.sendResult("OK");
        subWindow.sendClose();
        driverRequest.expectResult("OK");
        
		//The user is SUPPOSED to selectWindow(null) here, but in this test, he forgot
        //sendCommand("selectWindow", "null", "").expectResult("OK");
        
		sendCommand("doubleClick", "", "").expectResult(WindowClosedException.WINDOW_CLOSED_ERROR);
		sendCommand("doubleClick", "", "").expectResult(WindowClosedException.WINDOW_CLOSED_ERROR);
		
		sendCommand("selectWindow", "null", "").expectResult("OK");
        
        driverRequest = sendCommand("submit", "", "");
        mainBrowserRequest.expectCommand("submit", "", "");
        mainBrowserRequest = frame.sendResult("OK");
        driverRequest.expectResult("OK");
    }

    private MockPIFrame openSubWindow(MockPIFrame frame1) {
		//Let's say this page has an "openWindow" button
        //OK, let's click on it
        DriverRequest driverRequest = sendCommand("click", "openWindow", "");
        frame1.expectCommand("click", "openWindow", "");
        frame1.sendResult("OK");
        driverRequest.expectResult("OK");
        
        // wait for subWindow to popup
        driverRequest = sendCommand("waitForPopUp", "subWindow", "2000");
        MockPIFrame subWindow = new MockPIFrame(DRIVER_URL, sessionId, "subWindowId", "top", "subWindow");
        subWindow.seleniumStart();
        subWindow.expectCommand("getTitle", "", "");
        subWindow.sendResult("OK,Sub Window");
        driverRequest.expectResult("OK");
        
        // select the subWindow
        sendCommand("selectWindow", "subWindow", "").expectResult("OK");
        
        // send the subWindow a type command
        driverRequest = sendCommand("type", "subWindowLink", "foo");
        subWindow.expectCommand("type", "subWindowLink", "foo");
        subWindow.sendResult("OK");
        driverRequest.expectResult("OK");
        
        return subWindow;
	}
    
    /**
     * Open "frames.html", which we'll imagine has two subFrames: subFrame0 and subFrame1
     * @return a set containing a top frame and two subframes
     */
	public SmallFrameSet openSubFrames() {
	    MockPIFrame oldFrame = startSession();
	    
	    DriverRequest driverRequest = sendCommand("open", "frames.html", "");
	    oldFrame.expectCommand("open", "frames.html", "");
	    oldFrame.sendResult("OK");
	    oldFrame.sendClose();
	    
	    MockPIFrame subFrame0 = new MockPIFrame(DRIVER_URL, sessionId, "subFrame0Id", "top.frames[0]", "");
	    MockPIFrame subFrame1 = new MockPIFrame(DRIVER_URL, sessionId, "subFrame1Id", "top.frames[1]", "");
	    subFrame0.seleniumStart();
	    subFrame1.seleniumStart();
	    // topFrame opens last, after his subFrames have finished loading
	    MockPIFrame topFrame = new MockPIFrame(DRIVER_URL, sessionId, "frameId");
	    topFrame.seleniumStart();
	    
	    topFrame.expectCommand("getTitle", "", "");
	    topFrame.sendResult("OK,frames.html");
	    
	    driverRequest.expectResult("OK");
	    SmallFrameSet set = new SmallFrameSet(topFrame, subFrame0, subFrame1);
	    return set;
	}
	
	/** Open a page that has subframes */
	public void testSubFrames() {
	    openSubFrames();
	}
	
	/** Select a subFrame, then send an "open" command to that subFrame */
	public void testFramesOpen() {
	    SmallFrameSet set = openSubFrames();
	    
	    DriverRequest driverRequest = sendCommand("selectFrame", "subFrame1", "");
	    set.topFrame.expectCommand("getWhetherThisFrameMatchFrameExpression", "top", "subFrame1");
	    set.topFrame.sendResult("OK,false");
	    set.subFrame0.expectCommand("getWhetherThisFrameMatchFrameExpression", "top", "subFrame1");
        set.subFrame0.sendResult("OK,false");
        set.subFrame1.expectCommand("getWhetherThisFrameMatchFrameExpression", "top", "subFrame1");
        set.subFrame1.sendResult("OK,true");
        driverRequest.expectResult("OK");
        
        driverRequest = sendCommand("open", "blah.html", "");
        set.subFrame1.expectCommand("open", "blah.html", "");
        set.subFrame1.sendResult("OK");
        set.subFrame1.sendClose();
        
        MockPIFrame newSubFrame1 = new MockPIFrame(DRIVER_URL, sessionId, "newSubFrame1", "top.frames[1]", "");
        newSubFrame1.seleniumStart();
        
        newSubFrame1.expectCommand("getTitle", "", "");
        newSubFrame1.sendResult("OK,blah.html");
        driverRequest.expectResult("OK");
	}
	
	private class SmallFrameSet {
	    MockPIFrame topFrame;
	    MockPIFrame subFrame0;
	    MockPIFrame subFrame1;
        public SmallFrameSet(MockPIFrame topFrame, MockPIFrame subFrame0,
                MockPIFrame subFrame1) {
            super();
            this.topFrame = topFrame;
            this.subFrame0 = subFrame0;
            this.subFrame1 = subFrame1;
        }
	}
	
    /** Try sending two commands at once */
    public void XtestDoubleCommand() throws Exception { 
        MockPIFrame frame = startSession();
        BrowserRequest browserRequest = frame.getMostRecentRequest();
        
        // 1. driver requests click "foo"
        DriverRequest clickFoo = sendCommand("click", "foo", "");
        Thread.sleep(500);
        // 2. before the browser can respond, driver requests click "bar"
        DriverRequest clickBar = sendCommand("click", "bar", "");
        browserRequest.expectCommand("click", "foo", "");
        browserRequest = frame.sendResult("OK");
        browserRequest.expectCommand("click", "bar", "");
        frame.sendResult("OK");
        assertEquals("click foo result got mangled", "OK", clickFoo.getResult());
        assertEquals("click bar result got mangled", "OK", clickBar.getResult());
        
    }
    
    /** Extracts a sessionId from the DummyBrowserLauncher, so we
     * can use it in our tests.  Note that the original driver request
     * won't be resolved until some MockPIFrame is launched with the
     * new sessionId, so we need to extract it prior to calling getNewBrowserSession.getResult().
     * @param getNewBrowserSession a not-yet-resolved request to get a new browser session; used to get an error message if we're forced to give up
     * @return the sessionId of the requested session
     * @throws InterruptedException
     */
    private String waitForSessionId(DriverRequest getNewBrowserSession) {
        // wait until timeout
        long now = System.currentTimeMillis();
        long timeout = AsyncHttpRequest.DEFAULT_TIMEOUT;
        long finish = now + timeout;
        if (timeout == 0) {
            finish = Long.MAX_VALUE;
        }
        sleep(10);
        String sessionId;
        String result = null;
        while (System.currentTimeMillis() < finish) {
            // DummyBrowserLauncher records its sessionId in a static variable; extract it here
            sessionId = DummyBrowserLauncher.getSessionId();
            if (sessionId != null) {
                return sessionId;
            }
            if (!getNewBrowserSession.isAlive()) {
                // something must have gone wrong 
                try {
                    result = getNewBrowserSession.getResult();
                } catch (Exception e) {
                    throw new RuntimeException("sessionId never appeared", e);
                }
                throw new RuntimeException("sessionId never appeared, getNewBrowserSession said: " + result);
            }
            // The DBL must not have been launched yet; keep waiting 
            sleep(10);
        }
        sessionId = DummyBrowserLauncher.getSessionId();
        if (sessionId != null) {
            return sessionId;
        }
        // sessionId never appeared; something must have gone wrong
        try {
            result = getNewBrowserSession.getResult();
        } catch (Exception e) {
            throw new RuntimeException("sessionId never appeared", e);
        }
        throw new RuntimeException("sessionId never appeared, getNewBrowserSession said: " + result);
    }
    
    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
    
    private DriverRequest sendCommand(String cmd, String arg1, String arg2, int timeoutInMillis) {
        return sendCommand(new DefaultRemoteCommand(cmd, arg1, arg2), timeoutInMillis);
    }
    
    private DriverRequest sendCommand(String cmd, String arg1, String arg2) {
        return sendCommand(new DefaultRemoteCommand(cmd, arg1, arg2), AsyncHttpRequest.DEFAULT_TIMEOUT);
    }
    
    private DriverRequest sendCommand(RemoteCommand cmd) {
        return sendCommand(cmd, AsyncHttpRequest.DEFAULT_TIMEOUT);
    }

    private DriverRequest sendCommand(RemoteCommand cmd, int timeoutInMillis) {
        log.info("Driver sends " + cmd + " on session " + sessionId);
        return DriverRequest.request(DRIVER_URL, cmd, sessionId, timeoutInMillis);
    }
}
