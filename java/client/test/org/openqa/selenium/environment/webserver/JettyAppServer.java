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
import org.openqa.selenium.grid.web.PathResource;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.jetty.server.HttpHandlerServlet;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;

import javax.servlet.Servlet;
import java.io.File;
import java.io.FileNotFoundException;
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
import static org.openqa.selenium.build.InProject.locate;
import static org.openqa.selenium.remote.http.Contents.bytes;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class JettyAppServer implements AppServer {

  private static final String HOSTNAME_FOR_TEST_ENV_NAME = "HOSTNAME";
  private static final String ALTERNATIVE_HOSTNAME_FOR_TEST_ENV_NAME = "ALTERNATIVE_HOSTNAME";
  private static final String FIXED_HTTP_PORT_ENV_NAME = "TEST_HTTP_PORT";
  private static final String FIXED_HTTPS_PORT_ENV_NAME = "TEST_HTTPS_PORT";

  private static final int DEFAULT_HTTP_PORT = 2310;
  private static final int DEFAULT_HTTPS_PORT = 2410;
  private static final String DEFAULT_CONTEXT_PATH = "/common";
  private static final String FILEZ_CONTEXT_PATH = "/filez";
  private static final String JS_SRC_CONTEXT_PATH = "/javascript";
  private static final String TEMP_SRC_CONTEXT_PATH = "/temp";
  private static final String CLOSURE_CONTEXT_PATH = "/third_party/closure/goog";
  private static final String THIRD_PARTY_JS_CONTEXT_PATH = "/third_party/js";

  private static final NetworkUtils networkUtils = new NetworkUtils();

  private final int port;
  private final int securePort;
  private final Server server;

  private final ContextHandlerCollection handlers;
  private final String hostName;
  private final File tempPageDir;

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

    Path webSrc = locate("common/src/web");
    ServletContextHandler defaultContext = new ServletContextHandler();
    handlers.addHandler(defaultContext);

    // Only non-null when running with bazel test.
    Path runfiles = InProject.findRunfilesRoot();
//    if (runfiles != null) {
//      addResourceHandler(FILEZ_CONTEXT_PATH, runfiles);
//    }

    TemporaryFilesystem tempFs = TemporaryFilesystem.getDefaultTmpFS();
    tempPageDir = tempFs.createTempDir("pages", "test");
    defaultContext.setInitParameter("tempPageDir", tempPageDir.getAbsolutePath());
    defaultContext.setInitParameter("hostname", hostName);
    defaultContext.setInitParameter("port", ""+port);
    defaultContext.setInitParameter("path", TEMP_SRC_CONTEXT_PATH);
    defaultContext.setInitParameter("webSrc", webSrc.toAbsolutePath().toString());

    addServlet(defaultContext, "/quitquitquit", KillSwitchServlet.class);

    CreatePageHandler createPageHandler = new CreatePageHandler(
      tempPageDir.toPath(),
      hostName,
      httpPort,
      TEMP_SRC_CONTEXT_PATH);
    Routable generatedPages = new org.openqa.selenium.grid.web.ResourceHandler(new PathResource(tempPageDir.toPath()));

    // Default route
    Route route = Route.combine(
      Route.get("/basicAuth").to(BasicAuthHandler::new),
      Route.get("/cookie").to(CookieHandler::new),
      Route.get("/encoding").to(EncodingHandler::new),
      Route.matching(req -> req.getUri().startsWith("/generated/")).to(() -> new GeneratedJsTestHandler("/generated")),
      Route.matching(req -> req.getUri().startsWith("/page/") && req.getMethod() == GET).to(PageHandler::new),
      Route.post("/createPage").to(() -> createPageHandler),
      Route.get("/redirect").to(RedirectHandler::new),
      Route.get("/sleep").to(SleepingHandler::new),
      Route.post("/upload").to(UploadHandler::new),
      Route.matching(req -> req.getUri().startsWith("/utf8/")).to(() -> new Utf8Handler(webSrc, "/utf8/")),
      Route.prefix(TEMP_SRC_CONTEXT_PATH).to(Route.combine(generatedPages)),
      new CommonWebResources());

    // If we're not running inside `bazel test` this will be non-null
//    if (runfiles != null) {
//      route = Route.combine(
//        route,
//        Route.matching(req -> req.getUri().startsWith(FILEZ_CONTEXT_PATH)).to(new )
//      )
//      addResourceHandler(FILEZ_CONTEXT_PATH, runfiles);
//    }

    Route prefixed = Route.prefix(DEFAULT_CONTEXT_PATH).to(route);
    defaultContext.addServlet(new ServletHolder(new HttpHandlerServlet(Route.combine(route, prefixed))), "/*");

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
    new JettyAppServer(detectHostname(), httpPort, httpsPort).start();
  }

}
