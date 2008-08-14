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


import org.apache.commons.codec.binary.Base64;
import org.apache.commons.logging.Log;
import org.apache.tools.ant.Project;
import org.apache.tools.ant.taskdefs.Get;
import org.apache.tools.ant.util.FileUtils;
import org.mortbay.http.*;
import org.mortbay.http.handler.ResourceHandler;
import org.mortbay.log.LogFactory;
import org.mortbay.util.StringUtil;
import org.openqa.selenium.server.BrowserSessionFactory.BrowserSessionInfo;
import org.openqa.selenium.server.browserlaunchers.AsyncExecute;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncher;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncherFactory;
import org.openqa.selenium.server.htmlrunner.HTMLLauncher;
import org.openqa.selenium.server.log.AntJettyLoggerBuildListener;
import org.openqa.selenium.server.log.LoggingManager;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.lang.reflect.Field;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLDecoder;
import java.util.*;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

/**
 * A Jetty handler that takes care of remote Selenium requests.
 * 
 * Remote Selenium requests are described in detail in the class description for
 * <code>SeleniumServer</code>
 * @see org.openqa.selenium.server.SeleniumServer
 * @author Paul Hammant
 * @version $Revision: 674 $
 */
@SuppressWarnings("serial")
public class SeleniumDriverResourceHandler extends ResourceHandler {
    static final Log logger = LogFactory.getLog(SeleniumDriverResourceHandler.class);
    static Log browserSideLog = LogFactory.getLog(SeleniumDriverResourceHandler.class.getName()+".browserSideLog");
    
    private SeleniumServer remoteControl;
    private static String lastSessionId = null;
    private Map<String, String> domainsBySessionId = new HashMap<String, String>();
    private StringBuffer logMessagesBuffer = new StringBuffer();
    
    private BrowserLauncherFactory browserLauncherFactory = new BrowserLauncherFactory();
    private final BrowserSessionFactory browserSessionFactory = 
      new BrowserSessionFactory(browserLauncherFactory);
    
    public SeleniumDriverResourceHandler(SeleniumServer remoteControl) {
        this.remoteControl = remoteControl;
        
    }

    /** Handy helper to retrieve the first parameter value matching the name
     * 
     * @param req - the Jetty HttpRequest
     * @param name - the HTTP parameter whose value we'll return
     * @return the value of the first HTTP parameter whose name matches <code>name</code>, or <code>null</code> if there is no such parameter
     */
    private String getParam(HttpRequest req, String name) {
        List<?> parameterValues = req.getParameterValues(name);
        if (parameterValues == null) {
            return null;
        }
        return (String) parameterValues.get(0);
    }

    @Override public void handle(String pathInContext, String pathParams, HttpRequest req, HttpResponse res) throws HttpException, IOException {
        try {
            logger.debug("Thread name: " + Thread.currentThread().getName());
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

            logger.debug("req: "+req);
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
                logger.debug("Not handling: " + req.getRequestURL() + "?" + req.getQuery());
                req.setHandled(false);
            }
        } catch (RuntimeException e) {
            if (looksLikeBrowserLaunchFailedBecauseFileNotFound(e)) {
                String apparentFile = extractNameOfFileThatCouldntBeFound(e);
                if (apparentFile!=null) {
                    logger.error("Could not start browser; it appears that " + apparentFile + " is missing or inaccessible");
                }
            }
            throw e;
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
        List<?> jsWindowNameVar = req.getParameterValues("jsWindowNameVar");
        RemoteCommand sc = queueSet.handleCommandResult(postedData,
                frameAddress, uniqueId, justLoaded, jsWindowNameVar);
        if (sc != null) {
            respond(res, sc, uniqueId);
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
        logger.debug(sb.toString());
    }

    private void respond(HttpResponse res, RemoteCommand sc, String uniqueId) throws IOException {
        ByteArrayOutputStream buf = new ByteArrayOutputStream(1000);
        Writer writer = new OutputStreamWriter(buf, StringUtil.__UTF_8);
        if (sc!=null) {
            writer.write(sc.toString());
            logger.debug("res to " + uniqueId +
                    ": " + sc.toString());
        } else {
            logger.debug("res empty");
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
        final String results;
        // If this a Driver Client sending a new command...
        res.setContentType("text/plain");
        hackRemoveConnectionCloseHeader(res);

        Vector<String> values = parseSeleneseParameters(req);

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
        logger.info("Command request: " + cmd + values.toString() + " on session " + sessionId);
        String results = null;
        // handle special commands
        if ("getNewBrowserSession".equals(cmd)) {
            String browserString = values.get(0);
            String extensionJs = values.size() > 2 ? values.get(2) : "";
            String browserConfigurations = values.size() > 3 ? values.get(3) : "";
            try {
                sessionId = getNewBrowserSession(browserString, values.get(1), extensionJs, new BrowserConfigurationOptions(browserConfigurations));
                setDomain(sessionId, values.get(1));
                results = "OK," + sessionId;
            } catch (RemoteCommandException rce) {
                results = "Failed to start new browser session: " + rce.getMessage();
            }
        } else if ("getLogMessages".equals(cmd)) {
            results = "OK," + logMessagesBuffer.toString();
            logMessagesBuffer.setLength(0);
        } else if ("testComplete".equals(cmd)) {
            browserSessionFactory.endBrowserSession(sessionId, remoteControl.getConfiguration());
            results = "OK";
        } else if ("shutDown".equals(cmd) || "shutDownSeleniumServer".equals(cmd)) {
            results = null;
            shutDown(res);
        } else if ("retrieveLastRemoteControlLogs".equals(cmd)) {
            results = "OK," + LoggingManager.shortTermMemoryHandler().formattedRecords();
        } else if("attachFile".equals(cmd)) {
          FrameGroupCommandQueueSet queue = FrameGroupCommandQueueSet.getQueueSet(sessionId);
          try {
            File downloadedFile = downloadFile(values.get(1));
            queue.addTemporaryFile(downloadedFile);
            results = queue.doCommand("type", values.get(0), downloadedFile.getAbsolutePath());
          } catch (Exception e) {
            results = e.toString();
          }
        } else if ("captureScreenshot".equals(cmd)) {
            try {
                captureScreenshot(values.get(0));
                results = "OK";
            } catch (Exception e) {
                logger.error("Problem capturing screenshot", e);
                results = "ERROR: Problem capturing screenshot: " + e.getMessage();
            } 
        } else if ("captureScreenshotToString".equals(cmd)) {
            try {
                results = captureScreenshotToString();
            } catch (Exception e) {
                logger.error("Problem capturing a screenshot to string", e);
                results = "ERROR: Problem capturing a screenshot to string: " + e.getMessage();
            }  
        } else if ("keyDownNative".equals(cmd)) {
            try {
                RobotRetriever.getRobot().keyPress(Integer.parseInt(values.get(0)));
                results = "OK";
            } catch (Exception e) {
                logger.error("Problem during keyDown: ", e);
                results = "ERROR: Problem during keyDown: " + e.getMessage();
            }
        } else if ("keyUpNative".equals(cmd)) {
            try {
                RobotRetriever.getRobot().keyRelease(Integer.parseInt(values.get(0)));
                results = "OK";
            } catch (Exception e) {
                logger.error("Problem during keyUp: ", e);
                results = "ERROR: Problem during keyUp: " + e.getMessage();
            }
        } else if ("keyPressNative".equals(cmd)) {
            try {
                Robot r = RobotRetriever.getRobot();
                int keycode = Integer.parseInt(values.get(0));
                r.keyPress(keycode);
                r.waitForIdle();
                r.keyRelease(keycode);
                results = "OK";
            } catch (Exception e) {
                logger.error("Problem during keyDown: ", e);
                results = "ERROR: Problem during keyDown: " + e.getMessage();
            }
        // TODO typeKeysNative.  Requires converting String to array of keycodes.
        } else if ("isPostSupported".equals(cmd)) {
            results = "OK,true";
        } else if ("setSpeed".equals(cmd)) {
            try {
             int speed = Integer.parseInt(values.get(0));
             setSpeedForSession(sessionId, speed);
            }
            catch (NumberFormatException e) {
                return "ERROR: setSlowMode expects a string containing an integer, but saw '" + values.get(0) + "'";
            }
            results = "OK";
        } else if ("getSpeed".equals(cmd)) {
          results = getSpeedForSession(sessionId);
        } else if ("addStaticContent".equals(cmd)) {
            File dir = new File( values.get(0));
            if (dir.exists()) {
                remoteControl.addNewStaticContent(dir);
                results = "OK";
            } else {
                results = "ERROR: dir does not exist - " + dir.getAbsolutePath();
            }
        } else if ("runHTMLSuite".equals(cmd)) {
            HTMLLauncher launcher = new HTMLLauncher(remoteControl);
            File output = null;
            if (values.size() < 4) {
                results = "ERROR: Not enough arguments (browser, browserURL, suiteURL, multiWindow, [outputFile])";
            } else {
                if (values.size() > 4) {
                    output = new File(values.get(4));
                }
                
                try {
                    results = launcher.runHTMLSuite( values.get(0),  values.get(1),  values.get(2), output, remoteControl.getConfiguration().getTimeoutInSeconds(), "true".equals(values.get(3)));
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
                String newSessionId = generateNewSessionId();
                BrowserLauncher simpleLauncher = browserLauncherFactory.getBrowserLauncher(browser, newSessionId, remoteControl.getConfiguration());
                String baseUrl = "http://localhost:" + remoteControl.getPort();
                remoteControl.registerBrowserSession(new BrowserSessionInfo(
                    newSessionId, browser, baseUrl, simpleLauncher, null));
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
            try {
                FrameGroupCommandQueueSet queue = FrameGroupCommandQueueSet.getQueueSet(sessionId);
                logger.debug("Session "+sessionId+" going to doCommand("+cmd+','+values.get(0)+','+values.get(1) + ")");
                results = queue.doCommand(cmd, values.get(0), values.get(1));
            } catch (Exception e) {
                logger.error("Exception running command", e);
                results = "ERROR Server Exception: " + e.getMessage();
            }
        }

        if ("captureScreenshotToString".equals(cmd)) {
            logger.info("Got result: [base64 encoded PNG] on session " + sessionId);
        } else {
            logger.info("Got result: " + results + " on session " + sessionId);
        }
        return results;

    }

    private Vector<String> parseSeleneseParameters(HttpRequest req) {
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
        return values;
    }


    private File downloadFile(String urlString) {
        URL url;
        try {
            url = new URL(urlString);
        } catch (MalformedURLException e) {
            throw new RuntimeException("Malformed URL <" + urlString + ">, ", e);
        }
        String fileType = ".file";
        int fileTypeIndex = url.getFile().lastIndexOf(".");
        if (fileTypeIndex != -1) {
          fileType = url.getFile().substring(fileTypeIndex);
        }
        File outputFile = FileUtils.getFileUtils().createTempFile("se-", fileType, null);
        outputFile.deleteOnExit(); // to be on the safe side.
        Project p = new Project();
        p.addBuildListener(new AntJettyLoggerBuildListener(logger));
        Get g = new Get();
        g.setProject(p);
        g.setSrc(url);
        g.setDest(outputFile);
        g.execute();
        return outputFile;
    }
    
    protected static String getSpeedForSession(String sessionId) {
      String results = null;
      if (null != sessionId) {
        // get the speed for this session's queues
        FrameGroupCommandQueueSet queueSet = 
          FrameGroupCommandQueueSet.getQueueSet(sessionId);
        if (null != queueSet) {
          results = "OK," + queueSet.getSpeed();
        }
      }
      if (null == results) {
        // get the default speed for new command queues.
        results = "OK," + CommandQueue.getSpeed();
      }
      return results;
    }

    protected static void setSpeedForSession(String sessionId, int speed) {
      if (null != sessionId) {
         // set the speed for this session's queues
         FrameGroupCommandQueueSet queueSet = 
           FrameGroupCommandQueueSet.getQueueSet(sessionId);
         if (null != queueSet) {
           queueSet.setSpeed(speed);
         }
       } else {
         // otherwise set the default speed for all new command queues.
         CommandQueue.setSpeed(speed);
       }
    }

    private void captureScreenshot(String fileName) throws IOException, InterruptedException, ExecutionException, TimeoutException {
        Robot robot = RobotRetriever.getRobot();
        Rectangle captureSize = new Rectangle(Toolkit.getDefaultToolkit().getScreenSize());
        BufferedImage bufferedImage = robot.createScreenCapture(captureSize);
        File outFile = new File(fileName);
        ImageIO.write(bufferedImage, "png", outFile);
        
    }

    /**
     *  This method captures a full screen shot of the current screen using the 
     *  Robot class.  
     *  
     * @return a base 64 encoded string of the screenshot (a png image file)
     * @throws InterruptedException
     * @throws ExecutionException
     * @throws TimeoutException
     * @throws IOException
     */
    private String captureScreenshotToString() throws InterruptedException, ExecutionException, TimeoutException, IOException {  
        Robot robot = RobotRetriever.getRobot();
        Rectangle captureSize = new Rectangle(Toolkit.getDefaultToolkit().getScreenSize());
        BufferedImage bufferedImage = robot.createScreenCapture(captureSize);
        ByteArrayOutputStream outStream = new ByteArrayOutputStream();
        ImageIO.write(bufferedImage, "png", outStream);
        byte[] encodedData = Base64.encodeBase64(outStream.toByteArray());
        return "OK," + new String(encodedData);
    }

    private void shutDown(HttpResponse res) {
        logger.info("Shutdown command received");
        
        Runnable initiateShutDown = new Runnable() {
            public void run() {
                logger.info("initiating shutdown");
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

    private void warnIfApparentDomainChange(String sessionId, String url) {
        if (url.startsWith("http://")) {
            String urlDomain = url.replaceFirst("^(http://[^/]+, url)/.*", "$1");
            String domain = getDomain(sessionId);
            if (domain==null) {
                setDomain(sessionId, urlDomain);
            }
            else if (!url.startsWith(domain)) {
                logger.warn("you appear to be changing domains from " + domain + " to " + urlDomain + "\n"
                                   + "this may lead to a 'Permission denied' from the browser (unless it is running as *iehta or *chrome,\n"
                                   + "or alternatively the selenium server is running in proxy injection mode)");
            }
        }
    }

    private String generateNewSessionId() {
        return UUID.randomUUID().toString().replaceAll("-", "");
    }

    protected String getNewBrowserSession(String browserString, String startURL, String extensionJs,
            BrowserConfigurationOptions browserConfigurations)
        throws RemoteCommandException {
        BrowserSessionInfo sessionInfo =  browserSessionFactory
            .getNewBrowserSession(browserString, startURL, extensionJs, 
                    browserConfigurations, remoteControl.getConfiguration());
        setLastSessionId(sessionInfo.sessionId); 
        return sessionInfo.sessionId;
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
    
    /**
     * Registers the given browser session among the active sessions
     * to handle.
     * 
     * Usually externally created browser sessions are managed themselves,
     * but registering them allows the shutdown procedures to be simpler.
     * 
     * @param sessionInfo the externally created browser session to register.
     */
    public void registerBrowserSession(BrowserSessionInfo sessionInfo) {
      browserSessionFactory.registerExternalSession(sessionInfo);
    }
    
    /**
     * De-registers the given browser session from among the active sessions.
     * 
     * When an externally managed but registered session is closed, 
     * this method should be called to keep the set of active sessions 
     * up to date.
     * 
     * @param sessionInfo the session to deregister.
     */
    public void deregisterBrowserSession(BrowserSessionInfo sessionInfo) {
      browserSessionFactory.deregisterExternalSession(sessionInfo);
    }
    
    /** Kills all running browsers */
    public void stopAllBrowsers() {
      browserSessionFactory.endAllBrowserSessions(remoteControl.getConfiguration());
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
