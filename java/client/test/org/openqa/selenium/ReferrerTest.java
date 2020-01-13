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

package org.openqa.selenium;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.CapabilityType.PROXY;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.MARIONETTE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;
import static org.openqa.selenium.build.InProject.locate;

import com.google.common.base.Joiner;
import com.google.common.base.Objects;
import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.google.common.net.HostAndPort;
import com.google.common.net.HttpHeaders;

import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExternalResource;
import org.openqa.selenium.environment.webserver.JettyAppServer;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.handler.AbstractHandler;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.TimeUnit;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Tests that "Referer" headers are generated as expected under various conditions.
 * Each test will perform the following steps in the browser:
 * <ol>
 * <li>navigate to page 1
 * <li>click a link to page 2
 * <li>click another link to page 3
 * <li>click a link to go back to page 2
 * <li>click a link to go forward to page 3
 * </ol>
 *
 * <p>After performing the steps above, the test will check that the test server(s)
 * recorded the expected HTTP requests. For each step, the tests expect:
 * <ol>
 * <li>a request for page1; no Referer header
 * <li>a request for page2; Referer: $absolute-url-for-page1
 * <li>a request for page3; Referer: $absolute-url-for-page2
 * <li>no request
 * <li>no request
 * </ol>
 *
 * <p>Note: depending on the condition under test, the various pages may or may
 * not be served by the same server.
 */
@Ignore(SAFARI)
public class ReferrerTest extends JUnit4TestBase {

  private static String page1;
  private static String page2;
  private static String page3;

  @Rule public CustomDriverFactory customDriverFactory = new CustomDriverFactory();
  @Rule public PacFileServerResource pacFileServer = new PacFileServerResource();
  @Rule public ProxyServer proxyServer = new ProxyServer();
  @Rule public TestServer testServer1 = new TestServer();
  @Rule public TestServer testServer2 = new TestServer();

  @BeforeClass
  public static void readPages() throws IOException {
    page1 = new String(Files.readAllBytes(locate("common/src/web/proxy/page1.html")), UTF_8);
    page2 = new String(Files.readAllBytes(locate("common/src/web/proxy/page2.html")), UTF_8);
    page3 = new String(Files.readAllBytes(locate("common/src/web/proxy/page3.html")), UTF_8);
  }

  /**
   * Tests navigation when all of the files are hosted on the same domain and the browser
   * does not have a proxy configured.
   */
  @Test
  @NotYetImplemented(EDGE)
  @NeedsLocalEnvironment
  public void basicHistoryNavigationWithoutAProxy() {
    testServer1.start();

    String page1Url = buildPage1Url(testServer1, buildPage2Url(testServer1));
    String page2Url = buildPage2Url(testServer1, buildPage3Url(testServer1));
    String page3Url = buildPage3Url(testServer1);

    performNavigation(driver, page1Url);

    assertThat(testServer1.getRequests()).isEqualTo(ImmutableList.of(
        new HttpRequest(page1Url, null),
        new HttpRequest(page2Url, page1Url),
        new HttpRequest(page3Url, page2Url)));
  }

  /**
   * Tests navigation across multiple domains when the browser does not have a proxy configured.
   */
  @Test
  @NotYetImplemented(EDGE)
  @NeedsLocalEnvironment
  public void crossDomainHistoryNavigationWithoutAProxy() {

    testServer1.start();
    testServer2.start();

    String page1Url = buildPage1Url(testServer1, buildPage2Url(testServer2));
    String page2Url = buildPage2Url(testServer2, buildPage3Url(testServer1));
    String page3Url = buildPage3Url(testServer1);

    performNavigation(driver, page1Url);

    assertThat(testServer1.getRequests()).isEqualTo(ImmutableList.of(
        new HttpRequest(page1Url, null),
        new HttpRequest(page3Url, page2Url)));

    assertThat(testServer2.getRequests()).isEqualTo(ImmutableList.of(new HttpRequest(
        page2Url,
        page1Url)));
  }

  /**
   * Tests navigation when all of the files are hosted on the same domain and the browser is
   * configured to use a proxy that permits direct access to that domain.
   */
  @Test
  @Ignore(EDGE)
  @NeedsLocalEnvironment
  public void basicHistoryNavigationWithADirectProxy() {
    testServer1.start();

    pacFileServer.setPacFileContents(
        "function FindProxyForURL(url, host) { return 'DIRECT'; }");
    pacFileServer.start();
    WebDriver driver = customDriverFactory.createDriver(pacFileServer.getBaseUrl());

    String page1Url = buildPage1Url(testServer1, buildPage2Url(testServer1));
    String page2Url = buildPage2Url(testServer1, buildPage3Url(testServer1));
    String page3Url = buildPage3Url(testServer1);

    performNavigation(driver, page1Url);

    assertThat(testServer1.getRequests()).isEqualTo(ImmutableList.of(
        new HttpRequest(page1Url, null),
        new HttpRequest(page2Url, page1Url),
        new HttpRequest(page3Url, page2Url)));
  }

  /**
   * Tests navigation across multiple domains when the browser is configured to use a proxy that
   * permits direct access to those domains.
   */
  @Test
  @Ignore(EDGE)
  @NeedsLocalEnvironment
  public void crossDomainHistoryNavigationWithADirectProxy() {
    testServer1.start();
    testServer2.start();

    pacFileServer.setPacFileContents(
        "function FindProxyForURL(url, host) { return 'DIRECT'; }");
    pacFileServer.start();
    WebDriver driver = customDriverFactory.createDriver(pacFileServer.getBaseUrl());

    String page1Url = buildPage1Url(testServer1, buildPage2Url(testServer2));
    String page2Url = buildPage2Url(testServer2, buildPage3Url(testServer1));
    String page3Url = buildPage3Url(testServer1);

    performNavigation(driver, page1Url);

    assertThat(testServer1.getRequests()).isEqualTo(ImmutableList.of(
        new HttpRequest(page1Url, null),
        new HttpRequest(page3Url, page2Url)));

    assertThat(testServer2.getRequests()).isEqualTo(ImmutableList.of(new HttpRequest(
        page2Url,
        page1Url)));
  }

  /**
   * Tests navigation across multiple domains when the browser is configured to use a proxy that
   * redirects the second domain to another host.
   */
  @Test
  @Ignore(EDGE)
  @NeedsLocalEnvironment
  public void crossDomainHistoryNavigationWithAProxiedHost() {
    testServer1.start();
    testServer2.start();

    pacFileServer.setPacFileContents(Joiner.on('\n').join(
        "function FindProxyForURL(url, host) {",
        "  if (host.indexOf('example') != -1) {",
        "    return 'PROXY " + testServer2.getHostAndPort() + "';",
        "  }",
        "  return 'DIRECT';",
        " }"));
    pacFileServer.start();
    WebDriver driver = customDriverFactory.createDriver(pacFileServer.getBaseUrl());

    String page1Url = buildPage1Url(testServer1, "http://www.example.com" + buildPage2Url());
    String page2Url = buildPage2Url("http://www.example.com", buildPage3Url(testServer1));
    String page3Url = buildPage3Url(testServer1);

    performNavigation(driver, page1Url);

    assertThat(testServer1.getRequests()).isEqualTo(ImmutableList.of(
        new HttpRequest(page1Url, null),
        new HttpRequest(page3Url, page2Url)));

    assertThat(testServer2.getRequests()).isEqualTo(ImmutableList.of(
        new HttpRequest(page2Url, page1Url)));
  }

  /**
   * Tests navigation across multiple domains when the browser is configured to use a proxy that
   * intercepts requests to a specific host (www.example.com) - all other requests are permitted
   * to connect directly to the target server.
   */
  @Test
  @Ignore(EDGE)
  @NeedsLocalEnvironment
  public void crossDomainHistoryNavigationWhenProxyInterceptsHostRequests() {
    testServer1.start();
    proxyServer.start();
    proxyServer.setPacFileContents(Joiner.on('\n').join(
        "function FindProxyForURL(url, host) {",
        "  if (host.indexOf('example') != -1) {",
        "    return 'PROXY " + proxyServer.getHostAndPort() + "';",
        "  }",
        "  return 'DIRECT';",
        " }"));

    String page1Url = buildPage1Url(testServer1, "http://www.example.com" + buildPage2Url());
    String page2Url = buildPage2Url("http://www.example.com", buildPage3Url(testServer1));
    String page3Url = buildPage3Url(testServer1);

    WebDriver driver = customDriverFactory.createDriver(proxyServer.getPacUrl());
    performNavigation(driver, page1Url);

    assertThat(testServer1.getRequests()).isEqualTo(ImmutableList.of(
        new HttpRequest(page1Url, null),
        new HttpRequest(page3Url, page2Url)));

    assertThat(proxyServer.getRequests()).isEqualTo(ImmutableList.of(
        new HttpRequest(page2Url, page1Url)));
  }

  /**
   * Tests navigation on a single domain where the browser is configured to use a proxy that
   * intercepts requests for page 2.
   */
  @Test
  @Ignore(value = IE,
      reason = "IEDriver does not disable automatic proxy caching, causing this test to fail, issue 6629")
  @Ignore(MARIONETTE)
  @Ignore(value = FIREFOX, travis=true)
  @NeedsLocalEnvironment
  @Ignore(EDGE)
  @Ignore(value = CHROME, reason = "Flaky")
  public void navigationWhenProxyInterceptsASpecificUrl() {
    testServer1.start();
    proxyServer.start();

    String page1Url = buildPage1Url(testServer1, buildPage2Url(testServer1));
    String page2Url = buildPage2Url(testServer1, buildPage3Url(testServer1));
    String page3Url = buildPage3Url(testServer1);

    // Have our proxy intercept requests for page 2.
    proxyServer.setPacFileContents(Joiner.on('\n').join(
        "function FindProxyForURL(url, host) {",
        "  if (url.indexOf('/page2.html?next') != -1) {",
        "    return 'PROXY " + proxyServer.getHostAndPort() + "';",
        "  }",
        "  return 'DIRECT';",
        " }"));

    WebDriver driver = customDriverFactory.createDriver(proxyServer.getPacUrl());
    performNavigation(driver, page1Url);

    assertThat(testServer1.getRequests()).isEqualTo(ImmutableList.of(
        new HttpRequest(page1Url, null),
        new HttpRequest(page3Url, page2Url)));

    assertThat(proxyServer.getRequests()).isEqualTo(ImmutableList.of(new HttpRequest(
        page2Url,
        page1Url)));
  }

  private void performNavigation(WebDriver driver, String firstUrl) {
    WebDriverWait wait = new WebDriverWait(driver,  Duration.ofSeconds(5));

    driver.get(firstUrl);
    wait.until(titleIs("Page 1"));
    wait.until(presenceOfElementLocated(By.id("next"))).click();

    wait.until(titleIs("Page 2"));
    wait.until(presenceOfElementLocated(By.id("next"))).click();

    wait.until(titleIs("Page 3"));
    wait.until(presenceOfElementLocated(By.id("back"))).click();

    wait.until(titleIs("Page 2"));
    wait.until(presenceOfElementLocated(By.id("forward"))).click();

    wait.until(titleIs("Page 3"));
  }

  private static String buildPage1Url(ServerResource server, String nextUrl) {
    return server.getBaseUrl() + "/page1.html?next=" + encode(nextUrl);
  }

  private static String buildPage2Url(String server, String nextUrl) {
    return server + "/page2.html?next=" + encode(nextUrl);
  }

  private static String buildPage2Url(ServerResource server, String nextUrl) {
    return server.getBaseUrl() + "/page2.html?next=" + encode(nextUrl);
  }

  private static String buildPage2Url() {
    return "/page2.html";  // Nothing special here.
  }

  private static String buildPage2Url(ServerResource server) {
    return server.getBaseUrl() + "/page2.html";  // Nothing special here.
  }

  private static String buildPage3Url(ServerResource server) {
    return server.getBaseUrl() + "/page3.html";  // Nothing special here.
  }

  private static String encode(String url) {
    try {
      return URLEncoder.encode(url, UTF_8.name());
    } catch (UnsupportedEncodingException e) {
      throw new RuntimeException("UTF-8 should always be supported!", e);
    }
  }

  /**
   * Manages a custom WebDriver implementation as an {@link ExternalResource} rule.
   */
  private static class CustomDriverFactory extends ExternalResource {

    WebDriver driver;

    WebDriver createDriver(String pacUrl) {
      Proxy proxy = new Proxy();
      proxy.setProxyAutoconfigUrl(pacUrl);

      Capabilities caps = new ImmutableCapabilities(PROXY, proxy);

      return driver = new WebDriverBuilder().get(caps);
    }

    @Override
    protected void after() {
      if (driver != null) {
        driver.quit();
      }
    }
  }

  /**
   * An {@link ExternalResource} for a basic HTTP server; ensures the server is shutdown when a
   * test finishes.
   */
  private abstract static class ServerResource extends ExternalResource {
    protected final Server server;
    private final HostAndPort hostAndPort;

    ServerResource() {
      this.server = new Server();

      ServerConnector http = new ServerConnector(server);
      int port = PortProber.findFreePort();
      http.setPort(port);
      http.setIdleTimeout(500000);

      this.server.addConnector(http);

      this.hostAndPort = HostAndPort.fromParts(JettyAppServer.detectHostname(), port);
    }

    void addHandler(Handler handler) {
      this.server.setHandler(handler);
    }

    HostAndPort getHostAndPort() {
      return Preconditions.checkNotNull(hostAndPort);
    }

    String getBaseUrl() {
      return "http://" + getHostAndPort();
    }

    void start() {
      try {
        server.start();
        new UrlChecker().waitUntilAvailable(10, TimeUnit.SECONDS, new URL(getBaseUrl()));
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    }

    @Override
    protected void after() {
      try {
        server.stop();
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    }
  }

  private static class PacFileServerResource extends ServerResource {

    private String pacFileContents;

    PacFileServerResource() {
      addHandler(new AbstractHandler() {
        @Override
        public void handle(String s, Request baseRequest, HttpServletRequest request,
                           HttpServletResponse response) throws IOException {
          response.setContentType("application/x-javascript-config; charset=us-ascii");
          response.setStatus(HttpServletResponse.SC_OK);
          response.getWriter().println(getPacFileContents());
          baseRequest.setHandled(true);
        }
      });
    }

    String getPacFileContents() {
      return pacFileContents;
    }

    void setPacFileContents(String content) {
      pacFileContents = content;
    }
  }

  private static class TestServer extends ServerResource {

    private final List<HttpRequest> requests;

    TestServer() {
      requests = new CopyOnWriteArrayList<>();
      addHandler(new PageRequestHandler(requests));
    }

    List<HttpRequest> getRequests() {
      return requests;
    }
  }

  private static class ProxyServer extends ServerResource {

    private final List<HttpRequest> requests;
    private String pacFileContents;

    ProxyServer() {
      requests = new CopyOnWriteArrayList<>();
      addHandler(new PageRequestHandler(requests) {
        @Override
        public void handle(String s, Request baseRequest, HttpServletRequest request,
                           HttpServletResponse response) throws IOException, ServletException {
          if (request.getRequestURI().equals("/pac.js")) {
            response.setContentType("application/x-javascript-config; charset=us-ascii");
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().println(getPacFileContents());
            baseRequest.setHandled(true);
          } else {
            super.handle(s, baseRequest, request, response);
          }
        }
      });
    }

    String getPacUrl() {
      return getBaseUrl() + "/pac.js";
    }

    List<HttpRequest> getRequests() {
      return requests;
    }

    String getPacFileContents() {
      return pacFileContents;
    }

    void setPacFileContents(String content) {
      pacFileContents = content;
    }
  }

  private static class PageRequestHandler extends AbstractHandler {
    private final List<HttpRequest> requests;

    PageRequestHandler(List<HttpRequest> requests) {
      this.requests = requests;
    }

    @Override
    public void handle(String s, Request baseRequest, HttpServletRequest request,
                       HttpServletResponse response) throws IOException, ServletException {
      if (request.getRequestURI().endsWith("/favicon.ico")) {
        response.setStatus(204);
        baseRequest.setHandled(true);
        return;
      }

      // Don't record / requests so we can poll the server for availability in start().
      if (!"/".equals(request.getRequestURI())) {
        requests.add(new HttpRequest(
          request.getRequestURL() + (request.getQueryString() == null ? "" : "?" + request.getQueryString()),
          request.getHeader(HttpHeaders.REFERER)));
      }

      String responseHtml;
      if (request.getRequestURI().contains("/page1.html")) {
        responseHtml = page1;
      } else if (request.getRequestURI().contains("/page2.html")) {
        responseHtml = page2;
      } else {
        responseHtml = page3;
      }

      response.setContentType("text/html; charset=utf-8");
      response.setStatus(HttpServletResponse.SC_OK);
      response.getWriter().println(responseHtml);
      baseRequest.setHandled(true);
    }
  }

  /**
   * Records basic information about a HTTP request.
   */
  private static class HttpRequest {

    private final String uri;
    private final String referrer;

    HttpRequest(String uri, String referrer) {
      this.uri = uri;
      this.referrer = referrer;
    }

    @Override
    public int hashCode() {
      return Objects.hashCode(uri, referrer);
    }

    @Override
    public boolean equals(Object o) {
      if (o instanceof HttpRequest) {
        HttpRequest that = (HttpRequest) o;
        return Objects.equal(this.uri, that.uri)
            && Objects.equal(this.referrer, that.referrer);
      }
      return false;
    }

    @Override
    public String toString() {
      return String.format("[uri=%s, referrer=%s]", uri, referrer);
    }
  }
}
