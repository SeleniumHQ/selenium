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

import org.mortbay.http.*;
import org.mortbay.http.handler.ResourceHandler;
import org.mortbay.jetty.Server;
import org.mortbay.util.*;
import org.openqa.selenium.server.browserlaunchers.*;
import org.openqa.selenium.server.htmlrunner.*;

import java.io.*;
import java.net.URL;
import java.net.URLConnection;
import java.util.*;

/**
 * Provides a server that can launch/terminate browsers and can receive Selenese commands
 * over HTTP and send them on to the browser.
 * 
 * <p>To run Selenium Server, run:
 * 
 * <blockquote><code>java -jar selenium-server-1.0-SNAPSHOT.jar [-port 4444] [-interactive] [-timeout 1800]</code></blockquote>
 * 
 * <p>Where <code>-port</code> specifies the port you wish to run the Server on (default is 4444).
 * 
 * <p>Where <code>-timeout</code> specifies the number of seconds that you allow data to wait all in the 
 * communications queues before an exception is thrown.
 * 
 * <p>Using the <code>-interactive</code> flag will start the server in Interactive mode.
 * In this mode you can type Selenese commands on the command line (e.g. cmd=open&1=http://www.yahoo.com).
 * You may also interactively specify commands to run on a particular "browser session" (see below) like this:
 * <blockquote><code>cmd=open&1=http://www.yahoo.com&sessionId=1234</code></blockquote></p>
 * 
 * <p>The server accepts three types of HTTP requests on its port:
 * 
 * <ol>
 * <li><b>Client-Configured Proxy Requests</b>: By configuring your browser to use the
 * Selenium Server as an HTTP proxy, you can use the Selenium Server as a web proxy.  This allows
 * the server to create a virtual "/selenium-server" directory on every website that you visit using
 * the proxy.
 * <li><b>Browser Selenese</b>: If the browser goes to "/selenium-server/SeleneseRunner.html?sessionId=1234" on any website
 * via the Client-Configured Proxy, it will ask the Selenium Server for work to do, like this:
 * <blockquote><code>http://www.yahoo.com/selenium-server/driver/?seleniumStart=true&sessionId=1234</code></blockquote>
 * The driver will then reply with a command to run in the body of the HTTP response, e.g. "|open|http://www.yahoo.com||".  Once
 * the browser is done with this request, the browser will issue a new request for more work, this
 * time reporting the results of the previous command:<blockquote><code>http://www.yahoo.com/selenium-server/driver/?commandResult=OK&sessionId=1234</code></blockquote>
 * The action list is listed in selenium-api.js.  Normal actions like "doClick" will return "OK" if
 * clicking was successful, or some other error string if there was an error.  Assertions like
 * assertTextPresent or verifyTextPresent will return "PASSED" if the assertion was true, or
 * some other error string if the assertion was false.  Getters like "getEval" will return the
 * result of the get command.  "getAllLinks" will return a comma-delimited list of links.</li> 
 * <li><b>Driver Commands</b>: Clients may send commands to the Selenium Server over HTTP.
 * Command requests should look like this:<blockquote><code>http://localhost:4444/selenium-server/driver/?commandRequest=|open|http://www.yahoo.com||&sessionId=1234</code></blockquote>
 * The Selenium Server will not respond to the HTTP request until the browser has finished performing the requested
 * command; when it does, it will reply with the result of the command (e.g. "OK" or "PASSED") in the
 * body of the HTTP response.  (Note that <code>-interactive</code> mode also works by sending these
 * HTTP requests, so tests using <code>-interactive</code> mode will behave exactly like an external client driver.) 
 * </ol>
 * <p>There are some special commands that only work in the Selenium Server.  These commands are:
 * <ul><li><p><strong>getNewBrowserSession</strong>( <em>browserString</em>, <em>startURL</em> )</p>
 * <p>Creates a new "sessionId" number (based on the current time in milliseconds) and launches the browser specified in 
 * <i>browserString</i>.  We will then browse directly to <i>startURL</i> + "/selenium-server/SeleneseRunner.html?sessionId=###" 
 * where "###" is the sessionId number. Only commands that are associated with the specified sessionId will be run by this browser.</p>
 * 
 * <p><i>browserString</i> may be any one of the following:
 * <ul>
 * <li><code>*firefox [absolute path]</code> - Automatically launch a new Firefox process using a custom Firefox profile.
 * This profile will be automatically configured to use the Selenium Server as a proxy and to have all annoying prompts
 * ("save your password?" "forms are insecure" "make Firefox your default browser?" disabled.  You may optionally specify
 * an absolute path to your firefox executable, or just say "*firefox".  If no absolute path is specified, we'll look for
 * firefox.exe in a default location (normally c:\program files\mozilla firefox\firefox.exe), which you can override by
 * setting the Java system property <code>firefoxDefaultPath</code> to the correct path to Firefox.</li>
 * <li><code>*iexplore [absolute path]</code> - Automatically launch a new Internet Explorer process using custom Windows registry settings.
 * This process will be automatically configured to use the Selenium Server as a proxy and to have all annoying prompts
 * ("save your password?" "forms are insecure" "make Firefox your default browser?" disabled.  You may optionally specify
 * an absolute path to your iexplore executable, or just say "*iexplore".  If no absolute path is specified, we'll look for
 * iexplore.exe in a default location (normally c:\program files\internet explorer\iexplore.exe), which you can override by
 * setting the Java system property <code>iexploreDefaultPath</code> to the correct path to Internet Explorer.</li>
 * <li><code>/path/to/my/browser [other arguments]</code> - You may also simply specify the absolute path to your browser
 * executable, or use a relative path to your executable (which we'll try to find on your path).  <b>Warning:</b> If you
 * specify your own custom browser, it's up to you to configure it correctly.  At a minimum, you'll need to configure your
 * browser to use the Selenium Server as a proxy, and disable all browser-specific prompting.
 * </ul>
 * </li>
 * <li><p><strong>testComplete</strong>(  )</p>
 * <p>Kills the currently running browser and erases the old browser session.  If the current browser session was not
 * launched using <code>getNewBrowserSession</code>, or if that session number doesn't exist in the server, this
 * command will return an error.</p>
 * </li>
 * <li><p><strong>shutDown</strong>(  )</p>
 * <p>Causes the server to shut itself down, killing itself and all running browsers along with it.</p>
 * </li>
 * </ul>
 * <p>Example:<blockquote><code>cmd=getNewBrowserSession&1=*firefox&2=http://www.google.com
 * <br/>Got result: 1140738083345
 * <br/>cmd=open&1=http://www.google.com&sessionId=1140738083345
 * <br/>Got result: OK
 * <br/>cmd=type&1=q&2=hello world&sessionId=1140738083345
 * <br/>Got result: OK
 * <br/>cmd=testComplete&sessionId=1140738083345
 * <br/>Got result: OK
 * </code></blockquote></p>
 * 
 * <h4>The "null" session</h4>
 * 
 * <p>If you open a browser manually and do not specify a session ID, it will look for
 * commands using the "null" session.  You may then similarly send commands to this
 * browser by not specifying a sessionId when issuing commands.</p> 
 * 
 *  @author plightbo
 *
 */
public class SeleniumServer {
    
    private Server server;
    private SeleniumDriverResourceHandler driver;
    private SeleniumHTMLRunnerResultsHandler postResultsHandler;
    private HttpContext context;
    private StaticContentHandler staticContentHandler;
    private int port;
    
    private static boolean debugMode = false;
    private static boolean proxyInjectionMode = false;
    private static int proxyInjectionPort = 0;
    private static String defaultBrowser = null; 
     
    public static final int DEFAULT_PORT = 4444;
    public static final int DEFAULT_TIMEOUT= (30 * 60);

    /** Starts up the server on the specified port (or default if no port was specified)
     * and then starts interactive mode if specified.
     * 
     * @param args - either "-port" followed by a number, or "-interactive"
     * @throws Exception - you know, just in case.
     */ 
    public static void main(String[] args) throws Exception {
        int port = DEFAULT_PORT;
        int timeout= DEFAULT_TIMEOUT;
        boolean interactive = false;
        
        boolean htmlSuite = false;
        String browserString = null; 
        String startURL = null;
        String suiteFilePath = null;
        String resultFilePath = null;
        File userExtensions = null;
        boolean proxyInjectionModeArg = false;
        int proxyInjectionPortArg = 0;
        
        for (int i = 0; i < args.length; i++) {
            String arg = args[i];
            if ("-help".equals(arg)) {
                usage(null);
                System.exit(1);
            }
            else if ("-defaultBrowser".equals(arg)) {
                for (i++; i < args.length; i++) {
                    if (SeleniumServer.defaultBrowser==null)
                        SeleniumServer.defaultBrowser = "";
                    else
                        SeleniumServer.defaultBrowser += " ";
                    SeleniumServer.defaultBrowser += args[i];
                }
                System.out.println("\"" + defaultBrowser + "\" will be used as the browser " +
                        "mode for all sessions, no matter what is passed to getNewBrowserSession");
            }
            else if ("-port".equals(arg)) {
                port = Integer.parseInt(args[++i]);
            }
            else if ("-proxyInjectionMode".equals(arg)) {
                proxyInjectionModeArg = true;
                proxyInjectionSpeech();
            }
            else if ("-proxyInjectionPort".equals(arg)) {
                // to facilitate tcptrace interception of interaction between 
                // injected js and the selenium server
                proxyInjectionPortArg = Integer.parseInt(args[++i]);
            }
            else if ("-debug".equals(arg)) {
                SeleniumServer.setDebugMode(true);
            }
            else if ("-timeout".equals(arg)) {
                timeout = Integer.parseInt(args[++i]);
            }
            else if ("-userExtensions".equals(arg)) {
                userExtensions = new File(args[++i]);
                if (!userExtensions.exists()) {
                    System.err.println("User Extensions file doesn't exist: " + userExtensions.getAbsolutePath());
                    System.exit(1);
                }
                if (!"user-extensions.js".equals(userExtensions.getName())) {
                    System.err.println("User extensions file MUST be called \"user-extensions.js\": " + userExtensions.getAbsolutePath());
                    System.exit(1);
                }
            }
            else if ("-htmlSuite".equals(arg)) {
                try {
                    browserString = args[++i];
                    startURL = args[++i];
                    suiteFilePath = args[++i];
                    resultFilePath = args[++i];
                } catch (ArrayIndexOutOfBoundsException e) {
                    System.err.println("Not enough command line arguments for -htmlSuite");
                    System.err.println("-htmlSuite requires you to specify:");
                    System.err.println("* browserString (e.g. \"*firefox\")");
                    System.err.println("* startURL (e.g. \"http://www.google.com\")");
                    System.err.println("* suiteFile (e.g. \"c:\\absolute\\path\\to\\my\\HTMLSuite.html\")");
                    System.err.println("* resultFile (e.g. \"c:\\absolute\\path\\to\\my\\results.html\")");
                    System.exit(1);
                }
                htmlSuite = true;
            }
            else if ("-interactive".equals(arg)) {
                timeout = Integer.MAX_VALUE;
                interactive = true;
            }
            else if (arg.startsWith("-D")) {
                setSystemProperty(arg);
            }
            else {
                usage("unrecognized argument " + arg);
                System.exit(1);
            }
        }
        if (proxyInjectionPortArg==0) {
            proxyInjectionPortArg = port;
        }
        
        if (interactive && htmlSuite) {
            System.err.println("You can't use -interactive and -htmlSuite on the same line!");
            System.exit(1);
        }

        SingleEntryAsyncQueue.setDefaultTimeout(timeout);
        final SeleniumServer seleniumProxy = new SeleniumServer(port);
        seleniumProxy.setProxyInjectionMode(proxyInjectionModeArg);
        SeleniumServer.setProxyInjectionPort(proxyInjectionPortArg);
        
        Thread jetty = new Thread(new Runnable() {
            public void run() {
                try {
                    seleniumProxy.start();
                }
                catch (Exception e) {
                    System.err.println("jetty run exception seen:");
                    e.printStackTrace();
                }
            }
        });

        if (interactive) {
            jetty.setDaemon(true);
        }

        jetty.start();

        Runtime.getRuntime().addShutdownHook(new Thread(new Runnable() {
            public void run() {
                try {
                    System.out.println("Shutting down...");
                    seleniumProxy.stop();
                } catch (InterruptedException e) {
                    System.err.println("run exception seen:");
                    e.printStackTrace();
                }
            }
        }));
        
        if (userExtensions != null) {
            seleniumProxy.addNewStaticContent(userExtensions.getParentFile());
        }
        
        if (htmlSuite) {
            String result = null;
            try {
                File suiteFile = new File(suiteFilePath);
                seleniumProxy.addNewStaticContent(suiteFile.getParentFile());
                String suiteURL = startURL + "/selenium-server/" + suiteFile.getName();
                HTMLLauncher launcher = new HTMLLauncher(seleniumProxy);
                result = launcher.runHTMLSuite(browserString, startURL, suiteURL, new File(resultFilePath), timeout);
            } catch (Exception e) {
                System.err.println("HTML suite exception seen:");
                e.printStackTrace();
                System.exit(1);
            }
            
            if (!"PASSED".equals(result)) {
                System.err.println("Tests failed");
                System.exit(1);
            } else {
                System.exit(0);
            }
        }
        
        if (interactive) {
            AsyncExecute.sleepTight(500);
            System.out.println("Entering interactive mode... type Selenium commands here (e.g: cmd=open&1=http://www.yahoo.com)");
            BufferedReader stdIn = new BufferedReader(new InputStreamReader(System.in));
            String userInput;

            while ((userInput = stdIn.readLine()) != null) {
                if ("quit".equals(userInput)) {
                    System.out.println("Stopping...");
                    seleniumProxy.stop();
                    System.exit(0);
                }
                
                if ("".equals(userInput)) continue;
                
                if (!userInput.startsWith("cmd=") && !userInput.startsWith("commandResult=")) {
                    System.err.println("ERROR -  Invalid command: " + userInput);
                    continue;
                }

                final URL url = new URL("http://localhost:" + port + "/selenium-server/driver?" + userInput);
                Thread t = new Thread(new Runnable() {
                    public void run() {
                        try {
                            System.out.println("---> Requesting " + url.toString());
                            URLConnection conn = url.openConnection();
                            conn.connect();
                            conn.getContent();
                        } catch (IOException e) {
                            System.err.println(e.getMessage());
                            if (SeleniumServer.isDebugMode()) {
                                e.printStackTrace();
                            }
                        }
                    }
                });
                t.start();
            }
        }

        
    }

    private static void proxyInjectionSpeech() {
        System.out.println("The selenium server will execute in proxyInjection mode.  \r\n" + 
                "\r\n" + 
                "There are a couple of assumptions that this mode makes which make the selenium server less shareable than has historically been the case:\r\n" + 
                "\r\n" + 
                "-users never execute multiple browser sessions simultaneously\r\n" + 
                "-either everyone wants proxyInjection mode, or else no one does\r\n" + 
                "\r\n" + 
                "If we decide that proxyInjection mode is worthwhile, then we will have to choose between the following options:\r\n" + 
                "\r\n" + 
                "-tell the community that it is not OK to run simultaneous multiple browser sessions\r\n" + 
                "\r\n" + 
                "   or\r\n" + 
                "\r\n" + 
                "-remove proxyInjection mode\'s assumption that the most recently allocated sessionId is the only valid one.\r\n" + 
                "-determine when requests come into jetty whether they are associated with proxyInjection sessions, and only if they are performed injection of the proxyInjection JavaScript\r\n" + 
                "\r\n" + 
                "(Session IDs could be stored in cookies, alleviating the need to have a global reckoning " +
                "of the \"current\" session ID.  This of course would mean that we would need to require that cookies be turned on.)" +
                "" +
                "At that time it will also make sense to implement browser launchers which configure the browser appropriately for this mode.");        
    }

    private static void setSystemProperty(String arg) {
        if (arg.indexOf('=')==-1) {
            usage("poorly formatted Java property setting (I expect to see '=') " + arg);
            System.exit(1);
        }
        String property = arg.replaceFirst("-D", "").replaceFirst("=.*", ""); 
        String value    = arg.replaceFirst("[^=]*=", "");
        System.err.println("Setting system property " + property + " to " + value);
        System.setProperty(property, value);
}

    private static void usage(String msg) {
        if (msg!=null) {
            System.err.println(msg + ":");
        }
        System.err.println("Usage: java -jar selenium-server.jar -debug [-port nnnn] [-timeout nnnn] [-interactive] [-defaultBrowser browserString] [-htmlSuite browserString (e.g. \"*firefox\") startURL (e.g. \"http://www.google.com\") " +
                "suiteFile (e.g. \"c:\\absolute\\path\\to\\my\\HTMLSuite.html\") resultFile (e.g. \"c:\\absolute\\path\\to\\my\\results.html\"]\n" +
                "where:\n" +
                "the argument for timeout is an integer number of seconds before we should give up\n" +
                "the argument for port is the port number the selenium server should use (default 4444)" +
        "\n\t-interactive puts you into interactive mode.  See the tutorial for more details" +
        "\n\t-defaultBrowser sets the browser mode for all sessions, no matter what is passed to getNewBrowserSession" +
        "\n\t-debug puts you into debug mode, with more trace information and diagnostics");
    }

    /** Prepares a Jetty server with its HTTP handlers.
     * @param port - the port to start on
     * @throws Exception - you know, just in case
     */
    public SeleniumServer(int port) throws Exception {
        this.port = port;
        server = new Server();
        SocketListener socketListener = new SocketListener();
        socketListener.setPort(port);
        server.addListener(socketListener);

        // Associate our ProxyHandler with the root context
        HttpContext root = new HttpContext();
        root.setContextPath("/");
        ProxyHandler rootProxy = new ProxyHandler();
        rootProxy.setSeleniumServer(this);
        root.addHandler(rootProxy);
        server.addContext(null, root);

        context = new HttpContext();
        context.setContextPath("/selenium-server");
        staticContentHandler = new StaticContentHandler(this);
        context.addHandler(staticContentHandler);
        server.addContext(null, context);

        context.addHandler(new SingleTestSuiteResourceHandler());
        server.addContext(null, context);
        
        this.postResultsHandler = new SeleniumHTMLRunnerResultsHandler();
        context.addHandler(postResultsHandler);
        server.addContext(null, context);
        
        // Associate the SeleniumDriverResourceHandler with the /selenium-server/driver context
        HttpContext driverContext = new HttpContext();
        driverContext.setContextPath("/selenium-server/driver");
        this.driver = new SeleniumDriverResourceHandler(this);
        context.addHandler(this.driver);
        server.addContext(null, driverContext);
    }

    public SeleniumServer() throws Exception {
        this(SeleniumServer.DEFAULT_PORT);
    }
    
    public void addNewStaticContent(File directory) {
        staticContentHandler.addStaticContent(directory);
    }
    
    public void handleHTMLRunnerResults(HTMLResultsListener listener) {
        postResultsHandler.addListener(listener);
    }
    
    public String doCommand(String cmd, Vector values, String sessionId) {
        return driver.doCommand(cmd, values, sessionId, null);
    }
    
    /** Starts the Jetty server */
    public void start() throws Exception {
        server.start();
    }

    /** Stops the Jetty server */
    public void stop() throws InterruptedException {
        server.stop();
        driver.stopAllBrowsers();
    }
    
    private class StaticContentHandler extends ResourceHandler {
        List<File> contentDirs = new Vector<File>();
        private final SeleniumServer seleniumServer;
        
        public StaticContentHandler(SeleniumServer seleniumServer) {
            super();
            this.seleniumServer = seleniumServer;
        }
        public void handle(String pathInContext, String pathParams, HttpRequest httpRequest, HttpResponse httpResponse) throws HttpException, IOException {
            httpResponse.setField("Expires", "-1"); // never cached.
            if (pathInContext.equals("/core/SeleneseRunner.html") &&
                    SeleniumServer.isProxyInjectionMode()) {
                pathInContext = pathInContext.replaceFirst("/core/SeleneseRunner.html", 
                        "/core/InjectedSeleneseRunner.html");
            }
            super.handle(pathInContext, pathParams, httpRequest, httpResponse);
        }

        /** When resources are requested, fetch them from the classpath */
        protected Resource getResource(final String s) throws IOException {
            Resource r = new ClassPathResource(s);
            context.getResourceMetaData(r);
            if (!r.exists()) {
                for (Iterator i = contentDirs.iterator(); i.hasNext();) {
                    File dir = (File) i.next();
                    File resFile = new File(dir, s);
                    r = Resource.newResource(resFile.toURL());
                    context.getResourceMetaData(r);
                    if (r.exists()) break;
                    // Throw in a hack to make it easier to install user extensions
                    if ("user-extensions.js".equals(resFile.getName())) {
                        resFile = new File(dir, "user-extensions.js");
                        r = Resource.newResource(resFile.toURL());
                        context.getResourceMetaData(r);
                        if (r.exists()) break;
                    }
                }
            }
            return r;
        }
        
        public void addStaticContent(File directory) {
            contentDirs.add(directory);
        }
                
        public void sendData(HttpRequest request,
                HttpResponse response,
                String pathInContext,
                Resource resource,
                boolean writeHeaders)
        throws IOException
        {
            if (!SeleniumServer.isProxyInjectionMode()) {
                super.sendData(request, response, pathInContext, resource, writeHeaders);
                return;
            }
            ResourceCache.ResourceMetaData metaData = (ResourceCache.ResourceMetaData)resource.getAssociate();
            
            String mimeType = metaData.getMimeType();
            response.setContentType(mimeType);
            if (resource.length() != -1)
            {
                response.setField(HttpFields.__ContentLength,metaData.getLength());
            }    
            boolean knownToBeHtml = (mimeType != null) && mimeType.equals("text/html"); 
            InjectionHelper.injectJavaScript(seleniumServer, knownToBeHtml, response, resource.getInputStream(), response.getOutputStream());
            request.setHandled(true);
        }
    }
    
    public int getPort() {
        return port;
    }
    
    /** Exposes the internal Jetty server used by Selenium.
     * This lets users add their own webapp to the Selenium Server jetty instance.
     * It is also a minor violation of encapsulation principles (what if we stop
     * using Jetty?) but life is too short to worry about such things.
     * @return the internal Jetty server, pre-configured with the /selenium-server context as well as
     * the proxy server on /
     */
    public Server getServer() {
        return server;
    }

    public static boolean isDebugMode() {
        return SeleniumServer.debugMode;
    }

    static public void setDebugMode(boolean debugMode) {
        SeleniumServer.debugMode = debugMode;
    }

    public static boolean isProxyInjectionMode() {
        return proxyInjectionMode;
    }

    public static int getProxyInjectionPort() {
        return proxyInjectionPort;
    }

    public static void setProxyInjectionPort(int proxyInjectionPort) {
        SeleniumServer.proxyInjectionPort = proxyInjectionPort;
    }

    public void setProxyInjectionMode(boolean proxyInjectionMode) {
        SeleniumServer.proxyInjectionMode = proxyInjectionMode;
    }

    public static String getDefaultBrowser() {
        return defaultBrowser;
    }

}
