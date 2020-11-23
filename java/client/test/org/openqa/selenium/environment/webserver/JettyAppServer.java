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

import org.eclipse.jetty.http.HttpVersion;
import org.eclipse.jetty.http.MimeTypes;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.HttpConfiguration;
import org.eclipse.jetty.server.HttpConnectionFactory;
import org.eclipse.jetty.server.SecureRequestCustomizer;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.SslConnectionFactory;
import org.eclipse.jetty.server.handler.AllowSymLinkAliasChecker;
import org.eclipse.jetty.server.handler.ContextHandler.ApproveAliases;
import org.eclipse.jetty.server.handler.ContextHandlerCollection;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.eclipse.jetty.util.ssl.SslContextFactory;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.jetty.server.HttpHandlerServlet;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import javax.servlet.Servlet;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Optional;

import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.nio.charset.StandardCharsets.UTF_8;
import static java.util.Collections.singletonMap;
import static org.openqa.selenium.remote.http.Contents.bytes;
import static org.openqa.selenium.remote.http.Contents.string;

public class JettyAppServer implements AppServer {

  private static final String FIXED_HTTP_PORT_ENV_NAME = "TEST_HTTP_PORT";
  private static final String FIXED_HTTPS_PORT_ENV_NAME = "TEST_HTTPS_PORT";

  private static final int DEFAULT_HTTP_PORT = 2310;
  private static final int DEFAULT_HTTPS_PORT = 2410;
  private static final String DEFAULT_CONTEXT_PATH = "/common";

  private static final NetworkUtils networkUtils = new NetworkUtils();

  private final int port;
  private final int securePort;
  private final Server server;

  private final ContextHandlerCollection handlers;
  private final String hostName;
  private final File tempPageDir;

  public JettyAppServer() {
    this(AppServer.detectHostname(), getHttpPort(), getHttpsPort());
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

    ServletContextHandler defaultContext = new ServletContextHandler();
    handlers.addHandler(defaultContext);

    TemporaryFilesystem tempFs = TemporaryFilesystem.getDefaultTmpFS();
    tempPageDir = tempFs.createTempDir("pages", "test");

    addServlet(defaultContext, "/quitquitquit", KillSwitchServlet.class);

    defaultContext.addServlet(
      new ServletHolder(new HttpHandlerServlet(new HandlersForTests(hostName, port, tempPageDir.toPath()))),
      "/*");

    server.setHandler(handlers);
  }

  private static Optional<Integer> getEnvValue(String key) {
    return Optional.ofNullable(System.getenv(key)).map(Integer::parseInt);
  }

  private static int getHttpPort() {
    return getEnvValue(FIXED_HTTP_PORT_ENV_NAME).orElseGet(PortProber::findFreePort);
  }

  private static int getHttpsPort() {
    return getEnvValue(FIXED_HTTPS_PORT_ENV_NAME).orElseGet(PortProber::findFreePort);
  }

  @Override
  public String getHostName() {
    return hostName;
  }

  @Override
  public String getAlternateHostName() {
    return AppServer.detectAlternateHostname();
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
      byte[] data = new Json().toJson(singletonMap("content", page.toString())).getBytes(UTF_8);

      HttpClient client = HttpClient.Factory.createDefault().createClient(new URL(whereIs("/")));
      HttpRequest request = new HttpRequest(HttpMethod.POST, "/common/createPage");
      request.setHeader(CONTENT_TYPE, JSON_UTF_8.toString());
      request.setContent(bytes(data));
      HttpResponse response = client.execute(request);
      String url = string(response);
      System.out.println("Created page at: " + url);
      return url;
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
    context.setAliasChecks(Arrays.asList(new ApproveAliases(), new AllowSymLinkAliasChecker()));

    HandlerList allHandlers = new HandlerList();
    allHandlers.addHandler(staticResource);
    allHandlers.addHandler(context.getHandler());
    context.setHandler(allHandlers);

    handlers.addHandler(context);

    return context;
  }

  protected static int getHttpPortFromEnv() {
    return getEnvValue(FIXED_HTTP_PORT_ENV_NAME).orElse(DEFAULT_HTTP_PORT);
  }

  protected static int getHttpsPortFromEnv() {
    return getEnvValue(FIXED_HTTPS_PORT_ENV_NAME).orElse(DEFAULT_HTTPS_PORT);
  }

  public static void main(String[] args) {
    int httpPort = getHttpPortFromEnv();
    int httpsPort = getHttpsPortFromEnv();
    System.out.printf("Starting server on HTTPS port %d and HTTPS port %d%n", httpPort, httpsPort);
    new JettyAppServer(AppServer.detectHostname(), httpPort, httpsPort).start();
  }

}
