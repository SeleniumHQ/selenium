package org.openqa.selenium.server;

import org.mortbay.http.*;
import org.mortbay.http.handler.ResourceHandler;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.servlet.*;
import org.mortbay.util.*;
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
 * In this mode you can type wiki-style Selenese commands on the command line (e.g. |open|http://www.yahoo.com||).
 * You may also interactively specify commands to run on a particular "browser session" (see below) like this:
 * <blockquote><code>|open|http://www.yahoo.com||&sessionId=1234</code></blockquote></p>
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
 * <ul><li><p><strong>getNewBrowserSession</strong>( <em>absoluteFilePathToBrowserExecutable</em>, <em>startURL</em> )</p>
 * <p>Creates a new "sessionId" number (based on the current time in milliseconds) and launches the browser specified in 
 * <i>absoluteFilePathToBrowserExecutable</i>, browsing directly to <i>startURL</i> + "/selenium-server/SeleneseRunner.html?sessionId=###" 
 * where "###" is the sessionId number. Only commands that are associated with the specified sessionId will be run by this browser.</p>
 * 
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
 * <p>Example:<blockquote><code>|getNewBrowserSession|c:\program files\internet explorer\iexplore.exe|http://www.google.com|
 * <br/>Got result: 1140738083345
 * <br/>|open|http://www.google.com||&sessionId=1140738083345
 * <br/>Got result: OK
 * <br/>|type|q|hello world|&sessionId=1140738083345
 * <br/>Got result: OK
 * <br/>|testComplete|||&sessionId=1140738083345
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
public class SeleniumProxy {
    
    private Server server;
    private SeleniumDriverResourceHandler driver;
    private SeleniumHTMLRunnerResultsHandler postResultsHandler;
    private HttpContext context;
    private StaticContentHandler staticContentHandler;
    private int port;
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

        for (int i = 0; i < args.length; i++) {
            String arg = args[i];
            if ("-port".equals(arg)) {
                port = Integer.parseInt(args[i + 1]);
            }
            else if ("-timeout".equals(arg)) {
                timeout = Integer.parseInt(args[i + 1]);
            }
            else if ("-interactive".equals(arg)) {
                timeout = Integer.MAX_VALUE;
                interactive = true;
            }
        }

        SingleEntryAsyncQueue.setTimeout(timeout);
        final SeleniumProxy seleniumProxy = new SeleniumProxy(port);
        Thread jetty = new Thread(new Runnable() {
            public void run() {
                try {
                    seleniumProxy.start();
                } catch (Exception e) {
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
                    e.printStackTrace();
                }
            }
        }));
        
        if (interactive) {
            Thread.sleep(500);
            System.out.println("Entering interactive mode... type Selenium commands here (e.g: |open|http://www.yahoo.com||)");
            BufferedReader stdIn = new BufferedReader(new InputStreamReader(System.in));
            String userInput;

            while ((userInput = stdIn.readLine()) != null) {
                if ("quit".equals(userInput)) {
                    System.out.println("Stopping...");
                    seleniumProxy.stop();
                    break;
                }

                final URL url = new URL("http://localhost:" + port + "/selenium-server/driver?commandRequest=" + userInput);
                Thread t = new Thread(new Runnable() {
                    public void run() {
                        try {
                            System.out.println("---> Requesting " + url.toString());
                            URLConnection conn = url.openConnection();
                            conn.connect();
                            conn.getContent();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                });
                t.start();
            }
        }

        
    }

    /** Prepares a Jetty server with its HTTP handlers.
     * @param port - the port to start on
     * @throws Exception - you know, just in case
     */
    public SeleniumProxy(int port) throws Exception {
        this.port = port;
        server = new Server();
        SocketListener socketListener = new SocketListener();
        socketListener.setPort(port);
        server.addListener(socketListener);

        // Associate our ProxyHandler with the root context
        HttpContext root = new HttpContext();
        root.setContextPath("/");
        ProxyHandler rootProxy = new ProxyHandler();
        root.addHandler(rootProxy);
        server.addContext(null, root);

        context = new HttpContext();
        context.setContextPath("/selenium-server");
        staticContentHandler = new StaticContentHandler();
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

    public void addNewStaticContent(File directory) {
        staticContentHandler.addStaticContent(directory);
    }
    
    public void handleHTMLRunnerResults(HTMLResultsListener listener) {
        postResultsHandler.addListener(listener);
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
        List contentDirs = new Vector();
        
        public void handle(String string, String string1, HttpRequest httpRequest, HttpResponse httpResponse) throws HttpException, IOException {
            httpResponse.setField("Expires", "-1"); // never cached.
            super.handle(string, string1, httpRequest, httpResponse);
        }

        /** When resources are requested, fetch them from the classpath */
        protected Resource getResource(final String s) throws IOException {
            Resource r = new ClassPathResource("/selenium" + s);
            context.getResourceMetaData(r);
            if (!r.exists()) {
                for (Iterator i = contentDirs.iterator(); i.hasNext();) {
                    File dir = (File) i.next();
                    File resFile = new File(dir, s);
                    r = Resource.newResource(resFile.toURL());
                    context.getResourceMetaData(r);
                    if (r.exists()) break;
                }
            }
            return r;
        }
        
        public void addStaticContent(File directory) {
            contentDirs.add(directory);
        }
    }

    public int getPort() {
        return port;
    }

}
