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

package org.openqa.selenium.environment.webserver;

import static com.google.common.base.Charsets.UTF_8;
import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static com.google.common.net.MediaType.JSON_UTF_8;
import static org.openqa.selenium.net.PortProber.findFreePort;
import static org.openqa.selenium.testing.InProject.locate;

import com.google.common.collect.ImmutableList;
import com.google.gson.JsonObject;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.internal.ApacheHttpClient;
import org.openqa.selenium.testing.InProject;
import org.seleniumhq.jetty9.http.HttpVersion;
import org.seleniumhq.jetty9.http.MimeTypes;
import org.seleniumhq.jetty9.server.Connector;
import org.seleniumhq.jetty9.server.HttpConfiguration;
import org.seleniumhq.jetty9.server.HttpConnectionFactory;
import org.seleniumhq.jetty9.server.SecureRequestCustomizer;
import org.seleniumhq.jetty9.server.Server;
import org.seleniumhq.jetty9.server.ServerConnector;
import org.seleniumhq.jetty9.server.SslConnectionFactory;
import org.seleniumhq.jetty9.server.handler.AllowSymLinkAliasChecker;
import org.seleniumhq.jetty9.server.handler.ContextHandler.ApproveAliases;
import org.seleniumhq.jetty9.server.handler.ContextHandlerCollection;
import org.seleniumhq.jetty9.server.handler.HandlerList;
import org.seleniumhq.jetty9.server.handler.ResourceHandler;
import org.seleniumhq.jetty9.servlet.ServletContextHandler;
import org.seleniumhq.jetty9.servlet.ServletHolder;
import org.seleniumhq.jetty9.util.ssl.SslContextFactory;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.EnumSet;

import javax.servlet.DispatcherType;
import javax.servlet.Filter;
import javax.servlet.Servlet;

public class JettyAppServer implements AppServer {

  private static final String HOSTNAME_FOR_TEST_ENV_NAME = "HOSTNAME";
  private static final String ALTERNATIVE_HOSTNAME_FOR_TEST_ENV_NAME = "ALTERNATIVE_HOSTNAME";
  private static final String FIXED_HTTP_PORT_ENV_NAME = "TEST_HTTP_PORT";
  private static final String FIXED_HTTPS_PORT_ENV_NAME = "TEST_HTTPS_PORT";

  private static final int DEFAULT_HTTP_PORT = 2310;
  private static final int DEFAULT_HTTPS_PORT = 2410;
  private static final String DEFAULT_CONTEXT_PATH = "/common";
  private static final String JS_SRC_CONTEXT_PATH = "/javascript";
  private static final String TEMP_SRC_CONTEXT_PATH = "/temp";
  private static final String CLOSURE_CONTEXT_PATH = "/third_party/closure/goog";
  private static final String THIRD_PARTY_JS_CONTEXT_PATH = "/third_party/js";

  private static final NetworkUtils networkUtils = new NetworkUtils();

  private int port;
  private int securePort;
  private final Server server;

  private ContextHandlerCollection handlers;
  private final String hostName;
  private File tempPageDir;

  public JettyAppServer() {
    this(detectHostname(), getHttpPort(), getHttpsPort());
  }

  public static String detectHostname() {
    String hostnameFromProperty = System.getenv(HOSTNAME_FOR_TEST_ENV_NAME);
    return hostnameFromProperty == null ? "localhost" : hostnameFromProperty;
  }

  public JettyAppServer(String hostName, int httpPort, int httpsPort) {
    this.hostName = hostName;
    this.port = httpPort;
    this.securePort = httpsPort;

    // Be quiet. Unless we want things to be chatty
    if (!Boolean.getBoolean("webdriver.debug")) {
      new NullLogger().disableLogging();
    }

    server = new Server();

    handlers = new ContextHandlerCollection();

    ServletContextHandler defaultContext = addResourceHandler(
        DEFAULT_CONTEXT_PATH, locate("common/src/web"));
    ServletContextHandler jsContext = addResourceHandler(
        JS_SRC_CONTEXT_PATH, locate("javascript"));
    addResourceHandler(CLOSURE_CONTEXT_PATH, locate("third_party/closure/goog"));
    addResourceHandler(THIRD_PARTY_JS_CONTEXT_PATH, locate("third_party/js"));

    TemporaryFilesystem tempFs = TemporaryFilesystem.getDefaultTmpFS();
    tempPageDir = tempFs.createTempDir("pages", "test");
    ServletContextHandler tempContext = addResourceHandler(
        TEMP_SRC_CONTEXT_PATH, tempPageDir.toPath());
    defaultContext.setInitParameter("tempPageDir", tempPageDir.getAbsolutePath());
    defaultContext.setInitParameter("hostname", hostName);
    defaultContext.setInitParameter("port", ""+port);
    defaultContext.setInitParameter("path", TEMP_SRC_CONTEXT_PATH);

    server.setHandler(handlers);

    addServlet(defaultContext, "/redirect", RedirectServlet.class);
    addServlet(defaultContext, "/page/*", PageServlet.class);

    addServlet(defaultContext, "/manifest/*", ManifestServlet.class);
    // Serves every file under DEFAULT_CONTEXT_PATH/utf8 as UTF-8 to the browser
    addServlet(defaultContext, "/utf8/*", Utf8Servlet.class);

    addServlet(defaultContext, "/upload", UploadServlet.class);
    addServlet(defaultContext, "/encoding", EncodingServlet.class);
    addServlet(defaultContext, "/sleep", SleepingServlet.class);
    addServlet(defaultContext, "/cookie", CookieServlet.class);
    addServlet(defaultContext, "/quitquitquit", KillSwitchServlet.class);
    addServlet(defaultContext, "/basicAuth", BasicAuth.class);
    addServlet(defaultContext, "/generated/*", GeneratedJsTestServlet.class);
    addServlet(defaultContext, "/createPage", CreatePageServlet.class);
  }

  private static int getHttpPort() {
    String port = System.getenv(FIXED_HTTP_PORT_ENV_NAME);
    return port == null ? findFreePort() : Integer.parseInt(port);
  }

  private static int getHttpsPort() {
    String port = System.getenv(FIXED_HTTPS_PORT_ENV_NAME);
    return port == null ? findFreePort() : Integer.parseInt(port);
  }

  @Override
  public String getHostName() {
    return hostName;
  }

  @Override
  public String getAlternateHostName() {
    String alternativeHostnameFromProperty = System.getenv(ALTERNATIVE_HOSTNAME_FOR_TEST_ENV_NAME);
    if (alternativeHostnameFromProperty != null) {
      return alternativeHostnameFromProperty;
    }
    try {
      return networkUtils.getNonLoopbackAddressOfThisMachine();
    } catch (WebDriverException e) {
      return networkUtils.getPrivateLocalAddress();
    }
  }

  @Override
  public String whereIs(String relativeUrl) {
    relativeUrl = getMainContextPath(relativeUrl);
    return "http://" + getHostName() + ":" + port + relativeUrl;
  }

  @Override
  public String whereElseIs(String relativeUrl) {
    relativeUrl = getMainContextPath(relativeUrl);
    return "http://" + getAlternateHostName() + ":" + port + relativeUrl;
  }

  @Override
  public String whereIsSecure(String relativeUrl) {
    relativeUrl = getMainContextPath(relativeUrl);
    return "https://" + getHostName() + ":" + securePort + relativeUrl;
  }

  @Override
  public String whereIsWithCredentials(String relativeUrl, String user, String pass) {
    relativeUrl = getMainContextPath(relativeUrl);
    return "http://" + user + ":" + pass + "@" + getHostName() + ":" + port + relativeUrl;
  }

  @Override
  public String create(Page page) {
    try {
      JsonObject converted = new JsonObject();
      converted.addProperty("content", page.toString());
      byte[] data = converted.toString().getBytes(UTF_8);

      HttpClient client = new ApacheHttpClient.Factory().createClient(new URL(whereIs("/")));
      HttpRequest request = new HttpRequest(HttpMethod.POST, "/common/createPage");
      request.setHeader(CONTENT_TYPE, JSON_UTF_8.toString());
      request.setContent(data);
      HttpResponse response = client.execute(request, true);
      return response.getContentString();
    } catch (IOException ex) {
      throw new RuntimeException(ex);
    }
  }

  protected String getMainContextPath(String relativeUrl) {
    if (!relativeUrl.startsWith("/")) {
      relativeUrl = DEFAULT_CONTEXT_PATH + "/" + relativeUrl;
    }
    return relativeUrl;
  }

  @Override
  public void start() {
    HttpConfiguration httpConfig = new HttpConfiguration();
    httpConfig.setSecureScheme("https");
    httpConfig.setSecurePort(securePort);

    ServerConnector http = new ServerConnector(server, new HttpConnectionFactory(httpConfig));
    http.setPort(port);
    http.setIdleTimeout(500000);

    Path keystore = getKeyStore();
    if (!Files.exists(keystore)) {
      throw new RuntimeException(
          "Cannot find keystore for SSL cert: " + keystore.toAbsolutePath());
    }

    SslContextFactory sslContextFactory = new SslContextFactory();
    sslContextFactory.setKeyStorePath(keystore.toAbsolutePath().toString());
    sslContextFactory.setKeyStorePassword("password");
    sslContextFactory.setKeyManagerPassword("password");

    HttpConfiguration httpsConfig = new HttpConfiguration(httpConfig);
    httpsConfig.addCustomizer(new SecureRequestCustomizer());

    ServerConnector https = new ServerConnector(
        server,
        new SslConnectionFactory(sslContextFactory, HttpVersion.HTTP_1_1.asString()),
        new HttpConnectionFactory(httpsConfig));
    https.setPort(securePort);
    https.setIdleTimeout(500000);

    server.setConnectors(new Connector[]{http, https});

    try {
      server.start();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  protected Path getKeyStore() {
    return InProject.locate("java/client/test/org/openqa/selenium/environment/webserver/keystore");
  }

  @Override
  public void stop() {
    try {
      server.stop();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public void addServlet(
      ServletContextHandler context,
      String url,
      Class<? extends Servlet> servletClass) {
    try {
      context.addServlet(new ServletHolder(servletClass), url);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public void addFilter(
      ServletContextHandler context,
      Class<? extends Filter> filter,
      String path,
      DispatcherType dispatches) {
    context.addFilter(filter, path, EnumSet.of(dispatches));
  }

  protected ServletContextHandler addResourceHandler(String contextPath, Path resourceBase) {
    ServletContextHandler context = new ServletContextHandler();

    ResourceHandler staticResource = new ResourceHandler();
    staticResource.setDirectoriesListed(true);
    staticResource.setWelcomeFiles(new String[] { "index.html" });
    staticResource.setResourceBase(resourceBase.toAbsolutePath().toString());
    MimeTypes mimeTypes = new MimeTypes();
    mimeTypes.addMimeMapping("appcache", "text/cache-manifest");
    staticResource.setMimeTypes(mimeTypes);

    context.setContextPath(contextPath);
    context.setAliasChecks(ImmutableList.of(new ApproveAliases(), new AllowSymLinkAliasChecker()));

    HandlerList allHandlers = new HandlerList();
    allHandlers.addHandler(staticResource);
    allHandlers.addHandler(context.getHandler());
    context.setHandler(allHandlers);

    handlers.addHandler(context);

    return context;
  }

  protected static int getHttpPortFromEnv() {
    String port = System.getenv(FIXED_HTTP_PORT_ENV_NAME);
    return port == null ? DEFAULT_HTTP_PORT : Integer.parseInt(port);
  }

  protected static int getHttpsPortFromEnv() {
    String port = System.getenv(FIXED_HTTPS_PORT_ENV_NAME);
    return port == null ? DEFAULT_HTTPS_PORT : Integer.parseInt(port);
  }

  public static void main(String[] args) {
    int httpPort = getHttpPortFromEnv();
    int httpsPort = getHttpsPortFromEnv();
    System.out.println(String.format("Starting server on HTTPS port %d and HTTPS port %d",
                                     httpPort, httpsPort));
    new JettyAppServer(detectHostname(), httpPort, httpsPort).start();
  }

}
