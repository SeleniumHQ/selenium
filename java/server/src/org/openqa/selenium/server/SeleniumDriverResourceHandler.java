/*
 * Copyright 2011 Software Freedom Conservancy.
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


import com.google.common.base.Throwables;
import com.google.common.io.Resources;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.browserlaunchers.BrowserLauncher;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.server.BrowserSessionFactory.BrowserSessionInfo;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncherFactory;
import org.openqa.selenium.server.browserlaunchers.BrowserOptions;
import org.openqa.selenium.server.browserlaunchers.InvalidBrowserExecutableException;
import org.openqa.selenium.server.commands.AddCustomRequestHeaderCommand;
import org.openqa.selenium.server.commands.CaptureEntirePageScreenshotToStringCommand;
import org.openqa.selenium.server.commands.CaptureNetworkTrafficCommand;
import org.openqa.selenium.server.commands.CaptureScreenshotCommand;
import org.openqa.selenium.server.commands.CaptureScreenshotToStringCommand;
import org.openqa.selenium.server.commands.RetrieveLastRemoteControlLogsCommand;
import org.openqa.selenium.server.commands.SeleniumCoreCommand;
import org.openqa.selenium.server.htmlrunner.HTMLLauncher;
import org.openqa.selenium.server.log.LoggingManager;

import org.apache.commons.logging.Log;
import org.openqa.jetty.http.HttpConnection;
import org.openqa.jetty.http.HttpException;
import org.openqa.jetty.http.HttpFields;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.http.handler.ResourceHandler;
import org.openqa.jetty.log.LogFactory;
import org.openqa.jetty.util.StringUtil;
import org.openqa.selenium.server.log.PerSessionLogHandler;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.lang.reflect.Field;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * A Jetty handler that takes care of remote Selenium requests.
 * <p/>
 * Remote Selenium requests are described in detail in the class description for
 * <code>SeleniumServer</code>
 * 
 * @author Paul Hammant
 * @version $Revision: 674 $
 * @see org.openqa.selenium.server.SeleniumServer
 */
@SuppressWarnings("serial")
public class SeleniumDriverResourceHandler extends ResourceHandler {
  static final Logger log = Logger.getLogger(SeleniumDriverResourceHandler.class.getName());
  static Log browserSideLog =
      LogFactory.getLog(SeleniumDriverResourceHandler.class.getName() + ".browserSideLog");

  private SeleniumServer remoteControl;
  private Map<String, String> domainsBySessionId = new HashMap<String, String>();
  private StringBuffer logMessagesBuffer = new StringBuffer();

  private BrowserLauncherFactory browserLauncherFactory;
  private final BrowserSessionFactory browserSessionFactory;

  public SeleniumDriverResourceHandler(
      SeleniumServer remoteControl, DriverSessions webdriverSessions) {
    browserLauncherFactory = new BrowserLauncherFactory(webdriverSessions);
    browserSessionFactory = new BrowserSessionFactory(browserLauncherFactory);
    this.remoteControl = remoteControl;
  }

  /**
   * Handy helper to retrieve the first parameter value matching the name
   * 
   * @param req - the Jetty HttpRequest
   * @param name - the HTTP parameter whose value we'll return
   * @return the value of the first HTTP parameter whose name matches <code>name</code>, or
   *         <code>null</code> if there is no such parameter
   */
  private String getParam(HttpRequest req, String name) {
    List<?> parameterValues = req.getParameterValues(name);
    if (parameterValues == null) {
      return null;
    }
    return (String) parameterValues.get(0);
  }

  @Override
  public void handle(String pathInContext, String pathParams, HttpRequest req, HttpResponse res)
      throws HttpException, IOException {
    final PerSessionLogHandler perSessionLogHandler = LoggingManager.perSessionLogHandler();
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
        perSessionLogHandler.attachToCurrentThread(new SessionId(sessionId));
      }
      log.fine("req: " + req);
      // If this is a browser requesting work for the first time...
      if (cmd != null) {
        handleCommandRequest(req, res, cmd, sessionId);
      } else if ("POST".equalsIgnoreCase(method) || justLoaded || logging) {
        handleBrowserResponse(req, res, sessionId, logging, jsState,
            justLoaded, retrying, closing);
      } else if (-1 != req.getRequestURL().indexOf(
          "selenium-server/core/scripts/user-extensions.js")
          ||
          -1 != req.getRequestURL().indexOf("selenium-server/tests/html/tw.jpg")) {
        // ignore failure to find these items...
      } else {
        log.fine("Not handling: " + req.getRequestURL() + "?" + req.getQuery());
        req.setHandled(false);
      }
    } catch (RuntimeException e) {
      if (looksLikeBrowserLaunchFailedBecauseFileNotFound(e)) {
        String apparentFile = extractNameOfFileThatCouldntBeFound(e);
        if (apparentFile != null) {
          log.severe("Could not start browser; it appears that " + apparentFile
              + " is missing or inaccessible");
        }
      }
      throw e;
    } finally {
      perSessionLogHandler.detachFromCurrentThread();
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
    BrowserResponseSequencer browserResponseSequencer =
        queueSet.getCommandQueue(uniqueId).getBrowserResponseSequencer();
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

  private void logPostedData(FrameAddress frameAddress, boolean justLoaded, String sessionId,
      String postedData, String uniqueId) {
    StringBuffer sb = new StringBuffer();
    sb.append(
        "Browser " + sessionId + "/" + frameAddress + " " + uniqueId + " posted " + postedData);
    if (!frameAddress.isDefault()) {
      sb.append(" from " + frameAddress);
    }
    if (justLoaded) {
      sb.append(" NEW");
    }
    log.fine(sb.toString());
  }

  private void respond(HttpResponse res, RemoteCommand sc, String uniqueId) throws IOException {
    ByteArrayOutputStream buf = new ByteArrayOutputStream(1000);
    Writer writer = new OutputStreamWriter(buf, StringUtil.__UTF_8);
    if (sc != null) {
      writer.write(sc.toString());
      log.fine("res to " + uniqueId +
          ": " + sc.toString());
    } else {
      log.fine("res empty");
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
  private String readPostedData(HttpRequest req, String sessionId, String uniqueId)
      throws IOException {
    // if the request was sent as application/x-www-form-urlencoded, we can get the decoded data
    // right away...
    // we do this because it appears that Safari likes to send the data back as
    // application/x-www-form-urlencoded
    // even when told to send it back as application/xml. So in short, this function pulls back the
    // data in any
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

    // we check here because, depending on the Selenium Core version you have, specifically the
    // selenium-testrunner.js,
    // the data could be sent back directly or as URL-encoded for the parameter "postedData" (see
    // above). Because
    // firefox and other browsers like to send it back as application/xml (opposite of Safari), we
    // need to be prepared
    // to decode the data ourselves. Also, we check for the string starting with the key because in
    // the rare case
    // someone has an outdated version selenium-testrunner.js, which, until today (3/25/2007) sent
    // back the data
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
        String logMessage = line.substring(logLevelIdx + 1);
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
    if (jsInitializers == null) {
      return;
    }
    for (String jsInitializer : jsInitializers.split("\n")) {
      String jsVarName = extractVarName(jsInitializer);
      InjectionHelper.saveJsStateInitializer(sessionId, uniqueId, jsVarName, jsInitializer);
    }
  }

  private String extractVarName(String jsInitializer) {
    int x = jsInitializer.indexOf('=');
    if (x == -1) {
      // apparently a method call, not an assignment
      // for 'browserBot.recordedAlerts.push("lskdjf")',
      // return 'browserBot.recordedAlerts':
      x = jsInitializer.lastIndexOf('(');
      if (x == -1) {
        throw new RuntimeException("expected method call, saw " + jsInitializer);
      }
      x = jsInitializer.lastIndexOf('.', x - 1);
      if (x == -1) {
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
    if (sb.length() != 0) {
      retval = sb.toString();
    }
    return retval;
  }

  /**
   * Try to extract the name of the file whose absence caused the exception
   * 
   * @param e - the exception
   * @return the name of the file whose absence caused the exception
   */
  private String extractNameOfFileThatCouldntBeFound(Exception e) {
    String s = e.getMessage();
    if (s == null) {
      return null;
    }
    // will only succeed on Windows -- perhaps I will make it work on other platforms later
    return s.replaceFirst(".*CreateProcess: ", "").replaceFirst(" .*", "");
  }

  private boolean looksLikeBrowserLaunchFailedBecauseFileNotFound(Exception e) {
    String s = e.getMessage();
    // will only succeed on Windows -- perhaps I will make it work on other platforms later
    return (s != null) && s.matches("java.io.IOException: CreateProcess: .*error=3");
  }

  private void handleCommandRequest(HttpRequest req, HttpResponse res, String cmd, String sessionId) {
    final String results;
    // If this a Driver Client sending a new command...
    res.setContentType("text/plain");
    hackRemoveConnectionCloseHeader(res);

    Vector<String> values = parseSeleneseParameters(req);

    results = doCommand(cmd, values, sessionId, res);

    // under some conditions, the results variable will be null
    // (cf http://forums.openqa.org/thread.jspa?threadID=2955&messageID=8085#8085 for an example of
    // this)
    if (results != null) {
      try {
        res.getOutputStream().write(results.getBytes("UTF-8"));
      } catch (IOException e) {
        e.printStackTrace();
      }
    }

    req.setHandled(true);
  }

  protected FrameGroupCommandQueueSet getQueueSet(String sessionId) {
    return FrameGroupCommandQueueSet.getQueueSet(sessionId);
  }

  public String doCommand(String cmd, Vector<String> values, String sessionId, HttpResponse res) {
    log.info("Command request: " + cmd + values.toString() + " on session " + sessionId);
    String results = null;
    // handle special commands
    switch (SpecialCommand.getValue(cmd)) {
      case getNewBrowserSession:
        String browserString = values.get(0);
        String extensionJs = values.size() > 2 ? values.get(2) : "";
        String browserConfigurations = values.size() > 3 ? values.get(3) : "";
        try {
          sessionId = getNewBrowserSession(browserString, values.get(1), extensionJs,
              BrowserOptions.newBrowserOptions(browserConfigurations));
          LoggingManager.perSessionLogHandler().attachToCurrentThread(new SessionId(sessionId));

          setDomain(sessionId, values.get(1));
          results = "OK," + sessionId;
        } catch (RemoteCommandException rce) {
          results = "Failed to start new browser session: " + rce.getMessage();
        } catch (InvalidBrowserExecutableException ibex) {
          results = "Failed to start new browser session: " + ibex.getMessage();
        } catch (IllegalArgumentException iaex) {
          results = "Failed to start new browser session: " + iaex.getMessage();
        } catch (RuntimeException rte) {
          results = "Failed to start new browser session: " + rte.getMessage();
        }
        // clear out any network traffic captured but never pulled back by the last client (this
        // feature only works with one concurrent browser, similar to PI mode)
        CaptureNetworkTrafficCommand.clear();

        break;
      case testComplete:
        browserSessionFactory.endBrowserSession(sessionId, remoteControl.getConfiguration());
        results = "OK";
        break;
      case getLog:
        try {
          results = "OK," + LoggingManager.perSessionLogHandler().getLog(new SessionId(sessionId));
        } catch (IOException ioex) {
          results =
              "Failed to get RC logs for the session: " + sessionId + " exception message: " + ioex
                  .getMessage();
        }
        break;
      case shutDownSeleniumServer:
        results = "OK";
        shutDown(res);
        break;
      case getLogMessages:
        results = "OK," + logMessagesBuffer.toString();
        logMessagesBuffer.setLength(0);
        break;
      case retrieveLastRemoteControlLogs:
        results = new RetrieveLastRemoteControlLogsCommand().execute();
        break;
      case captureEntirePageScreenshotToString:
        results =
            new CaptureEntirePageScreenshotToStringCommand(values.get(0), sessionId).execute();
        break;
      case captureScreenshot:
        results = new CaptureScreenshotCommand(values.get(0)).execute();
        break;
      case captureScreenshotToString:
        results = new CaptureScreenshotToStringCommand().execute();
        break;
      case captureNetworkTraffic:
        results = new CaptureNetworkTrafficCommand(values.get(0)).execute();
        break;
      case addCustomRequestHeader:
        results = new AddCustomRequestHeaderCommand(values.get(0), values.get(1)).execute();
        break;
      case keyDownNative:
        try {
          RobotRetriever.getRobot().keyPress(Integer.parseInt(values.get(0)));
          results = "OK";
        } catch (Exception e) {
          log.log(Level.SEVERE, "Problem during keyDown: ", e);
          results = "ERROR: Problem during keyDown: " + e.getMessage();
        }
        break;
      case keyUpNative:
        try {
          RobotRetriever.getRobot().keyRelease(Integer.parseInt(values.get(0)));
          results = "OK";
        } catch (Exception e) {
          log.log(Level.SEVERE, "Problem during keyUp: ", e);
          results = "ERROR: Problem during keyUp: " + e.getMessage();
        }
        break;
      case keyPressNative:
        try {
          Robot r = RobotRetriever.getRobot();
          int keycode = Integer.parseInt(values.get(0));
          r.keyPress(keycode);
          r.waitForIdle();
          r.keyRelease(keycode);
          results = "OK";
        } catch (Exception e) {
          log.log(Level.SEVERE, "Problem during keyDown: ", e);
          results = "ERROR: Problem during keyDown: " + e.getMessage();
        }
        // TODO typeKeysNative. Requires converting String to array of keycodes.
        break;
      case isPostSupported:
        results = "OK,true";
        break;
      case setSpeed:
        try {
          int speed = Integer.parseInt(values.get(0));
          setSpeedForSession(sessionId, speed);
        } catch (NumberFormatException e) {
          return "ERROR: setSlowMode expects a string containing an integer, but saw '"
              + values.get(0) + "'";
        }
        results = "OK";
        break;
      case getSpeed:
        results = getSpeedForSession(sessionId);
        break;
      case addStaticContent:
        File dir = new File(values.get(0));
        if (dir.exists()) {
          remoteControl.addNewStaticContent(dir);
          results = "OK";
        } else {
          results = "ERROR: dir does not exist - " + dir.getAbsolutePath();
        }
        break;
      case runHTMLSuite:
        HTMLLauncher launcher = new HTMLLauncher(remoteControl);
        File output = null;
        if (values.size() < 4) {
          results =
              "ERROR: Not enough arguments (browser, browserURL, suiteURL, multiWindow, [outputFile])";
        } else {
          if (values.size() > 4) {
            output = new File(values.get(4));
          }

          try {
            results = launcher.runHTMLSuite(values.get(0), values.get(1), values.get(2), output,
                remoteControl.getConfiguration().getTimeoutInSeconds(),
                "true".equals(values.get(3)));
          } catch (IOException e) {
            e.printStackTrace();
            results = e.toString();
          }
        }
        break;
      case launchOnly:
        if (values.size() < 1) {
          results = "ERROR: You must specify a browser";
        } else {
          String browser = values.get(0);
          String newSessionId = generateNewSessionId();
          BrowserLauncher simpleLauncher = browserLauncherFactory
              .getBrowserLauncher(browser, newSessionId, remoteControl.getConfiguration(),
                  BrowserOptions.newBrowserOptions());
          String baseUrl = "http://localhost:" + remoteControl.getPort();
          remoteControl.registerBrowserSession(new BrowserSessionInfo(
              newSessionId, browser, baseUrl, simpleLauncher, null));
          simpleLauncher.launchHTMLSuite("TestPrompt.html?thisIsSeleniumServer=true", baseUrl);
          results = "OK";
        }
        break;
      case slowResources:
        String arg = values.get(0);
        boolean setting = true;
        if ("off".equals(arg) || "false".equals(arg)) {
          setting = false;
        }
        StaticContentHandler.setSlowResources(setting);
        results = "OK";
        break;
      case attachFile:
        FrameGroupCommandQueueSet queue = getQueueSet(sessionId);
        try {
          File downloadedFile = downloadFile(values.get(1));
          queue.addTemporaryFile(downloadedFile);
          results = queue.doCommand("type", values.get(0), downloadedFile.getAbsolutePath());
        } catch (Exception e) {
          results = e.toString();
        }
        break;
      case open:
        warnIfApparentDomainChange(sessionId, values.get(0));
      case nonSpecial:
        results = new SeleniumCoreCommand(cmd, values, sessionId).execute();
    }

    log.info(commandResultsLogMessage(cmd, sessionId, results));
    return results;

  }

  protected String commandResultsLogMessage(String cmd, String sessionId, String results) {
    final String trucatedResults;

    if (CaptureScreenshotToStringCommand.ID.equals(cmd)
        || CaptureEntirePageScreenshotToStringCommand.ID.equals(cmd)
        || SeleniumCoreCommand.CAPTURE_ENTIRE_PAGE_SCREENSHOT_ID.equals(cmd)) {
      return "Got result: [base64 encoded PNG] on session " + sessionId;
    }
    if (SeleniumCoreCommand.GET_HTML_SOURCE_ID.equals(cmd)) {
      return "Got result: [HTML source] on session " + sessionId;
    }
    if (RetrieveLastRemoteControlLogsCommand.ID.equals(cmd)) {
      /* Trim logs to avoid Larsen effect (see remote control stability tests) */
      trucatedResults = results.length() > 30 ? results.substring(0, 30) : results;
      return "Got result:" + trucatedResults + "... on session " + sessionId;
    }

    return "Got result: " + results + " on session " + sessionId;
  }

  private void warnIfApparentDomainChange(String sessionId, String url) {
    if (url.startsWith("http://")) {
      String urlDomain = url.replaceFirst("^(http://[^/]+, url)/.*", "$1");
      String domain = getDomain(sessionId);
      if (domain == null) {
        setDomain(sessionId, urlDomain);
      } else if (!url.startsWith(domain)) {
        log.warning("you appear to be changing domains from " +
            domain +
            " to " +
            urlDomain +
            "\n"
            +
            "this may lead to a 'Permission denied' from the browser (unless it is running as *iehta or *chrome,\n"
            + "or alternatively the selenium server is running in proxy injection mode)");
      }
    }
  }

  private String getDomain(String sessionId) {
    return domainsBySessionId.get(sessionId);
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

  protected void download(final URL url, final File outputFile) {
    if (outputFile.exists()) {
      throw new RuntimeException("Output already exists: " + outputFile);
    }

    File directory = outputFile.getParentFile();
    if (!directory.exists() && !directory.mkdirs()) {
      throw new RuntimeException(
          "Cannot directory for holding the downloaded file: " + outputFile);
    }

    try {
      FileOutputStream outputTo = new FileOutputStream(outputFile);

      Resources.copy(url, outputTo);
    } catch (FileNotFoundException e) {
      throw Throwables.propagate(e);
    } catch (IOException e) {
      throw Throwables.propagate(e);
    }
  }

  private void createParentDirsAndSetDeleteOnExit(String parent, File tmpFile) {
    File parentFile = tmpFile.getParentFile();
    if (!parentFile.getPath().equals(parent) && !parentFile.exists()) {
      createParentDirsAndSetDeleteOnExit(parent, parentFile);
    }
    parentFile.mkdir();
    parentFile.deleteOnExit();
  }

  protected File createTempFile(String name) {
    String parent = System.getProperty("java.io.tmpdir");
    File tmpFile = new File(parent, name);

    if (tmpFile.exists()) {
      File tmpDir = TemporaryFilesystem.getDefaultTmpFS().createTempDir("selenium", "upload");
      tmpFile = new File(tmpDir, name);
    }

    createParentDirsAndSetDeleteOnExit(parent, tmpFile);
    tmpFile.deleteOnExit();
    return tmpFile;
  }


  private File downloadFile(String urlString) {
    URL url;
    try {
      url = new URL(urlString);
    } catch (MalformedURLException e) {
      throw new RuntimeException("Malformed URL <" + urlString + ">, ", e);
    }

    String fileName = url.getFile();

    File outputFile = createTempFile(fileName);

    download(url, outputFile);

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
      if (speed < 0) {
        speed = 0;
      }
      if (null != queueSet) {
        queueSet.setSpeed(speed);
      }
    } else {
      // otherwise set the default speed for all new command queues.
      CommandQueue.setSpeed(speed);
    }
  }

  private void shutDown(HttpResponse res) {
    log.info("Shutdown command received");

    Runnable initiateShutDown = new Runnable() {
      public void run() {
        log.info("initiating shutdown");
        Sleeper.sleepTight(500);
        System.exit(0);
      }
    };

    Thread isd = new Thread(initiateShutDown); // Thread safety reviewed
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

  private String generateNewSessionId() {
    return UUID.randomUUID().toString().replaceAll("-", "");
  }

  protected String getNewBrowserSession(String browserString, String startURL, String extensionJs,
      Capabilities browserConfigurations)
      throws RemoteCommandException {
    BrowserSessionInfo sessionInfo = browserSessionFactory
        .getNewBrowserSession(browserString, startURL, extensionJs,
            browserConfigurations, remoteControl.getConfiguration());
    SessionIdTracker.setLastSessionId(sessionInfo.sessionId);
    return sessionInfo.sessionId;
  }

  /**
   * Perl and Ruby hang forever when they see "Connection: close" in the HTTP headers. They see that
   * and they think that Jetty will close the socket connection, but Jetty doesn't appear to do that
   * reliably when we're creating a process while handling the HTTP response! So, removing the
   * "Connection: close" header so that Perl and Ruby think we're morons and hang up on us in
   * disgust.
   * 
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
   * Registers the given browser session among the active sessions to handle.
   * <p/>
   * Usually externally created browser sessions are managed themselves, but registering them allows
   * the shutdown procedures to be simpler.
   * 
   * @param sessionInfo the externally created browser session to register.
   */
  public void registerBrowserSession(BrowserSessionInfo sessionInfo) {
    browserSessionFactory.registerExternalSession(sessionInfo);
  }

  /**
   * De-registers the given browser session from among the active sessions.
   * <p/>
   * When an externally managed but registered session is closed, this method should be called to
   * keep the set of active sessions up to date.
   * 
   * @param sessionInfo the session to deregister.
   */
  public void deregisterBrowserSession(BrowserSessionInfo sessionInfo) {
    browserSessionFactory.deregisterExternalSession(sessionInfo);
  }

  /**
   * Kills all running browsers
   */
  public void stopAllBrowsers() {
    browserSessionFactory.endAllBrowserSessions(remoteControl.getConfiguration());
  }

  /**
   * Sets all the don't-cache headers on the HttpResponse
   */
  private void setNoCacheHeaders(HttpResponse res) {
    res.setField(HttpFields.__CacheControl, "no-cache");
    res.setField(HttpFields.__Pragma, "no-cache");
    res.setField(HttpFields.__Expires, HttpFields.__01Jan1970);
  }

  private void setDomain(String sessionId, String domain) {
    domainsBySessionId.put(sessionId, domain);
  }

  public BrowserLauncherFactory getBrowserLauncherFactory() {
    return browserLauncherFactory;
  }

  /**
   * This method will soon be removed.
   *
   * @param browserLauncherFactory To use when creating new browser sessions.
   * @deprecated
   */
  @Deprecated
  public void setBrowserLauncherFactory(
      BrowserLauncherFactory browserLauncherFactory) {
    this.browserLauncherFactory = browserLauncherFactory;
  }
}
