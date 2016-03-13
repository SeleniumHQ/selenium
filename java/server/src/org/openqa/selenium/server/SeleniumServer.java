// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.server;

import static java.lang.String.format;
import static org.openqa.grid.shared.CliUtils.printWrappedLine;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.openqa.jetty.http.HashUserRealm;
import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.http.SecurityConstraint;
import org.openqa.jetty.http.SocketListener;
import org.openqa.jetty.http.handler.SecurityHandler;
import org.openqa.jetty.jetty.Server;
import org.openqa.jetty.jetty.servlet.ServletHandler;
import org.openqa.jetty.util.MultiException;
import org.openqa.selenium.internal.BuildInfo;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.remote.server.DefaultDriverSessions;
import org.openqa.selenium.remote.server.DriverServlet;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.log.LoggingManager;
import org.openqa.selenium.remote.server.log.LoggingOptions;
import org.openqa.selenium.server.BrowserSessionFactory.BrowserSessionInfo;
import org.openqa.selenium.server.browserlaunchers.BrowserLauncherFactory;
import org.openqa.selenium.server.browserlaunchers.Sleeper;
import org.openqa.selenium.server.htmlrunner.HTMLLauncher;
import org.openqa.selenium.server.htmlrunner.HTMLResultsListener;
import org.openqa.selenium.server.htmlrunner.SeleniumHTMLRunnerResultsHandler;
import org.openqa.selenium.server.htmlrunner.SingleTestSuiteResourceHandler;
import org.openqa.grid.shared.GridNodeServer;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.BindException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.servlet.Servlet;

/**
 * Provides a server that can launch/terminate browsers and can receive remote Selenium commands
 * over HTTP and send them on to the browser.
 * <p>
 * To run Selenium Server, run:
 * <blockquote>
 * <code>java -jar selenium-server-1.0-SNAPSHOT.jar [-port 4444] [-interactive] [-timeout 1800]</code>
 * </blockquote>
 * <p>
 * Where <code>-port</code> specifies the port you wish to run the Server on (default is 4444).
 * <p>
 * Where <code>-timeout</code> specifies the number of seconds that you allow data to wait all in
 * the communications queues before an exception is thrown.
 * <p>
 * Using the <code>-interactive</code> flag will start the server in Interactive mode. In this mode
 * you can type remote Selenium commands on the command line (e.g. cmd=open&amp;1=http://www.yahoo.com).
 * You may also interactively specify commands to run on a particular "browser session" (see below)
 * like this: <blockquote><code>cmd=open&amp;1=http://www.yahoo.com&amp;sessionId=1234</code></blockquote>
 * <p>
 * The server accepts three types of HTTP requests on its port:
 * <ol>
 * <li><b>Client-Configured Proxy Requests</b>: By configuring your browser to use the Selenium
 * Server as an HTTP proxy, you can use the Selenium Server as a web proxy. This allows the server
 * to create a virtual "/selenium-server" directory on every website that you visit using the proxy.
 * <li><b>Remote Browser Commands</b>: If the browser goes to
 * "/selenium-server/RemoteRunner.html?sessionId=1234" on any website via the Client-Configured
 * Proxy, it will ask the Selenium Server for work to do, like this: <blockquote>
 * <code>http://www.yahoo.com/selenium-server/driver/?seleniumStart=true&amp;sessionId=1234</code>
 * </blockquote> The driver will then reply with a command to run in the body of the HTTP response,
 * e.g. "|open|http://www.yahoo.com||". Once the browser is done with this request, the browser will
 * issue a new request for more work, this time reporting the results of the previous
 * command:<blockquote>
 * <code>http://www.yahoo.com/selenium-server/driver/?commandResult=OK&amp;sessionId=1234</code>
 * </blockquote> The action list is listed in selenium-api.js. Normal actions like "doClick" will
 * return "OK" if clicking was successful, or some other error string if there was an error.
 * Assertions like assertTextPresent or verifyTextPresent will return "PASSED" if the assertion was
 * true, or some other error string if the assertion was false. Getters like "getEval" will return
 * the result of the get command. "getAllLinks" will return a comma-delimited list of links.</li>
 * <li><b>Driver Commands</b>: Clients may send commands to the Selenium Server over HTTP. Command
 * requests should look like this:<blockquote>
 * <code>http://localhost:4444/selenium-server/driver/?commandRequest=|open|http://www.yahoo.com||&amp;sessionId=1234</code>
 * </blockquote> The Selenium Server will not respond to the HTTP request until the browser has
 * finished performing the requested command; when it does, it will reply with the result of the
 * command (e.g. "OK" or "PASSED") in the body of the HTTP response. (Note that
 * <code>-interactive</code> mode also works by sending these HTTP requests, so tests using
 * <code>-interactive</code> mode will behave exactly like an external client driver.)
 * </ol>
 * <p>
 * There are some special commands that only work in the Selenium Server. These commands are:
 * <ul>
 * <li>
 * <p>
 * <strong>getNewBrowserSession</strong>( <em>browserString</em>, <em>startURL</em> )
 * </p>
 * <p>
 * Creates a new "sessionId" number (based on the current time in milliseconds) and launches the
 * browser specified in <i>browserString</i>. We will then browse directly to <i>startURL</i> +
 * "/selenium-server/RemoteRunner.html?sessionId=###" where "###" is the sessionId number. Only
 * commands that are associated with the specified sessionId will be run by this browser.
 * </p>
 * <p>
 * <i>browserString</i> may be any one of the following:
 * <ul>
 * <li><code>*firefox [absolute path]</code> - Automatically launch a new Firefox process using a
 * custom Firefox profile. This profile will be automatically configured to use the Selenium Server
 * as a proxy and to have all annoying prompts ("save your password?" "forms are insecure"
 * "make Firefox your default browser?" disabled. You may optionally specify an absolute path to
 * your firefox executable, or just say "*firefox". If no absolute path is specified, we'll look for
 * firefox.exe in a default location (normally c:\program files\mozilla firefox\firefox.exe), which
 * you can override by setting the Java system property <code>firefoxDefaultPath</code> to the
 * correct path to Firefox.</li>
 * <li><code>*iexplore [absolute path]</code> - Automatically launch a new Internet Explorer process
 * using custom Windows registry settings. This process will be automatically configured to use the
 * Selenium Server as a proxy and to have all annoying prompts ("save your password?"
 * "forms are insecure" "make Firefox your default browser?" disabled. You may optionally specify an
 * absolute path to your iexplore executable, or just say "*iexplore". If no absolute path is
 * specified, we'll look for iexplore.exe in a default location (normally c:\program files\internet
 * explorer\iexplore.exe), which you can override by setting the Java system property
 * <code>iexploreDefaultPath</code> to the correct path to Internet Explorer.</li>
 * <li><code>/path/to/my/browser [other arguments]</code> - You may also simply specify the absolute
 * path to your browser executable, or use a relative path to your executable (which we'll try to
 * find on your path). <b>Warning:</b> If you specify your own custom browser, it's up to you to
 * configure it correctly. At a minimum, you'll need to configure your browser to use the Selenium
 * Server as a proxy, and disable all browser-specific prompting.
 * </ul>
 * </li>
 * <li>
 * <p>
 * <strong>testComplete</strong>( )
 * </p>
 * <p>
 * Kills the currently running browser and erases the old browser session. If the current browser
 * session was not launched using <code>getNewBrowserSession</code>, or if that session number
 * doesn't exist in the server, this command will return an error.
 * </p>
 * </li>
 * <li>
 * <p>
 * <strong>shutDown</strong>( )
 * </p>
 * <p>
 * Causes the server to shut itself down, killing itself and all running browsers along with it.
 * </p>
 * </li>
 * </ul>
 * <p>
 * Example:<blockquote>
 * <code>cmd=getNewBrowserSession&amp;1=*firefox&amp;2=http://www.google.com
 * <br>Got result: 1140738083345
 * <br>cmd=open&amp;1=http://www.google.com&amp;sessionId=1140738083345
 * <br>Got result: OK
 * <br>cmd=type&amp;1=q&amp;2=hello world&amp;sessionId=1140738083345
 * <br>Got result: OK
 * <br>cmd=testComplete&amp;sessionId=1140738083345
 * <br>Got result: OK
 * </code></blockquote>
 * <h1>The "null" session</h1>
 * <p>
 * If you open a browser manually and do not specify a session ID, it will look for commands using
 * the "null" session. You may then similarly send commands to this browser by not specifying a
 * sessionId when issuing commands.
 *
 * @author plightbo
 */
public class SeleniumServer implements SslCertificateGenerator, GridNodeServer {

  private Log LOGGER;

  private Server server;
  private BrowserLauncherFactory browserLauncherFactory;
  private SeleniumDriverResourceHandler driver;
  private SeleniumHTMLRunnerResultsHandler postResultsHandler;
  private StaticContentHandler staticContentHandler;
  private final RemoteControlConfiguration configuration;
  private Thread shutDownHook;
  private static final NetworkUtils networkUtils = new NetworkUtils();

  private ProxyHandler proxyHandler;

  public static int DEFAULT_JETTY_THREADS = 512;
  // Number of jetty threads for the server
  private int jettyThreads = DEFAULT_JETTY_THREADS;


  private boolean debugMode = false;

  /**
   * This lock is very important to ensure that SeleniumServer and the underlying Jetty instance
   * shuts down properly. It ensures that ProxyHandler does not add an SslRelay to the Jetty server
   * dynamically (needed for SSL proxying) if the server has been shut down or is in the process of
   * getting shut down.
   */
  private final Object shutdownLock = new Object();
  private static final int MAX_SHUTDOWN_RETRIES = 8;

  /**
   * Starts up the server on the specified port (or default if no port was specified) and then
   * starts interactive mode if specified.
   *
   * @param args - either "-port" followed by a number, or "-interactive"
   * @throws Exception - you know, just in case.
   */
  public static void main(String[] args) throws Exception {
    final RemoteControlConfiguration configuration;
    final SeleniumServer seleniumProxy;

    configuration = parseLauncherOptions(args);
    checkArgsSanity(configuration);

    System.setProperty("org.openqa.jetty.http.HttpRequest.maxFormContentSize", "0"); // default max
                                                                                     // is 200k;
                                                                                     // zero is
                                                                                     // infinite
    seleniumProxy = new SeleniumServer(slowResourceProperty(), configuration);
    seleniumProxy.boot();

    // todo: This is still buggy because it should resolve to external port
    seleniumProxy.LOGGER.info(
      format("RemoteWebDriver instances should connect to: http://%s:%d/wd/hub",
             networkUtils.getPrivateLocalAddress(), seleniumProxy.getPort()));
  }

  public SeleniumServer() throws Exception {
    this(slowResourceProperty(), new RemoteControlConfiguration());
  }

  public SeleniumServer(Map<String, Object> configurationAsMap) throws Exception {
    this(slowResourceProperty(), mapToRemoteControlConfiguration(configurationAsMap));
    String servletsStr = (String) configurationAsMap.get("servlets");
    if (servletsStr != null) {
      registerExtraServlets(Arrays.asList(servletsStr.split(",")));
    }
  }

  private static RemoteControlConfiguration mapToRemoteControlConfiguration(Map<String, Object> configurationAsMap) {
    List<String> params = new ArrayList<>();
    for (String key : configurationAsMap.keySet()) {
      params.add("-" + key);

      if (!configurationAsMap.get(key).toString().trim().isEmpty()) {
        params.add("" + configurationAsMap.get(key));
      }
    }
    return parseLauncherOptions(params.toArray(new String[params.size()]));
  }

  public SeleniumServer(RemoteControlConfiguration configuration) throws Exception {
    this(slowResourceProperty(), configuration);
  }

  public SeleniumServer(boolean slowResources) throws Exception {
    this(slowResources, new RemoteControlConfiguration());
  }

  /**
   * Prepares a Jetty server with its HTTP handlers.
   *
   * @param slowResources should the webserver return static resources more slowly? (Note that this
   *        will not slow down ordinary RC test runs; this setting is used to debug Selenese HTML
   *        tests.)
   * @param configuration Remote Control configuration. Cannot be null.
   * @throws Exception you know, just in case
   */
  public SeleniumServer(boolean slowResources, RemoteControlConfiguration configuration)
      throws Exception {
    this.configuration = configuration;
    debugMode = configuration.isDebugMode();
    jettyThreads = configuration.getJettyThreads();
    System.setProperty("org.openqa.jetty.http.HttpRequest.maxFormContentSize", "0");
    LOGGER = configureLogging(configuration.getLoggingOptions(), debugMode);
    logStartupInfo();
    sanitizeProxyConfiguration();
    createJettyServer(slowResources);
    configuration.setSeleniumServer(this);
  }

  public static synchronized Log configureLogging(LoggingOptions options,
                                                   boolean debugMode) {
    final Log seleniumServerJettyLogger;

    if (options.dontTouchLogging()) {
      return LogFactory.getLog("org.openqa.selenium.server.SeleniumServer");
    }

    LoggingManager.configureLogging(options, debugMode);

    seleniumServerJettyLogger = LogFactory.getLog("org.openqa.selenium.server.SeleniumServer");
    if (null != options.getLogOutFile()) {
      seleniumServerJettyLogger.info("Writing debug logs to " + options.getLogOutFile());
    }

    return seleniumServerJettyLogger;
  }

  public void boot() throws Exception {
    start();
    if (null != configuration.getUserExtensions()) {
      addNewStaticContent(configuration.getUserExtensions().getParentFile());
    }
    if (configuration.isHTMLSuite()) {
      runHtmlSuite();
      return;
    }
    if (configuration.isInteractive()) {
      readUserCommands();
    }
  }

  protected void createJettyServer(boolean slowResources) {
    final SocketListener socketListener;

    server = new Server();
    socketListener = new SocketListener();
    socketListener.setMaxIdleTimeMs(60000);
    socketListener.setMaxThreads(jettyThreads);
    socketListener.setPort(getPort());
    server.addListener(socketListener);
    assembleHandlers(slowResources, configuration);
  }


  private void logVersionNumber() throws IOException {
    final Properties p = new Properties();

    InputStream stream = ClassPathResource.getSeleniumResourceAsStream("/VERSION.txt");
    if (stream == null) {
      LOGGER.error("Couldn't determine version number");
      return;
    }
    p.load(stream);
    String rcVersion = p.getProperty("selenium.rc.version");
    String rcRevision = p.getProperty("selenium.rc.revision");
    String coreVersion = p.getProperty("selenium.core.version");
    String coreRevision = p.getProperty("selenium.core.revision");
    BuildInfo info = new BuildInfo();
    LOGGER.info(String.format(
      "v%s%s, with Core v%s%s. Built from revision %s",
      rcVersion, rcRevision, coreVersion, coreRevision, info.getBuildRevision()));
  }


  private void assembleHandlers(boolean slowResources, RemoteControlConfiguration configuration) {
    server.addContext(createRootContextWithProxyHandler(configuration));

    HttpContext context = new HttpContext();
    context.setContextPath("/selenium-server");
    context.setMimeMapping("xhtml", "application/xhtml+xml");

    addSecurityHandler(context);
    addStaticContentHandler(slowResources, configuration, context);
    context.addHandler(new SessionExtensionJsHandler());
    context.addHandler(new SingleTestSuiteResourceHandler());
    postResultsHandler = new SeleniumHTMLRunnerResultsHandler();
    context.addHandler(postResultsHandler);
    server.addContext(context);

    // Both the selenium and webdriver contexts must be able to share sessions
    DefaultDriverSessions webdriverSessions = new DefaultDriverSessions();

    server.addContext(createDriverContextWithSeleniumDriverResourceHandler(
        context, webdriverSessions));
    server.addContext(createWebDriverRemoteContext(webdriverSessions));
  }

  private HttpContext createDriverContextWithSeleniumDriverResourceHandler(
      HttpContext context, DriverSessions webdriverSessions) {
    // Associate the SeleniumDriverResourceHandler with the /selenium-server/driver context
    HttpContext driverContext = new HttpContext();
    driverContext.setContextPath("/selenium-server/driver");
    browserLauncherFactory = new BrowserLauncherFactory(webdriverSessions);
    driver = new SeleniumDriverResourceHandler(this, browserLauncherFactory);
    context.addHandler(driver);
    return driverContext;
  }

  private HttpContext createWebDriverRemoteContext(DriverSessions webDriverSessions) {
    HttpContext webdriverContext = new HttpContext();

    long sessionTimeout = configuration.getTimeoutInSeconds();
    if (sessionTimeout == 0) {
      sessionTimeout = -1;
    }
    long browserTimeout = configuration.getBrowserTimeoutInMs();
    if (browserTimeout == 0) {
      browserTimeout = -1;
    } else {
      browserTimeout /= 1000;
    }
    webdriverContext.setInitParameter(DriverServlet.SESSION_TIMEOUT_PARAMETER, String.valueOf(sessionTimeout));
    webdriverContext.setInitParameter(DriverServlet.BROWSER_TIMEOUT_PARAMETER, String.valueOf(browserTimeout));
    webdriverContext.setAttribute(DriverServlet.SESSIONS_KEY, webDriverSessions);
    webdriverContext.setContextPath("/wd");
    ServletHandler handler = new ServletHandler();
    handler.addServlet("WebDriver remote server", "/hub/*", DriverServlet.class.getName());
    webdriverContext.addHandler(handler);

    return webdriverContext;
  }

  private void addStaticContentHandler(boolean slowResources,
      RemoteControlConfiguration configuration, HttpContext context) {
    StaticContentHandler.setSlowResources(slowResources);
    staticContentHandler =
        new StaticContentHandler(configuration.getDebugURL(),
            configuration.getProxyInjectionModeArg());
    String overrideJavascriptDir = System.getProperty("selenium.javascript.dir");
    if (overrideJavascriptDir != null) {
      staticContentHandler.addStaticContent(new FsResourceLocator(new File(overrideJavascriptDir)));
    }
    staticContentHandler.addStaticContent(new ClasspathResourceLocator());

    context.addHandler(staticContentHandler);
  }

  private void addSecurityHandler(HttpContext context) {
    SecurityConstraint constraint = new SecurityConstraint();
    constraint.setName(SecurityConstraint.__BASIC_AUTH);

    constraint.addRole("user");
    constraint.setAuthenticate(true);

    context.addSecurityConstraint("/org/openqa/selenium/tests/html/basicAuth/*", constraint);
    HashUserRealm realm = new HashUserRealm("MyRealm");
    realm.put("alice", "foo");
    realm.addUserToRole("alice", "user");
    context.setRealm(realm);

    SecurityHandler sh = new SecurityHandler();
    context.addHandler(sh);
  }

  protected HttpContext createRootContextWithProxyHandler(RemoteControlConfiguration configuration) {
    HttpContext root;

    root = new HttpContext();
    root.setContextPath("/");
    proxyHandler = makeProxyHandler(configuration);
    root.addHandler(proxyHandler);
    return root;
  }

  /**
   * pre-compute the 1-16 SSL relays+certs for the logging hosts. (see selenium-remoterunner.js
   * sendToRCAndForget for more info)
   */
  public void generateSSLCertsForLoggingHosts() {
    proxyHandler.generateSSLCertsForLoggingHosts(server);
  }

  protected ProxyHandler makeProxyHandler(RemoteControlConfiguration configuration) {
    return new ProxyHandler(configuration.trustAllSSLCertificates(),
        configuration.getDontInjectRegex(), configuration.getDebugURL(),
        configuration.getProxyInjectionModeArg(), false,
        configuration.getPort(),
        shutdownLock);
  }

  private static boolean slowResourceProperty() {
    return ("true".equals(System.getProperty("slowResources")));
  }

  public void addNewStaticContent(File directory) {
    staticContentHandler.addStaticContent(new FsResourceLocator(directory));
  }

  public void handleHTMLRunnerResults(HTMLResultsListener listener) {
    postResultsHandler.addListener(listener);
  }

  /**
   * Starts the Jetty server
   *
   * @throws Exception on error.
   */
  public void start() throws Exception {
    System.setProperty("org.openqa.jetty.http.HttpRequest.maxFormContentSize", "0"); // default max
                                                                                     // is 200k;
                                                                                     // zero is
                                                                                     // infinite
    try {
      server.start();
    } catch (MultiException e) {
      if (e.getExceptions().size() == 1 && e.getException(0) instanceof BindException) {
        throw new BindException("Selenium is already running on port " + getPort() +
            ". Or some other service is.");
      }
      throw e;
    }

    shutDownHook = new Thread(new ShutDownHook(this)); // Thread safety reviewed
    shutDownHook.setName("SeleniumServerShutDownHook");
    Runtime.getRuntime().addShutdownHook(shutDownHook);
  }

  private class ShutDownHook implements Runnable {
    private final SeleniumServer selenium;

    ShutDownHook(SeleniumServer selenium) {
      this.selenium = selenium;
    }

    public void run() {
      LOGGER.info("Shutting down...");
      selenium.stop();
    }
  }

  /**
   * Stops the Jetty server
   */
  public void stop() {
    int numTries = 0;
    Exception shutDownException = null;

    // this may be called by a shutdown hook, or it may be called at any time
    // in case it was called as an ordinary method, try to clean up the shutdown
    // hook
    try {
      if (shutDownHook != null) {
        Runtime.getRuntime().removeShutdownHook(shutDownHook);
      }
    } catch (IllegalStateException ignored) {
    } // thrown if we're shutting down; that's OK

    // shut down the jetty server (try try again)
    while (numTries <= MAX_SHUTDOWN_RETRIES) {
      ++numTries;
      try {
        // see docs for the lock object for information on this and why it is IMPORTANT!
        synchronized (shutdownLock) {
          server.stop();
        }

        // If we reached here stop didnt throw an exception.
        // So we assume it was successful.
        break;
      } catch (Exception ex) { // org.openqa.jetty.jetty.Server.stop() throws Exception
        LOGGER.error(ex);
        shutDownException = ex;
        // If Exception is thrown we try to stop the jetty server again
      }
    }

    // next, stop all of the browser sessions.
    driver.stopAllBrowsers();

    if (numTries > MAX_SHUTDOWN_RETRIES) { // This is bad!! Jetty didnt shutdown..
      if (null != shutDownException) {
        throw new RuntimeException(shutDownException);
      }
    }
  }

  public RemoteControlConfiguration getConfiguration() {
    return configuration;
  }

  public BrowserLauncherFactory getBrowserLauncherFactory() {
    return browserLauncherFactory;
  }

  public int getPort() {
    return configuration.getPort();
  }

  public int getRealPort() {
    if (server.isStarted()) {
      SocketListener socket = (SocketListener) server.getListeners()[0];
      return socket.getPort();
    }
    return getPort();
  }

  /**
   * Exposes the internal Jetty server used by Selenium. This lets users add their own webapp to the
   * Selenium Server jetty instance. It is also a minor violation of encapsulation principles (what
   * if we stop using Jetty?) but life is too short to worry about such things.
   *
   * @return the internal Jetty server, pre-configured with the /selenium-server context as well as
   *         the proxy server on /
   * @deprecated
   */
  @Deprecated
  public Server getServer() {
    return server;
  }

  public void registerExtraServlets(List<String> servlets) {
    HttpContext extra = new HttpContext();

    extra.setContextPath("/extra");
    ServletHandler handler = new ServletHandler();
    handler.addServlet("/resources/*", ResourceServlet.class.getName());

    for (String s : servlets) {
      Class<? extends Servlet> servletClass = createServlet(s);
      if (servletClass != null) {
        String path = "/" + servletClass.getSimpleName() + "/*";
        String clazz = servletClass.getCanonicalName();
        handler.addServlet(path, clazz);
        LOGGER.info("started extra node servlet visible at : http://xxx:"
                    + configuration.getPort() + "/extra" + path);
      }
    }
    extra.addHandler(handler);
    server.addContext(extra);
  }

  private Class<? extends Servlet> createServlet(String className) {
    try {
      return Class.forName(className).asSubclass(Servlet.class);
    } catch (ClassNotFoundException e) {
      LOGGER.error(
        "The specified class : " + className + " cannot be instantiated " + e.getMessage());
    }
    return null;
  }

  public InputStream getResourceAsStream(String path) throws IOException {
    return staticContentHandler.getResource(path).getInputStream();
  }

  /**
   * Registers a running browser session
   * @param sessionInfo session info
   */
  public void registerBrowserSession(BrowserSessionInfo sessionInfo) {
    driver.registerBrowserSession(sessionInfo);
  }

  /**
   * De-registers a previously registered running browser session
   * @param sessionInfo session info
   */
  public void deregisterBrowserSession(BrowserSessionInfo sessionInfo) {
    driver.deregisterBrowserSession(sessionInfo);
  }

  /**
   * Get the number of threads that the server will use to configure the embedded Jetty instance.
   *
   * @return Returns the number of threads for Jetty.
   */
  public int getJettyThreads() {
    return jettyThreads;
  }

  protected void runHtmlSuite() {
    final String result;
    try {
      String suiteFilePath = getRequiredSystemProperty("htmlSuite.suiteFilePath");
      File suiteFile = new File(suiteFilePath).getCanonicalFile();
      if (!suiteFile.exists()) {
        usage("Can't find HTML Suite file:" + suiteFile);
        System.exit(1);
      }
      String fileName = suiteFile.getName();
      if (! (fileName.endsWith(".html") || fileName.endsWith(".htm") || fileName.endsWith(".xhtml"))) {
        usage("Suite file must have extension .html or .htm or .xhtml");
        System.exit(1);
      }
      addNewStaticContent(suiteFile.getParentFile());
      String startURL = getRequiredSystemProperty("htmlSuite.startURL");
      HTMLLauncher launcher = new HTMLLauncher(this);
      String resultFilePath = getRequiredSystemProperty("htmlSuite.resultFilePath");
      File resultFile = new File(resultFilePath);
      File resultDir = resultFile.getParentFile();
      if ((resultDir != null) && !resultDir.exists() && !resultDir.mkdirs()) {
        usage("can't create directory for result file " + resultFilePath);
        System.exit(1);
      }
      resultFile.createNewFile();

      if (!resultFile.canWrite()) {
        usage("can't write to result file " + resultFilePath);
        System.exit(1);
      }

      result =
          launcher.runHTMLSuite(getRequiredSystemProperty("htmlSuite.browserString"), startURL,
              suiteFile, resultFile,
              configuration.getTimeoutInSeconds(), (!configuration.isSingleWindow()));

      if (!"PASSED".equals(result)) {
        System.err.println("Tests failed, see result file for details: " +
            resultFile.getAbsolutePath());
        System.exit(1);
      } else {
        System.exit(0);
      }
    } catch (Exception e) {
      System.err.println("HTML suite exception seen:");
      e.printStackTrace();
      System.exit(1);
    }

  }

  protected void readUserCommands() throws IOException {
    Sleeper.sleepTight(500);
    System.out
        .println("Entering interactive mode... type Selenium commands here (e.g: cmd=open&1=http://www.yahoo.com)");
    BufferedReader stdIn = new BufferedReader(new InputStreamReader(System.in));
    String userInput;

    final String[] lastSessionId = new String[] {""};

    while ((userInput = stdIn.readLine()) != null) {
      userInput = userInput.trim();
      if ("exit".equals(userInput) || "quit".equals(userInput)) {
        System.out.println("Stopping...");
        stop();
        System.exit(0);
      }

      if ("".equals(userInput)) continue;

      if (!userInput.startsWith("cmd=") && !userInput.startsWith("commandResult=")) {
        System.err.println("ERROR -  Invalid command: \"" + userInput + "\"");
        continue;
      }

      final boolean newBrowserSession = userInput.contains("getNewBrowserSession");
      if (!userInput.contains("sessionId") && !newBrowserSession) {
        userInput = userInput + "&sessionId=" + lastSessionId[0];
      }

      final URL url =
          new URL("http://localhost:" + configuration.getPort() + "/selenium-server/driver?" +
              userInput);
      Thread t = new Thread(new Runnable() { // Thread safety reviewed
        public void run() {

          InputStream is = null;
          try {
            LOGGER.info("---> Requesting " + url.toString());
            URLConnection conn = url.openConnection();
            conn.connect();
            is = conn.getInputStream();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buffer = new byte[2048];
            int length;
            while ((length = is.read(buffer)) != -1) {
              out.write(buffer, 0, length);
            }
            is.close();

            String output = out.toString();

            if (newBrowserSession) {
              if (output.startsWith("OK,")) {
                lastSessionId[0] = output.substring(3);
              }
            }
          } catch (IOException e) {
            System.err.println(e.getMessage());
            if (debugMode) {
              e.printStackTrace();
            }
          } finally {
            if (is != null) {
              try {
                is.close();
              } catch (IOException e) {
                System.err.println(e.getMessage());
                if (debugMode) {
                  e.printStackTrace();
                }
              }
            }
          }
        }
      });
      t.start();
    }
  }

  protected static void checkArgsSanity(RemoteControlConfiguration configuration) throws Exception {
    if (configuration.isInteractive()) {
      if (configuration.isHTMLSuite()) {
        System.err.println("You can't use -interactive and -htmlSuite on the same line!");
        System.exit(1);
      }
      if (configuration.isSelfTest()) {
        System.err.println("You can't use -interactive and -selfTest on the same line!");
        System.exit(1);
      }
    } else if (configuration.isSelfTest()) {
      if (configuration.isHTMLSuite()) {
        System.err.println("You can't use -selfTest and -htmlSuite on the same line!");
        System.exit(1);
      }
    }

    if (!configuration.getProxyInjectionModeArg() &&
        (InjectionHelper.userContentTransformationsExist() ||
        InjectionHelper.userJsInjectionsExist())) {
      usage("-userJsInjection and -userContentTransformation are only " +
            "valid in combination with -proxyInjectionMode");
      System.exit(1);
    }
  }

  private void sanitizeProxyConfiguration() {
    String proxyHost = System.getProperty("http.proxyHost");
    String proxyPort = System.getProperty("http.proxyPort");
    if (Integer.toString(getPort()).equals(proxyPort)) {
      LOGGER.debug("http.proxyPort is the same as the Selenium Server port " + getPort());
      LOGGER.debug("http.proxyHost=" + proxyHost);
      if ("localhost".equals(proxyHost) || "127.0.0.1".equals(proxyHost)) {
        LOGGER.info("Forcing http.proxyHost to '' to avoid infinite loop");
        System.setProperty("http.proxyHost", "");
      }
    }
  }

  private void logStartupInfo() throws IOException {
    LOGGER.info("Java: " + System.getProperty("java.vm.vendor") + ' ' +
        System.getProperty("java.vm.version"));
    LOGGER.info("OS: " + System.getProperty("os.name") + ' ' + System.getProperty("os.version") +
        ' ' + System.getProperty("os.arch"));
    logVersionNumber();
    if (debugMode) {
      LOGGER.info("Selenium server running in debug mode.");
    }
    if (configuration.getProxyInjectionModeArg()) {
      LOGGER.info("The selenium server will execute in proxyInjection mode.");
    }
    if (configuration.reuseBrowserSessions()) {
      LOGGER.info("Will recycle browser sessions when possible.");
    }
    if (null != configuration.getForcedBrowserMode()) {
      LOGGER.info("\"" + configuration.getForcedBrowserMode() + "\" will be used as the browser " +
          "mode for all sessions, no matter what is passed to getNewBrowserSession.");
    }
  }

  private String getRequiredSystemProperty(String name) {
    String value = System.getProperty(name);
    if (value == null) {
      usage("expected property " + name + " to be defined");
      System.exit(1);
    }
    return value;
  }


  public static void usage(String msg) {
    if (msg != null) {
      System.out.println(msg);
    }
    String INDENT = "  ";
    String INDENT2X = INDENT + INDENT;
    printWrappedLine("", "Usage: java -jar selenium-server.jar [options]\n");
    printWrappedLine(
      INDENT,
      "-singleWindow: puts you into a mode where the test web site executes in a frame. This mode should only be selected if the application under test does not use frames.");
    printWrappedLine(
      INDENT,
      "-profilesLocation: Specifies the directory that holds the profiles that java clients can use to start up selenium.  Currently supported for Firefox only.");
    printWrappedLine(
      INDENT,
      "-forcedBrowserMode <browser>: sets the browser mode to a single argument (e.g. \"*iexplore\") for all sessions, no matter what is passed to getNewBrowserSession");


    printWrappedLine(
      INDENT,
      "-forcedBrowserModeRestOfLine <browser>: sets the browser mode to all the remaining tokens on the line (e.g. \"*custom /some/random/place/iexplore.exe\") for all sessions, no matter what is passed to getNewBrowserSession");
    printWrappedLine(INDENT,
                     "-userExtensions <file>: indicates a JavaScript file that will be loaded into selenium");
    printWrappedLine(INDENT,
                     "-browserSessionReuse: stops re-initialization and spawning of the browser between tests");
    printWrappedLine(
      INDENT,
      "-avoidProxy: By default, we proxy every browser request; set this flag to make the browser use our proxy only for URLs containing '/selenium-server'");
    printWrappedLine(
      INDENT,
      "-firefoxProfileTemplate <dir>: normally, we generate a fresh empty Firefox profile every time we launch.  You can specify a directory to make us copy your profile directory instead.");
    printWrappedLine(INDENT,
                     "-debug: puts you into debug mode, with more trace information and diagnostics on the console");
    printWrappedLine(
      INDENT,
      "-browserSideLog: enables logging on the browser side; logging messages will be transmitted to the server.  This can affect performance.");
    printWrappedLine(
      INDENT,
      "-ensureCleanSession: If the browser does not have user profiles, make sure every new session has no artifacts from previous sessions.  For example, enabling this option will cause all user cookies to be archived before launching IE, and restored after IE is closed.");
    printWrappedLine(
      INDENT,
      "-trustAllSSLCertificates: Forces the Selenium proxy to trust all SSL certificates.  This doesn't work in browsers that don't use the Selenium proxy.");
    printWrappedLine(INDENT,
                     "-log <logFileName>: writes lots of debug information out to a log file and disables logging to console");
    printWrappedLine(INDENT,
                     "-logLongForm: writes information out to console in long format (for debugging purpose)");
    printWrappedLine(
      INDENT,
      "-htmlSuite <browser> <startURL> <suiteFile> <resultFile>: Run a single HTML Selenese (Selenium Core) suite and then exit immediately, using the specified browser (e.g. \"*firefox\") on the specified URL (e.g. \"http://www.google.com\").  You need to specify the absolute path to the HTML test suite as well as the path to the HTML results file we'll generate.");
    printWrappedLine(
      INDENT,
      "-proxyInjectionMode: puts you into proxy injection mode, a mode where the selenium server acts as a proxy server "
      +
      "for all content going to the test application.  Under this mode, multiple domains can be visited, and the "
      +
      "following additional flags are supported:\n");
    printWrappedLine(
      INDENT2X,
      "-dontInjectRegex <regex>: an optional regular expression that proxy injection mode can use to know when to bypss injection");
    printWrappedLine(INDENT2X,
                     "-userJsInjection <file>: specifies a JavaScript file which will then be injected into all pages");
    printWrappedLine(
      INDENT2X,
      "-userContentTransformation <regex> <replacement>: a regular expression which is matched "
      +
      "against all test HTML content; the second is a string which will replace matches.  These flags can be used any "
      +
      "number of times.  A simple example of how this could be useful: if you add \"-userContentTransformation https http\" "
      +
      "then all \"https\" strings in the HTML of the test application will be changed to be \"http\".");
    printWrappedLine(
      "",
      "\nThis synopsis lists options available in standalone role only. To get help on the options available for other roles run the server with -help option and the corresponding -role option value.");
  }

  public static RemoteControlConfiguration parseLauncherOptions(String[] args) {
    RemoteControlConfiguration configuration;
    configuration = new RemoteControlConfiguration();
    configuration.setPort(RemoteControlConfiguration.getDefaultPort());
    for (int i = 0; i < args.length; i++) {
      String arg = args[i];
      if ("-h".equalsIgnoreCase(arg) || "-help".equalsIgnoreCase(arg)) {
        usage(null);
        System.exit(1);
      } else if ("-defaultBrowserString".equalsIgnoreCase(arg)) {
        usage("-defaultBrowserString has been renamed -forcedBrowserMode");
      } else if ("-forcedBrowserMode".equalsIgnoreCase(arg)) {
        configuration.setForcedBrowserMode(getArg(args, ++i));
        if (i < args.length) {
          System.err
            .println("Warning: -forcedBrowserMode no longer consumes all remaining arguments on line (use -forcedBrowserModeRestOfLine for that)");
        }
      } else if ("-forcedBrowserModeRestOfLine".equalsIgnoreCase(arg)) {
        for (i++; i < args.length; i++) {
          if (null == configuration.getForcedBrowserMode()) {
            configuration.setForcedBrowserMode("");
          } else {
            configuration.setForcedBrowserMode(configuration.getForcedBrowserMode() + " ");
          }
          configuration.setForcedBrowserMode(configuration.getForcedBrowserMode() + args[i]);
        }
      } else if ("-log".equalsIgnoreCase(arg)) {
        configuration.setLogOutFileName(getArg(args, ++i));
      } else if ("-captureLogsOnQuit".equalsIgnoreCase(arg)) {
        configuration.setCaptureLogsOnQuit(true);
      } else if ("-port".equalsIgnoreCase(arg)) {
        configuration.setPort(Integer.parseInt(getArg(args, ++i)));
      } else if ("-multiWindow".equalsIgnoreCase(arg)) {
        configuration.setSingleWindow(!true);
      } else if ("-singleWindow".equalsIgnoreCase(arg)) {
        configuration.setSingleWindow(!false);
      } else if ("-profilesLocation".equalsIgnoreCase(arg)) {
        File profilesLocation = new File(getArg(args, ++i));
        if (!profilesLocation.exists()) {
          System.err.println("Specified profile location directory does not exist: " +
                             profilesLocation);
          System.exit(1);
        }
        configuration.setProfilesLocation(profilesLocation);
      } else if ("-avoidProxy".equalsIgnoreCase(arg)) {
        configuration.setAvoidProxy(true);
      } else if ("-proxyInjectionMode".equalsIgnoreCase(arg)) {
        configuration.setProxyInjectionModeArg(true);
        // proxyInjectionMode implies singleWindow mode
        configuration.setSingleWindow(!false);
      } else if ("-portDriversShouldContact".equalsIgnoreCase(arg)) {
        // to facilitate tcptrace interception of interaction between
        // injected js and the selenium server
        configuration.setPortDriversShouldContact(Integer.parseInt(getArg(args, ++i)));
      } else if ("-noBrowserSessionReuse".equalsIgnoreCase(arg)) {
        configuration.setReuseBrowserSessions(false);
      } else if ("-browserSessionReuse".equalsIgnoreCase(arg)) {
        configuration.setReuseBrowserSessions(true);
      } else if ("-firefoxProfileTemplate".equalsIgnoreCase(arg)) {
        configuration.setFirefoxProfileTemplate(new File(getArg(args, ++i)));
        if (!configuration.getFirefoxProfileTemplate().exists()) {
          System.err.println("Firefox profile template doesn't exist: " +
                             configuration.getFirefoxProfileTemplate().getAbsolutePath());
          System.exit(1);
        }
      } else if ("-ensureCleanSession".equalsIgnoreCase(arg)) {
        configuration.setEnsureCleanSession(true);
      } else if ("-dontInjectRegex".equalsIgnoreCase(arg)) {
        configuration.setDontInjectRegex(getArg(args, ++i));
      } else if ("-browserSideLog".equalsIgnoreCase(arg)) {
        configuration.setBrowserSideLogEnabled(true);
      } else if ("-debug".equalsIgnoreCase(arg)) {
        configuration.setDebugMode(true);
      } else if ("-debugURL".equalsIgnoreCase(arg)) {
        configuration.setDebugURL(getArg(args, ++i));
      } else if ("-timeout".equalsIgnoreCase(arg)) {
        configuration.setTimeoutInSeconds(Integer.parseInt(getArg(args, ++i)));
      } else if ("-jettyThreads".equalsIgnoreCase(arg)) {
        int jettyThreadsCount = Integer.parseInt(getArg(args, ++i));

        // Set the number of jetty threads before we construct the instance
        configuration.setJettyThreads(jettyThreadsCount);
      } else if ("-trustAllSSLCertificates".equalsIgnoreCase(arg)) {
        configuration.setTrustAllSSLCertificates(true);
      } else if ("-userJsInjection".equalsIgnoreCase(arg)) {
        configuration.setUserJSInjection(true);
        if (!InjectionHelper.addUserJsInjectionFile(getArg(args, ++i))) {
          usage(null);
          System.exit(1);
        }
      } else if ("-userContentTransformation".equalsIgnoreCase(arg)) {
        if (!InjectionHelper.addUserContentTransformation(getArg(args, ++i), getArg(args, ++i))) {
          usage(null);
          System.exit(1);
        }
      } else if ("-userExtensions".equalsIgnoreCase(arg)) {
        configuration.setUserExtensions(new File(getArg(args, ++i)));
        if (!configuration.getUserExtensions().exists()) {
          System.err.println("User Extensions file doesn't exist: " +
                             configuration.getUserExtensions().getAbsolutePath());
          System.exit(1);
        }
        if (!"user-extensions.js".equalsIgnoreCase(configuration.getUserExtensions().getName())) {
          System.err.println("User extensions file MUST be called \"user-extensions.js\": " +
                             configuration.getUserExtensions().getAbsolutePath());
          System.exit(1);
        }
      } else if ("-selfTest".equalsIgnoreCase(arg)) {
        configuration.setSelfTest(true);
        configuration.setSelfTestDir(new File(getArg(args, ++i)));
        configuration.getSelfTestDir().mkdirs();
      } else if ("-htmlSuite".equalsIgnoreCase(arg)) {
        try {
          System.setProperty("htmlSuite.browserString", args[++i]);
          System.setProperty("htmlSuite.startURL", args[++i]);
          System.setProperty("htmlSuite.suiteFilePath", args[++i]);
          System.setProperty("htmlSuite.resultFilePath", args[++i]);
        } catch (ArrayIndexOutOfBoundsException e) {
          System.err.println("Not enough command line arguments for -htmlSuite");
          System.err.println("-htmlSuite requires you to specify:");
          System.err.println("* browserString (e.g. \"*firefox\")");
          System.err.println("* startURL (e.g. \"http://www.google.com\")");
          System.err.println("* suiteFile (e.g. \"c:\\absolute\\path\\to\\my\\HTMLSuite.html\")");
          System.err.println("* resultFile (e.g. \"c:\\absolute\\path\\to\\my\\results.html\")");
          System.exit(1);
        }
        configuration.setHTMLSuite(true);
      } else if ("-interactive".equalsIgnoreCase(arg)) {
        configuration.setTimeoutInSeconds(Integer.MAX_VALUE);
        configuration.setInteractive(true);
      } else if ("-honor-system-proxy".equals(arg)) {
        configuration.setHonorSystemProxy(true);
      } else if (arg.startsWith("-D")) {
        setSystemProperty(arg);
      } /*
         * else { usage("unrecognized argument " + arg); System.exit(1); }
         */
    }
    if (configuration.userJSInjection() && !configuration.getProxyInjectionModeArg()) {
      System.err.println("User js injection can only be used w/ -proxyInjectionMode");
      System.exit(1);
    }
    if (configuration.getProfilesLocation() != null &&
        configuration.getFirefoxProfileTemplate() != null) {
      System.err.println("Cannot specify both a profileDirectory and a firefoxProfileTemplate");
      System.exit(1);
    }

    if (null == configuration.getForcedBrowserMode()) {
      if (null != System.getProperty("selenium.defaultBrowserString")) {
        System.err
          .println("The selenium.defaultBrowserString property is no longer supported; use selenium.forcedBrowserMode instead.");
        System.exit(-1);
      }
      configuration.setForcedBrowserMode(System.getProperty("selenium.forcedBrowserMode"));
    }

    if (!configuration.getProxyInjectionModeArg() &&
        System.getProperty("selenium.proxyInjectionMode") != null) {
      configuration.setProxyInjectionModeArg("true".equals(System
                                                             .getProperty("selenium.proxyInjectionMode")));
    }
    if (!configuration.isBrowserSideLogEnabled() &&
        System.getProperty("selenium.browserSideLog") != null) {
      configuration.setBrowserSideLogEnabled("true".equals(System
                                                             .getProperty("selenium.browserSideLog")));
    }

    if (!configuration.isDebugMode() && System.getProperty("selenium.debugMode") != null) {
      configuration.setDebugMode("true".equals(System.getProperty("selenium.debugMode")));
    }
    return configuration;
  }

  private static String getArg(String[] args, int i) {
    if (i >= args.length) {
      usage("expected at least one more argument");
      System.exit(-1);
    }
    return args[i];
  }

  private static void setSystemProperty(String arg) {
    if (arg.indexOf('=') == -1) {
      usage("poorly formatted Java property setting (I expect to see '=') " + arg);
      System.exit(1);
    }
    String property = arg.replaceFirst("-D", "").replaceFirst("=.*", "");
    String value = arg.replaceFirst("[^=]*=", "");
    System.err.println("Setting system property " + property + " to " + value);
    System.setProperty(property, value);
  }

}
