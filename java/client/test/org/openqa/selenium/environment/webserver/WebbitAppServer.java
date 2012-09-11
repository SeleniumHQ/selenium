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


package org.openqa.selenium.environment.webserver;

import static java.util.concurrent.Executors.newFixedThreadPool;
import static org.openqa.selenium.net.PortProber.findFreePort;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.concurrent.Future;

import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.testing.InProject;
import org.webbitserver.HttpHandler;
import org.webbitserver.WebServer;
import org.webbitserver.WebServers;
import org.webbitserver.handler.PathMatchHandler;
import org.webbitserver.handler.StringHttpHandler;

import com.google.common.base.Charsets;
import com.google.common.base.Throwables;

/**
 * A simple app server used to host test files, using Webbit as the underlying web server.
 */
public class WebbitAppServer implements AppServer {

  private static final String SHALOM_TEXT =
      "<html><head><title>Character encoding (UTF 16)</title></head>" +
      "<body><p id='text'>\u05E9\u05DC\u05D5\u05DD</p></body></html>";

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

  private final NetworkUtils networkUtils = new NetworkUtils();
  
  private final String hostname;
  private int httpPort;
  private int httpsPort;
  
  private WebServer httpServer;
  private WebServer httpsServer;

  public WebbitAppServer() {
    this(detectHostname());
  }
  
  public WebbitAppServer(String hostname) {
    this.hostname = hostname;
    
    listenOn(getHttpPort());
    listenSecurelyOn(getHttpsPort());
  }

  public static String detectHostname() {
    String hostnameFromProperty = System.getenv(HOSTNAME_FOR_TEST_ENV_NAME);
    return hostnameFromProperty == null ? "localhost" : hostnameFromProperty;
  }

  public String getHostName() {
    return hostname;
  }
  
  private int getHttpPort() {
    if (this.httpPort == 0) {
      String port = System.getenv(FIXED_HTTP_PORT_ENV_NAME);
      this.httpPort = port == null ? findFreePort() : Integer.parseInt(port);
    }
    return this.httpPort;
  }

  private int getHttpsPort() {
    if (this.httpsPort == 0) {
      String port = System.getenv(FIXED_HTTPS_PORT_ENV_NAME);
      this.httpsPort = port == null ? findFreePort() : Integer.parseInt(port);
    }
    return this.httpsPort;
  }

  public String getAlternateHostName() {
    String alternativeHostnameFromProperty = System.getenv(ALTERNATIVE_HOSTNAME_FOR_TEST_ENV_NAME);
    return alternativeHostnameFromProperty == null ?
           networkUtils.getPrivateLocalAddress() : alternativeHostnameFromProperty;
  }

  public String whereIs(String relativeUrl) {
    return "http://" + getHostName() + ":" + getHttpPort() + getCommonPath(relativeUrl);
  }

  public String whereElseIs(String relativeUrl) {
    return "http://" + getAlternateHostName() + ":" + getHttpPort() + getCommonPath(relativeUrl);
  }

  public String whereIsSecure(String relativeUrl) {
    relativeUrl = getCommonPath(relativeUrl);
    return "https://" + getHostName() + ":" + getHttpsPort() + relativeUrl;
  }

  public String whereIsWithCredentials(String relativeUrl, String user, String password) {
    return "http://" + user + ":" + password + "@" + getHostName() + ":" + httpPort +
        getCommonPath(relativeUrl);
  }

  private String getCommonPath(String relativeUrl) {
    if (!relativeUrl.startsWith("/")) {
      relativeUrl = DEFAULT_CONTEXT_PATH + "/" + relativeUrl;
    }
    return relativeUrl;
  }

  public void start() {
    httpServer = configureServer(httpPort);
    httpsServer = configureServer(httpsPort).setupSsl(getKeystoreFile(), "password", "password");
    waitFor(httpServer.start());
    waitFor(httpsServer.start());
  }
  
  public void stop() {
    httpServer.stop();
  }
  
  private WebServer configureServer(int port) {
    WebServer server = WebServers.createWebServer(newFixedThreadPool(5), port);
    
    // Note: Does first matching prefix matching, so /common/foo must be set up before /common
    // Delegating to a PathMatchHandler can be used to limit this
    forwardPathToHandlerUnderCommon("/page", new LastPathSegmentHandler(), server);
    forwardPathToHandlerUnderCommon("/redirect", new RedirectHandler("resultPage.html"), server);
    forwardPathToHandlerUnderCommon("/sleep", new SleepHandler(), server);
    forwardPathToHandlerUnderCommon("/encoding",
        new StringHttpHandler("text/html", SHALOM_TEXT, Charsets.UTF_16), server);
    forwardPathToHandlerUnderCommon("/upload",
        new PathMatchHandler("^$", new UploadFileHandler()), server);
    forwardPathToHandlerUnderCommon("/basicAuth", new BasicAuthHandler("test:test"), server);
    forwardPathToHandlerUnderCommon("/quitquitquit", new QuitQuitQuitHandler(), server);
    server.add(new PathAugmentingStaticFileHandler(InProject.locate("common/src/web"), "/common"));
    server.add(
      new PathAugmentingStaticFileHandler(InProject.locate("javascript"), JS_SRC_CONTEXT_PATH));
    server.add(
      new PathAugmentingStaticFileHandler(
        InProject.locate("/third_party/closure/goog"),
          CLOSURE_CONTEXT_PATH));
    server.add(
      new PathAugmentingStaticFileHandler(
        InProject.locate("/third_party/js"),
          THIRD_PARTY_JS_CONTEXT_PATH));

    return server;
  }
  
  public WebbitAppServer addHandler(String path, HttpHandler handler) {
    forwardPathToHandler(path, handler, httpServer);
    forwardPathToHandler(path, handler, httpsServer);
    return this;
  }
  
  private InputStream getKeystoreFile() {
    try {
      return new FileInputStream(InProject.locate("java/client/test/keystore"));
    } catch (Throwable t) {
      throw Throwables.propagate(t);
    }
  }
  
  private void waitFor(Future<? extends WebServer> server) {
    long startTime = System.currentTimeMillis();
    while (System.currentTimeMillis() - startTime < 10000) {
      if (server.isCancelled()) {
        throw new TimeoutException("Timed out waiting for server to start");
      }
      if (server.isDone()) {
        return;
      }
    }
    throw new TimeoutException("Timed out waiting for server to start");
  }

  // Note: Does first matching prefix matching, so /common/foo must be set up before /common
  // Delegating to a PathMatchHandler can be used to limit this
  private void forwardPathToHandler(String path, HttpHandler handler, WebServer server) {
    server.add(new PathForwardingHandler(path, handler));
  }

  private void forwardPathToHandlerUnderCommon(String path, HttpHandler handler, WebServer server) {
    forwardPathToHandler("/common" + path, handler, server);
  }

  public void listenOn(int port) {
    this.httpPort = port;
  }

  public void listenSecurelyOn(int port) {
    this.httpsPort = port;
  }

  public static void main(String[] args) {
    WebbitAppServer server = new WebbitAppServer();
    server.listenOn(DEFAULT_HTTP_PORT);
    server.listenSecurelyOn(DEFAULT_HTTPS_PORT);
    server.start();
    System.out.printf("Started server on port %s, https on %s%n",
        server.getHttpPort(), server.getHttpsPort());
  }
}
