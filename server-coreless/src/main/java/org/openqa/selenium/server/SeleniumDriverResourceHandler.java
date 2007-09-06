/*
 * Copyright 2006 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package org.openqa.selenium.server;

import java.awt.AWTException;
import java.awt.Rectangle;
import java.awt.Robot;
import java.awt.Toolkit;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.lang.reflect.Field;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import javax.imageio.ImageIO;

import org.apache.commons.logging.Log;
import org.mortbay.http.HttpConnection;
import org.mortbay.http.HttpException;
import org.mortbay.http.HttpFields;
import org.mortbay.http.HttpRequest;
import org.mortbay.http.HttpResponse;
import org.mortbay.http.handler.ResourceHandler;
import org.mortbay.log.LogFactory;
import org.mortbay.util.StringUtil;
import org.openqa.selenium.server.browserlaunchers.AsyncExecute;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncher;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncherFactory;
import org.openqa.selenium.server.htmlrunner.HTMLLauncher;

/**
 * A Jetty handler that takes care of remote Selenium requests.
 * 
 * Remote Selenium requests are described in detail in the class description for
 * <code>SeleniumServer</code>
 * @see org.openqa.selenium.server.SeleniumServer
 * @author Paul Hammant
 * @version $Revision: 674 $
 */
public class SeleniumDriverResourceHandler extends ResourceHandler {
    static Log log = LogFactory.getLog(SeleniumDriverResourceHandler.class);
    static Log browserSideLog = LogFactory.getLog(SeleniumDriverResourceHandler.class.getName()+".browserSideLog");
    private final Map<String, BrowserLauncher> launchers = new HashMap<String, BrowserLauncher>();
    private SeleniumServer server;
    private static String lastSessionId = null;
    private Map<String, String> domainsBySessionId = new HashMap<String, String>();
    private Map<String, String> unusedBrowserSessions = new HashMap<String, String>();
    private Map<String, String> sessionIdsToBrowserStrings = new HashMap<String, String>();
    private StringBuffer logMessagesBuffer = new StringBuffer();
    private long previousSessionId = -1;
    private BrowserLauncherFactory browserLauncherFactory = new BrowserLauncherFactory();

    public SeleniumDriverResourceHandler(SeleniumServer server) {
        this.server = server;
    }

    /** Handy helper to retrieve the first parameter value matching the name
     * 
     * @param req - the Jetty HttpRequest
     * @param name - the HTTP parameter whose value we'll return
     * @return the value of the first HTTP parameter whose name matches <code>name</code>, or <code>null</code> if there is no such parameter
     */
    private String getParam(HttpRequest req, String name) {
        List parameterValues = req.getParameterValues(name);
        if (parameterValues == null) {
            return null;
        }
        return (String) parameterValues.get(0);
    }

    public void handle(String pathInContext, String pathParams, HttpRequest req, HttpResponse res) throws HttpException, IOException {
        try {
            res.setField(HttpFields.__ContentType, "text/plain");
            setNoCacheHeaders(res);

            String method = req.getMethod();
            String cmd = getParam(req, "cmd");
            String sessionId = getParam(req, "sessionId");
            String seleniumStart = getParam(req, "seleniumStart");
            String loggingParam = getParam(req, "logging");
            String jsStateParam = getParam(req, "state");
            String retry = getParam(req, "retry");
            String closingParam = getParam(req, "closing");
            boolean logging = "true".equals(loggingParam);
            boolean jsState = "true".equals(jsStateParam);
            boolean justLoaded = "true".equals(seleniumStart);
            boolean retrying = "true".equals(retry);
            boolean closing = "true".equals(closingParam);

            if (sessionId != null) {
                //TODO DGF log4j only
                //NDC.push("sessionId="+sessionId);
            }
            log.debug("req: "+req);
            // If this is a browser requesting work for the first time...
            if (cmd != null) {
                handleCommandRequest(req, res, cmd, sessionId);
            } else if ("POST".equalsIgnoreCase(method) || justLoaded || logging) {
                handleBrowserResponse(req, res, sessionId, logging, jsState,
						justLoaded, retrying, closing);
            } else if (-1 != req.getRequestURL().indexOf("selenium-server/core/scripts/user-extensions.js") 
                    || -1 != req.getRequestURL().indexOf("selenium-server/tests/html/tw.jpg")){
                // ignore failure to find these items...
            }
            else {
                log.debug("Not handling: " + req.getRequestURL() + "?" + req.getQuery());
                req.setHandled(false);
            }
        }
        catch (RuntimeException e) {
            if (looksLikeBrowserLaunchFailedBecauseFileNotFound(e)) {
                String apparentFile = extractNameOfFileThatCouldntBeFound(e);
                if (apparentFile!=null) {
                    log.error("Could not start browser; it appears that " + apparentFile + " is missing or inaccessible");
                }
            }
            throw e;
        } finally {
            //TODO DGF log4j only
            //NDC.remove();
        }
    }

	private void handleBrowserResponse(HttpRequest req, HttpResponse res,
			String sessionId, boolean logging, boolean jsState,
			boolean justLoaded, boolean retrying, boolean closing)
			throws IOException {
		String seleniumWindowName = getParam(req, "seleniumWindowName");
		String localFrameAddress = getParam(req, "localFrameAddress");
		FrameAddress frameAddress = FrameGroupCommandQueueSet.makeFrameAddress(seleniumWindowName, 
		        localFrameAddress);
		String uniqueId = getParam(req, "uniqueId");
		String sequenceNumberString = getParam(req, "sequenceNumber");
		int sequenceNumber = -1;
		FrameGroupCommandQueueSet queueSet = FrameGroupCommandQueueSet.getQueueSet(sessionId);
        BrowserResponseSequencer browserResponseSequencer = queueSet.getCommandQueue(uniqueId).getBrowserResponseSequencer();
		if (sequenceNumberString != null && sequenceNumberString.length() > 0) {
		    sequenceNumber = Integer.parseInt(sequenceNumberString);
	        browserResponseSequencer.waitUntilNumIsAtLeast(sequenceNumber);
		}
		
		
		String postedData = readPostedData(req, sessionId, uniqueId);
		if (logging) {
			handleLogMessages(postedData);
		} else if (jsState) {
			handleJsState(sessionId, uniqueId, postedData);
		}
		if (postedData == null || postedData.equals("") || logging
				|| jsState) {
			if (sequenceNumber != -1) {
			    browserResponseSequencer.increaseNum();
			}
			res.getOutputStream().write("\r\n\r\n".getBytes());
			req.setHandled(true);
			return;
		}
		logPostedData(frameAddress, justLoaded, sessionId, postedData,
				uniqueId);
		if (retrying) {
			postedData = null; // DGF retries don't really have a result
		}
		List jsWindowNameVar = req.getParameterValues("jsWindowNameVar");
		RemoteCommand sc = queueSet.handleCommandResult(postedData,
				frameAddress, uniqueId, justLoaded, jsWindowNameVar);
		if (sc != null) {
			respond(res, sc);
		}
		req.setHandled(true);
	}
	
    private void logPostedData(FrameAddress frameAddress, boolean justLoaded, String sessionId, String postedData, String uniqueId) {
        StringBuffer sb = new StringBuffer();
        sb.append("Browser " + sessionId + "/" + frameAddress + " " + uniqueId + " posted " + postedData);
        if (!frameAddress.isDefault()) {
            sb.append(" from " + frameAddress);
        }
        if (justLoaded) {
            sb.append(" NEW");
        }
        log.debug(sb.toString());
    }

    private void respond(HttpResponse res, RemoteCommand sc) throws IOException {
        ByteArrayOutputStream buf = new ByteArrayOutputStream(1000);
        Writer writer = new OutputStreamWriter(buf, StringUtil.__UTF_8);
        if (sc!=null) {
            writer.write(sc.toString());
            log.debug("res: " + sc.toString());
        } else {
            log.debug("res empty");
        }
        for (int pad = 998 - buf.size(); pad-- > 0;) {
            writer.write(" ");
        }
        writer.write("\015\012");
        writer.close();
        OutputStream out = res.getOutputStream();
        buf.writeTo(out);

    }

    /**
     * extract the posted data from an incoming request, stripping away a piggybacked data
     *
     * @param req
     * @param sessionId
     * @param uniqueId 
     * @return a string containing the posted data (with piggybacked log info stripped)
     * @throws IOException
     */
    private String readPostedData(HttpRequest req, String sessionId, String uniqueId) throws IOException {
        // if the request was sent as application/x-www-form-urlencoded, we can get the decoded data right away...
        // we do this because it appears that Safari likes to send the data back as application/x-www-form-urlencoded
        // even when told to send it back as application/xml. So in short, this function pulls back the data in any
        // way it can!
        if (req.getParameter("postedData") != null) {
            return req.getParameter("postedData");
        }

        InputStream is = req.getInputStream();
        StringBuffer sb = new StringBuffer();
        InputStreamReader r = new InputStreamReader(is, "UTF-8");
        int c;
        while ((c = r.read()) != -1) {
            sb.append((char) c);
        }

        String postedData = sb.toString();

        // we check here because, depending on the Selenium Core version you have, specifically the selenium-testrunner.js,
        // the data could be sent back directly or as URL-encoded for the parameter "postedData" (see above). Because
        // firefox and other browsers like to send it back as application/xml (opposite of Safari), we need to be prepared
        // to decode the data ourselves. Also, we check for the string starting with the key because in the rare case
        // someone has an outdated version selenium-testrunner.js, which, until today (3/25/2007) sent back the data
        // *un*-encoded, we'd like to be as flexible as possible.
        if (postedData.startsWith("postedData=")) {
            postedData = postedData.substring(11);
            postedData = URLDecoder.decode(postedData, "UTF-8");
        }

        return postedData;
    }

    private void handleLogMessages(String s) {
        String[] lines = s.split("\n");
        for (String line : lines) {
            if (line.startsWith("logLevel=")) {
                int logLevelIdx = line.indexOf(':', "logLevel=".length());
                String logLevel = line.substring("logLevel=".length(), logLevelIdx).toUpperCase();
                String logMessage = line.substring(logLevelIdx+1);
                if ("ERROR".equals(logLevel)) {
                    browserSideLog.error(logMessage);
                } else if ("WARN".equals(logLevel)) {
                    browserSideLog.warn(logMessage);
                } else if ("INFO".equals(logLevel)) {
                    browserSideLog.info(logMessage);
                } else {
                    // DGF debug is default
                    browserSideLog.debug(logMessage);
                }
            }
        }
    }

    private void handleJsState(String sessionId, String uniqueId, String s) {
        String jsInitializers = grepStringsStartingWith("state:", s);
        if (jsInitializers==null) {
            return;
        }
        for (String jsInitializer : jsInitializers.split("\n")) {
            String jsVarName = extractVarName(jsInitializer);
            InjectionHelper.saveJsStateInitializer(sessionId, uniqueId, jsVarName, jsInitializer);
        }
    }

    private String extractVarName(String jsInitializer) {
        int x = jsInitializer.indexOf('=');
        if (x==-1) {
            // apparently a method call, not an assignment
            // for 'browserBot.recordedAlerts.push("lskdjf")',
            // return 'browserBot.recordedAlerts':
            x = jsInitializer.lastIndexOf('(');
            if (x==-1) {
                throw new RuntimeException("expected method call, saw " + jsInitializer);
            }
            x = jsInitializer.lastIndexOf('.', x-1);
            if (x==-1) {
                throw new RuntimeException("expected method call, saw " + jsInitializer);
            }
        }
        return jsInitializer.substring(0, x);
    }

    private String grepStringsStartingWith(String pattern, String s) {
        String[] lines = s.split("\n");
        StringBuffer sb = new StringBuffer();
        String retval = null;
        for (String line : lines) {
            if (line.startsWith(pattern)) {
                sb.append(line.substring(pattern.length()))
                .append('\n');
            }
        }
        if (sb.length()!=0) {
            retval = sb.toString();
        }
        return retval;
    }

    /** Try to extract the name of the file whose absence caused the exception
     * 
     * @param e - the exception
     * @return the name of the file whose absence caused the exception
     */
    private String extractNameOfFileThatCouldntBeFound(Exception e) {
        String s = e.getMessage();
        if (s==null) {
            return null;
        }
        // will only succeed on Windows -- perhaps I will make it work on other platforms later
        return s.replaceFirst(".*CreateProcess: ", "").replaceFirst(" .*", "");
    }

    private boolean looksLikeBrowserLaunchFailedBecauseFileNotFound(Exception e) {
        String s = e.getMessage();
        // will only succeed on Windows -- perhaps I will make it work on other platforms later
        return (s!=null) && s.matches("java.io.IOException: CreateProcess: .*error=3");
    }

    private void handleCommandRequest(HttpRequest req, HttpResponse res, String cmd, String sessionId) {
        // If this a Driver Client sending a new command...
        res.setContentType("text/plain");
        hackRemoveConnectionCloseHeader(res);

        Vector<String> values = new Vector<String>();

        for (int i = 1; req.getParameter(Integer.toString(i)) != null; i++) {
            values.add(req.getParameter(Integer.toString(i)));
        }
        if (values.size() < 1) {
            values.add("");
        }
        if (values.size() < 2) {
            values.add("");
        }

        String results;
        results = doCommand(cmd, values, sessionId, res);

        // under some conditions, the results variable will be null
        // (cf http://forums.openqa.org/thread.jspa?threadID=2955&messageID=8085#8085 for an example of this)
        if (results!=null) {
            try {
                res.getOutputStream().write(results.getBytes("UTF-8"));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        req.setHandled(true);
    }

    public String doCommand(String cmd, Vector<String> values, String sessionId, HttpResponse res) {
        log.info("Command request: " + cmd + values.toString() + " on session " + sessionId);
        String results;
        // handle special commands
        if ("getNewBrowserSession".equals(cmd)) {
            String browserString = values.get(0);
            sessionId = getNewBrowserSession(browserString, values.get(1));
            setDomain(sessionId, values.get(1));
            results = "OK," + sessionId;
        } else if ("getLogMessages".equals(cmd)) {
            results = "OK," + logMessagesBuffer.toString();
            logMessagesBuffer.setLength(0);
        } else if ("testComplete".equals(cmd)) {
            results = endBrowserSession(sessionId, SeleniumServer.reusingBrowserSessions());
        } else if ("shutDown".equals(cmd)) {
            results = null;
            shutDown(res);
        } else if ("captureScreenshot".equals(cmd)) {
            try {
                captureScreenshot(values.get(0));
                results = "OK";
            } catch (Exception e) {
                log.error("Problem capturing screenshot", e);
                results = "ERROR: Problem capturing screenshot: " + e.getMessage();
            }
        } else if ("isPostSupported".equals(cmd)) {
            results = "OK,true";
        } else if ("setSpeed".equals(cmd)) {
            try {
                CommandQueue.setSpeed(Integer.parseInt(values.get(0)));
            }
            catch (NumberFormatException e) {
                return "ERROR: setSlowMode expects a string containing an integer, but saw '" + values.get(0) + "'";
            }
            results = "OK";
        } else if ("getSpeed".equals(cmd)) {
            results = "OK," + CommandQueue.getSpeed();
        } else if ("addStaticContent".equals(cmd)) {
            File dir = new File( values.get(0));
            if (dir.exists()) {
                server.addNewStaticContent(dir);
                results = "OK";
            } else {
                results = "ERROR: dir does not exist - " + dir.getAbsolutePath();
            }
        } else if ("runHTMLSuite".equals(cmd)) {
            HTMLLauncher launcher = new HTMLLauncher(server);
            File output = null;
            if (values.size() < 4) {
                results = "ERROR: Not enough arguments (browser, browserURL, suiteURL, multiWindow, [outputFile])";
            } else {
                if (values.size() > 4) {
                    output = new File(values.get(4));
                }
                
                try {
                    results = launcher.runHTMLSuite( values.get(0),  values.get(1),  values.get(2), output, SeleniumServer.getTimeoutInSeconds(), "true".equals(values.get(3)));
                } catch (IOException e) {
                    e.printStackTrace();
                    results = e.toString();
                }
            }
        } else if ("launchOnly".equals(cmd)) {
            if (values.size() < 1) {
                results = "ERROR: You must specify a browser";
            } else {
            	String browser = values.get(0);
                String newSessionId = Long.toString(System.currentTimeMillis() % 1000000);
                BrowserLauncher simpleLauncher = browserLauncherFactory.getBrowserLauncher(browser, newSessionId);
                server.registerBrowserLauncher(newSessionId, simpleLauncher);
                String baseUrl = "http://localhost:" + server.getPort();
                simpleLauncher.launchHTMLSuite("TestPrompt.html?thisIsSeleniumServer=true", baseUrl, false, "info");
                results = "OK";
            }
        } else if ("slowResources".equals(cmd)) {
            String arg = values.get(0);
            boolean setting = true;
            if ("off".equals(arg) || "false".equals(arg)) {
                setting = false;
            }
            StaticContentHandler.setSlowResources(setting);
            results = "OK";
        } else {
            if ("open".equals(cmd)) {
                warnIfApparentDomainChange(sessionId, values.get(0));
            }
            FrameGroupCommandQueueSet queue = FrameGroupCommandQueueSet.getQueueSet(sessionId);
            log.debug("Session "+sessionId+" going to doCommand("+cmd+','+values.get(0)+','+values.get(1) + ")");
            results = queue.doCommand(cmd, values.get(0), values.get(1));
        }
        log.info("Got result: " + results + " on session " + sessionId);
        return results;
    }

    private void captureScreenshot(String fileName) throws AWTException, IOException {
        Robot robot = new Robot();
        Rectangle captureSize = new Rectangle(Toolkit.getDefaultToolkit().getScreenSize());
        BufferedImage bufferedImage = robot.createScreenCapture(captureSize);
        File outFile = new File(fileName);
        ImageIO.write(bufferedImage, "png", outFile);
        
    }

    private void shutDown(HttpResponse res) {
        log.info("Shutdown command received");
        
        Runnable initiateShutDown = new Runnable() {
            public void run() {
                log.info("initiating shutdown");
                AsyncExecute.sleepTight(500);
                System.exit(0);
            }
        };
        
        Thread isd = new Thread(initiateShutDown);
        isd.setName("initiateShutDown");
        isd.start();
        
        if (res != null) {
            try {
                res.getOutputStream().write("OK".getBytes());
                res.commit();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        
    }

    private String endBrowserSession(String sessionId, boolean cacheUnused) {
        if (cacheUnused) {
            addUnusedBrowserSession(sessionId);
        }
        else {
            BrowserLauncher launcher = getLauncher(sessionId);
            if (launcher == null) {
                return "ERROR: No launcher found for sessionId " + sessionId;
            } 
            launcher.close();
            synchronized(launchers) {
                launchers.remove(sessionId);
            }
            FrameGroupCommandQueueSet.clearQueueSet(sessionId);
        }
        return "OK";
    }

    private void warnIfApparentDomainChange(String sessionId, String url) {
        if (url.startsWith("http://")) {
            String urlDomain = url.replaceFirst("^(http://[^/]+, url)/.*", "$1");
            String domain = getDomain(sessionId);
            if (domain==null) {
                setDomain(sessionId, urlDomain);
            }
            else if (!url.startsWith(domain)) {
                log.warn("you appear to be changing domains from " + domain + " to " + urlDomain + "\n"
                                   + "this may lead to a 'Permission denied' from the browser (unless it is running as *iehta or *chrome,\n"
                                   + "or alternatively the selenium server is running in proxy injection mode)");
            }
        }
    }

    private String getNewBrowserSession(String browserString, String startURL) {
        if (SeleniumServer.getForcedBrowserMode()!=null) {
            browserString = SeleniumServer.getForcedBrowserMode(); 
            log.info("overriding browser mode w/ forced browser mode setting: " + browserString);
        }
        if (SeleniumServer.isProxyInjectionMode() && browserString.equals("*iexplore")) {
            log.warn("running in proxy injection mode, but you used a *iexplore browser string; this is " +
                    "almost surely inappropriate, so I'm changing it to *piiexplore...");
            browserString = "*piiexplore";
        }
        else if (SeleniumServer.isProxyInjectionMode() && browserString.equals("*firefox")) {
            log.warn("running in proxy injection mode, but you used a *firefox browser string; this is " +
                    "almost surely inappropriate, so I'm changing it to *pifirefox...");
            browserString = "*pifirefox";
        }
        if (SeleniumServer.isProxyInjectionMode()) {
            InjectionHelper.init();
        }
        if (browserString == null) {
            throw new IllegalArgumentException("browser string may not be null");
        }
        String sessionId = getUnusedBrowserSession(browserString);
        if (sessionId != null) {
            setLastSessionId(sessionId); 
        }
        else {
            sessionId = getSessionIdWithUniqueness();
            setLastSessionId(sessionId); 
            FrameGroupCommandQueueSet queueSet = FrameGroupCommandQueueSet.makeQueueSet(sessionId);
            BrowserLauncher launcher = browserLauncherFactory.getBrowserLauncher(browserString, sessionId);
            launchers.put(sessionId, launcher);
            sessionIdsToBrowserStrings.put(sessionId, browserString);
            
            boolean multiWindow = server.isMultiWindow();
            log.info("Launching session " + sessionId);
            launcher.launchRemoteSession(startURL, multiWindow);
            queueSet.waitForLoad((long)SeleniumServer.getTimeoutInSeconds() * 1000l);
        }
        // TODO DGF log4j only
        // NDC.push("sessionId="+sessionId);
        log.info("Allocated session " + sessionId + " for " + startURL);
        FrameGroupCommandQueueSet queue = FrameGroupCommandQueueSet.getQueueSet(sessionId);
        queue.doCommand("setContext", sessionId, "");
        return sessionId;
    }

    private String getSessionIdWithUniqueness() {
        long sessionId;

        do {
            sessionId = System.currentTimeMillis() % 1000000;
        } while (sessionId == previousSessionId);
        previousSessionId = sessionId;
        return Long.toString(sessionId);
    }

    private String getUnusedBrowserSession(String browserString) {
        return unusedBrowserSessions.remove(browserString);
    }

    private void addUnusedBrowserSession(String sessionId) {
        FrameGroupCommandQueueSet.getQueueSet(sessionId).reset();
        unusedBrowserSessions.put(sessionIdsToBrowserStrings.get(sessionId), sessionId);
    }

    /** Perl and Ruby hang forever when they see "Connection: close" in the HTTP headers.
     * They see that and they think that Jetty will close the socket connection, but
     * Jetty doesn't appear to do that reliably when we're creating a process while
     * handling the HTTP response!  So, removing the "Connection: close" header so that
     * Perl and Ruby think we're morons and hang up on us in disgust.
     * @param res the HTTP response
     */
    private void hackRemoveConnectionCloseHeader(HttpResponse res) {
        // First, if Connection has been added, remove it.
        res.removeField(HttpFields.__Connection);
        // Now, claim that this connection is *actually* persistent
        Field[] fields = HttpConnection.class.getDeclaredFields();
        for (int i = 0; i < fields.length; i++) {
            if (fields[i].getName().equals("_close")) {
                Field _close = fields[i];
                _close.setAccessible(true);
                try {
                    _close.setBoolean(res.getHttpConnection(), false);
                } catch (IllegalArgumentException e) {
                    e.printStackTrace();
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                }
            }
            if (fields[i].getName().equals("_persistent")) {
                Field _close = fields[i];
                _close.setAccessible(true);
                try {
                    _close.setBoolean(res.getHttpConnection(), true);
                } catch (IllegalArgumentException e) {
                    e.printStackTrace();
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /** Retrieves a launcher for the specified sessionId, or <code>null</code> if there is no such launcher. */
    private BrowserLauncher getLauncher(String sessionId) {
        synchronized (launchers) {
            return launchers.get(sessionId);
        }
    }
    
    public void registerBrowserLauncher(String sessionId, BrowserLauncher launcher) {
        launchers.put(sessionId, launcher);
    }
    
    /** Kills all running browsers */
    public void stopAllBrowsers() {
        synchronized(launchers) {
            for (Iterator<Map.Entry<String, BrowserLauncher>> iterator = launchers.entrySet().iterator(); iterator.hasNext();)
            {
                Map.Entry<String, BrowserLauncher> entry = iterator.next();
                entry.getValue().close();
                iterator.remove();
            }
        }
    }


    public Map<String, BrowserLauncher> getLaunchers() {
        return launchers;
    }

    /** Sets all the don't-cache headers on the HttpResponse */
    private void setNoCacheHeaders(HttpResponse res) {
        res.setField(HttpFields.__CacheControl, "no-cache");
        res.setField(HttpFields.__Pragma, "no-cache");
        res.setField(HttpFields.__Expires, HttpFields.__01Jan1970);
    }

    private void setDomain(String sessionId, String domain) {
        domainsBySessionId.put(sessionId, domain);
    }

    private String getDomain(String sessionId) {
        return domainsBySessionId.get(sessionId);
    }

    public static String getLastSessionId() {
        return lastSessionId;
    }

    private static void setLastSessionId(String sessionId) {
        SeleniumDriverResourceHandler.lastSessionId = sessionId;
    }

    public BrowserLauncherFactory getBrowserLauncherFactory() {
        return browserLauncherFactory;
    }

    public void setBrowserLauncherFactory(
            BrowserLauncherFactory browserLauncherFactory) {
        this.browserLauncherFactory = browserLauncherFactory;
    }
}
