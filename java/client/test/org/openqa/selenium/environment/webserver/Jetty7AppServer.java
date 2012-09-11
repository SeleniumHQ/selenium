/*
Copyright 2012 Software Freedom Conservancy
Copyright 2007-2012 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.environment.webserver;

import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.testing.InProject;
import org.seleniumhq.jetty7.server.Connector;
import org.seleniumhq.jetty7.server.Handler;
import org.seleniumhq.jetty7.server.Server;
import org.seleniumhq.jetty7.server.handler.ContextHandlerCollection;
import org.seleniumhq.jetty7.server.nio.SelectChannelConnector;
import org.seleniumhq.jetty7.server.ssl.SslSocketConnector;
import org.seleniumhq.jetty7.servlet.ServletHolder;
import org.seleniumhq.jetty7.servlets.MultiPartFilter;
import org.seleniumhq.jetty7.webapp.WebAppContext;

import java.io.File;

import javax.servlet.Filter;
import javax.servlet.Servlet;

import static org.openqa.selenium.net.PortProber.findFreePort;
import static org.openqa.selenium.testing.InProject.locate;

public class Jetty7AppServer implements AppServer {

  private static final String HOSTNAME_FOR_TEST_ENV_NAME = "HOSTNAME";
  private static final String ALTERNATIVE_HOSTNAME_FOR_TEST_ENV_NAME = "ALTERNATIVE_HOSTNAME";
  private static final String FIXED_HTTP_PORT_ENV_NAME = "TEST_HTTP_PORT";
  private static final String FIXED_HTTPS_PORT_ENV_NAME = "TEST_HTTPS_PORT";

  private static final int DEFAULT_HTTP_PORT = 2310;
  private static final int DEFAULT_HTTPS_PORT = 2410;
  private static final String DEFAULT_CONTEXT_PATH = "/common";
  private static final String JS_SRC_CONTEXT_PATH = "/javascript";
  private static final String CLOSURE_CONTEXT_PATH = "/third_party/closure/goog";
  private static final String THIRD_PARTY_JS_CONTEXT_PATH = "/third_party/js";

  private static final NetworkUtils networkUtils = new NetworkUtils();

  private int port;
  private int securePort;
  private File path;
  private File jsSrcRoot;
  private final Server server;
  private WebAppContext defaultContext;
  private WebAppContext jsContext;

  private ContextHandlerCollection handlers;
  private final String hostName;

  public Jetty7AppServer() {
    this(detectHostname());
  }

  public static String detectHostname() {
    String hostnameFromProperty = System.getenv(HOSTNAME_FOR_TEST_ENV_NAME);
    return hostnameFromProperty == null ? "localhost" : hostnameFromProperty;
  }

  public Jetty7AppServer(String hostName) {
    this.hostName = hostName;
    // Be quiet. Unless we want things to be chatty
    if (!Boolean.getBoolean("webdriver.debug")) {
      new NullLogger().disableLogging();
    }

    server = new Server();

    path = findRootOfWebApp();
    jsSrcRoot = findJsSrcWebAppRoot();

    handlers = new ContextHandlerCollection();

    defaultContext = addWebApplication(DEFAULT_CONTEXT_PATH, path);
    jsContext = addWebApplication(JS_SRC_CONTEXT_PATH, jsSrcRoot);

    addWebApplication(CLOSURE_CONTEXT_PATH, locate("third_party/closure/goog"));
    addWebApplication(THIRD_PARTY_JS_CONTEXT_PATH, locate("third_party/js"));

    server.setHandler(handlers);

    addServlet("Redirecter", "/redirect", RedirectServlet.class);
    addServlet("InfinitePagerServer", "/page/*", PageServlet.class);

    addServlet(defaultContext, "Manifest", "/manifest/*", ManifestServlet.class);
    addServlet(defaultContext, "Manifest", "*.appcache", ManifestServlet.class);
    addServlet(jsContext, "Manifest", "*.appcache", ManifestServlet.class);
    // Serves every file under DEFAULT_CONTEXT_PATH/utf8 as UTF-8 to the browser
    addServlet(defaultContext, "UTF8", "/utf8/*", Utf8Servlet.class);

    addServlet("Uploader", "/upload", UploadServlet.class);
    addServlet("Unusual encoding", "/encoding", EncodingServlet.class);
    addServlet("Sleeper", "/sleep", SleepingServlet.class);
    addServlet("Kill switch", "/quitquitquit", KillSwitchServlet.class);
    addServlet("Basic Authentication", "/basicAuth", BasicAuth.class);
    addFilter(MultiPartFilter.class, "/upload", 0 /* DEFAULT dispatches */);

    listenOn(getHttpPort());
    listenSecurelyOn(getHttpsPort());
  }

  private int getHttpPort() {
    String port = System.getenv(FIXED_HTTP_PORT_ENV_NAME);
    return port == null ? findFreePort() : Integer.parseInt(port);
  }

  private int getHttpsPort() {
    String port = System.getenv(FIXED_HTTPS_PORT_ENV_NAME);
    return port == null ? findFreePort() : Integer.parseInt(port);
  }

  protected File findRootOfWebApp() {
    return InProject.locate("common/src/web");
  }

  private static File findJsSrcWebAppRoot() {
    return InProject.locate("javascript");
  }

  public String getHostName() {
    return hostName;
  }

  public String getAlternateHostName() {
    String alternativeHostnameFromProperty = System.getenv(ALTERNATIVE_HOSTNAME_FOR_TEST_ENV_NAME);
    return alternativeHostnameFromProperty == null ?
           networkUtils.getPrivateLocalAddress() : alternativeHostnameFromProperty;
  }

  public String whereIs(String relativeUrl) {
    relativeUrl = getCommonPath(relativeUrl);
    return "http://" + getHostName() + ":" + port + relativeUrl;
  }

  public String whereElseIs(String relativeUrl) {
    relativeUrl = getCommonPath(relativeUrl);
    return "http://" + getAlternateHostName() + ":" + port + relativeUrl;
  }

  public String whereIsSecure(String relativeUrl) {
    relativeUrl = getCommonPath(relativeUrl);
    return "https://" + getHostName() + ":" + securePort + relativeUrl;
  }

  public String whereIsWithCredentials(String relativeUrl, String user, String pass) {
    relativeUrl = getCommonPath(relativeUrl);
    return "http://" + user + ":" + pass + "@" + getHostName() + ":" + port + relativeUrl;
  }

  private String getCommonPath(String relativeUrl) {
    if (!relativeUrl.startsWith("/")) {
      relativeUrl = DEFAULT_CONTEXT_PATH + "/" + relativeUrl;
    }
    return relativeUrl;
  }

  public void start() {
    SelectChannelConnector connector = new SelectChannelConnector();
    connector.setPort(port);
    server.addConnector(connector);

    File keyStore = getKeyStore();
    if (!keyStore.exists()) {
      throw new RuntimeException(
          "Cannot find keystore for SSL cert: " + keyStore.getAbsolutePath());
    }

    SslSocketConnector secureSocket = new SslSocketConnector();
    secureSocket.setPort(securePort);
    secureSocket.setKeystore(keyStore.getAbsolutePath());
    secureSocket.setPassword("password");
    secureSocket.setKeyPassword("password");
    secureSocket.setTruststore(keyStore.getAbsolutePath());
    secureSocket.setTrustPassword("password");
    server.addConnector(secureSocket);

    try {
      server.start();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  protected File getKeyStore() {
    return InProject.locate("java/client/test/keystore");
  }

  public void listenOn(int port) {
    this.port = port;
  }

  public void listenSecurelyOn(int port) {
    this.securePort = port;
  }

  protected void addListener(Connector listener) {
    server.addConnector(listener);
  }

  public void stop() {
    try {
      server.stop();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public void addServlet(String name, String url, Class<? extends Servlet> servletClass) {
    addServlet(defaultContext, name, url, servletClass);
  }

  public void addServlet(WebAppContext context, String name, String url,
                         Class<? extends Servlet> servletClass) {
    try {
      context.addServlet(new ServletHolder(servletClass), url);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public void addServlet(String url, Servlet servlet) {
    defaultContext.addServlet(new ServletHolder(servlet), url);
  }

  public void addFilter(Class<? extends Filter> filter, String path,
                        int dispatches) {
    defaultContext.addFilter(filter, path, dispatches);
  }

  private WebAppContext addWebApplication(String contextPath, File rootDir) {
    return addWebApplication(contextPath, rootDir.getAbsolutePath());
  }

  private WebAppContext addWebApplication(String contextPath, String absolutePath) {
    WebAppContext app = new WebAppContext();
    app.setContextPath(contextPath);
    app.setWar(absolutePath);
    handlers.addHandler(app);
    return app;
  }

  public void addAdditionalWebApplication(String context, String absolutePath) {
    addWebApplication(context, absolutePath);
  }

  public void addHandler(Handler handler) {
    handlers.addHandler(handler);
  }

  public static void main(String[] args) {
    Jetty7AppServer server = new Jetty7AppServer(detectHostname());

    server.listenOn(DEFAULT_HTTP_PORT);
    System.out.println(String.format("Starting server on port %d", DEFAULT_HTTP_PORT));

    server.listenSecurelyOn(DEFAULT_HTTPS_PORT);
    System.out.println(String.format("HTTPS on %d", DEFAULT_HTTPS_PORT));

    server.start();
  }

}
