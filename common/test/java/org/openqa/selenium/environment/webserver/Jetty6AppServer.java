/*
Copyright 2007-2009 WebDriver committers
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

import org.mortbay.jetty.Connector;
import org.mortbay.jetty.Handler;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.nio.SelectChannelConnector;
import org.mortbay.jetty.security.SslSocketConnector;
import org.mortbay.jetty.webapp.WebAppContext;
import org.mortbay.servlet.MultiPartFilter;
import org.openqa.selenium.NetworkUtils;
import org.openqa.selenium.internal.PortProber;

import junit.framework.Assert;

import javax.servlet.Servlet;
import java.io.File;

import static org.openqa.selenium.internal.PortProber.*;

public class Jetty6AppServer implements AppServer {

  private static final String DEFAULT_CONTEXT_PATH = "/common";
  private static final String JS_SRC_CONTEXT_PATH = "/js/src";
  private static final String JS_TEST_CONTEXT_PATH = "/js/test";
  private static final String THIRD_PARTY_JS_CONTEXT_PATH =
      "/third_party/closure/goog";

  private int port;
  private int securePort;
  private File path;
  private File jsSrcRoot;
  private File jsTestRoot;
  private File thirdPartyJsRoot;
  private final Server server;
  private WebAppContext context;

  public Jetty6AppServer() {
    // Be quiet. Unless we want things to be chatty
    if (!Boolean.getBoolean("webdriver.debug")) {
      new NullLogger().disableLogging();
    }

    server = new Server();

    path = findRootOfWebApp();
    jsSrcRoot = findJsSrcWebAppRoot();
    jsTestRoot = findJsTestWebAppRoot();
    thirdPartyJsRoot = findThirdPartyJsWebAppRoot();

    context = addWebApplication(DEFAULT_CONTEXT_PATH, path);
    addWebApplication(JS_SRC_CONTEXT_PATH, jsSrcRoot);
    addWebApplication(JS_TEST_CONTEXT_PATH, jsTestRoot);
    addWebApplication(THIRD_PARTY_JS_CONTEXT_PATH, thirdPartyJsRoot);

    addServlet("Redirecter", "/redirect", RedirectServlet.class);
    addServlet("InfinitePagerServer", "/page/*", PageServlet.class);
    addServlet("Uploader", "/upload", UploadServlet.class);
    addServlet("Unusual encoding", "/encoding", EncodingServlet.class);
    addServlet("Sleeper", "/sleep", SleepingServlet.class);
    addFilter(MultiPartFilter.class, "/upload", Handler.DEFAULT);

    listenOn(findFreePort());
    listenSecurelyOn(findFreePort());
  }

  public File getJsTestRoot() {
    return jsTestRoot;
  }

  protected File findRootOfWebApp() {
    String[] possiblePaths = {
        "common/src/web",
        "../common/src/web",
        "../../common/src/web",
    };

    File current;
    for (String potential : possiblePaths) {
      current = new File(potential);
      if (current.exists()) {
        return current;
      }
    }

    Assert.assertTrue("Unable to find common web files. These are located in the common directory",
                      path.exists());
    return null;
  }

  private static File findJsSrcWebAppRoot() {
    return findWebAppRoot(new String[] {
        "common/src/js",
        "../common/src/js",
        "../../common/src/js"
    });
  }

  private static File findJsTestWebAppRoot() {
    return findWebAppRoot(new String[] {
        "common/test/js",
        "../common/test/js",
        "../../common/test/js"
    });
  }

  private static File findThirdPartyJsWebAppRoot() {
    return findWebAppRoot(new String[] {
        "third_party/closure/goog",
        "../third_party/closure/goog",
        "../../third_party/closure/goog"
    });
  }

  private static File findWebAppRoot(String[] possiblePaths) {
    for (String potential : possiblePaths) {
      File current = new File(potential);
      if (current.exists()) {
        return current;
      }
    }
    return null;
  }

  public String getHostName() {
    return "localhost";
  }

  public String getAlternateHostName() {
    return NetworkUtils.getPrivateLocalAddress();
  }

  public String whereIs(String relativeUrl) {
    if (!relativeUrl.startsWith("/")) {
      relativeUrl = DEFAULT_CONTEXT_PATH + "/" + relativeUrl;
    }
    return "http://" + getHostName() + ":" + port + relativeUrl;
  }

  public String whereElseIs(String relativeUrl) {
    if (!relativeUrl.startsWith("/")) {
      relativeUrl = DEFAULT_CONTEXT_PATH + "/" + relativeUrl;
    }
    return "http://" + getAlternateHostName() + ":" + port + relativeUrl;
  }

  public String whereIsSecure(String relativeUrl) {
    if (!relativeUrl.startsWith("/")) {
      relativeUrl = DEFAULT_CONTEXT_PATH + "/" + relativeUrl;
    }
    return "https://" + getHostName() + ":" + securePort + relativeUrl;
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
    return new File(findRootOfWebApp(), "../../test/java/keystore");
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
    try {
      context.addServlet(servletClass, url);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public void addFilter(Class<?> filter, String path, int dispatches) {
    context.addFilter(filter, path, dispatches);
  }


  public void addAdditionalWebApplication(String context, String absolutePath) {
    addWebApplication(context, absolutePath);
  }

  private WebAppContext addWebApplication(String contextPath, File rootDir) {
    return addWebApplication(contextPath, rootDir.getAbsolutePath());
  }

  private WebAppContext addWebApplication(String contextPath, String absolutePath) {
    WebAppContext app = new WebAppContext();
    app.setContextPath(contextPath);
    app.setWar(absolutePath);
    server.addHandler(app);
    return app;
  }

  public static void main(String[] args) {
    Jetty6AppServer server = new Jetty6AppServer();
    server.port = 2310;
    server.start();
  }
}
