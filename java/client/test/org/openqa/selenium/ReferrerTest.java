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

import static java.util.concurrent.Executors.newCachedThreadPool;
import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.remote.CapabilityType.PROXY;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Driver.SAFARI;
import static org.openqa.selenium.testing.InProject.locate;

import com.google.common.base.Charsets;
import com.google.common.base.Joiner;
import com.google.common.base.MoreObjects;
import com.google.common.base.Objects;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.common.io.Files;
import com.google.common.net.HostAndPort;
import com.google.common.net.HttpHeaders;

import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExternalResource;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;
import org.webbitserver.HttpControl;
import org.webbitserver.HttpHandler;
import org.webbitserver.HttpRequest;
import org.webbitserver.HttpResponse;
import org.webbitserver.WebServer;
import org.webbitserver.WebServers;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.List;
import java.util.concurrent.TimeUnit;

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
@Ignore(
    value = {PHANTOMJS, SAFARI},
    reason = "Opera/PhantomJS - not tested, " +
             "Safari - not implemented")
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
    page1 = Files.toString(locate("common/src/web/proxy/page1.html"), Charsets.UTF_8);
    page2 = Files.toString(locate("common/src/web/proxy/page2.html"), Charsets.UTF_8);
    page3 = Files.toString(locate("common/src/web/proxy/page3.html"), Charsets.UTF_8);
  }

  /**
   * Tests navigation when all of the files are hosted on the same domain and the browser
   * does not have a proxy configured.
   */
  @Test
  @NotYetImplemented(HTMLUNIT)
  @NeedsLocalEnvironment
  public void basicHistoryNavigationWithoutAProxy() {
    testServer1.start();

    String baseUrl = testServer1.getBaseUrl();
    String page1Url = buildPage1Url(testServer1.getBaseUrl() + buildPage2Url());
    String page2Url = buildPage2Url(testServer1.getBaseUrl() + buildPage3Url());
    String page3Url = buildPage3Url();

    performNavigation(driver, baseUrl + page1Url);

    assertEquals(
        ImmutableList.of(
            new Request(page1Url, null),
            new Request(page2Url, baseUrl + page1Url),
            new Request(page3Url, baseUrl + page2Url)),
        testServer1.getRequests());
  }

  /**
   * Tests navigation across multiple domains when the browser does not have a proxy configured.
   */
  @Test
  @NotYetImplemented(HTMLUNIT)
  @NeedsLocalEnvironment
  public void crossDomainHistoryNavigationWithoutAProxy() {

    testServer1.start();
    testServer2.start();

    String page1Url = buildPage1Url(testServer2.getBaseUrl() + buildPage2Url());
    String page2Url = buildPage2Url(testServer1.getBaseUrl() + buildPage3Url());
    String page3Url = buildPage3Url();

    performNavigation(driver, testServer1.getBaseUrl() + page1Url);

    assertEquals(
        ImmutableList.of(
            new Request(page1Url, null),
            new Request(page3Url, testServer2.getBaseUrl() + page2Url)),
        testServer1.getRequests());

    assertEquals(
        ImmutableList.of(new Request(
            page2Url,
            testServer1.getBaseUrl() + page1Url)),
        testServer2.getRequests());
  }

  /**
   * Tests navigation when all of the files are hosted on the same domain and the browser is
   * configured to use a proxy that permits direct access to that domain.
   */
  @Test
  @NotYetImplemented(HTMLUNIT)
  @NeedsLocalEnvironment
  public void basicHistoryNavigationWithADirectProxy() {
    testServer1.start();

    pacFileServer.setPacFileContents(
        "function FindProxyForURL(url, host) { return 'DIRECT'; }");
    pacFileServer.start();
    WebDriver driver = customDriverFactory.createDriver(pacFileServer.getBaseUrl());

    String baseUrl = testServer1.getBaseUrl();
    String page1Url = buildPage1Url(testServer1.getBaseUrl() + buildPage2Url());
    String page2Url = buildPage2Url(testServer1.getBaseUrl() + buildPage3Url());
    String page3Url = buildPage3Url();

    performNavigation(driver, baseUrl + page1Url);

    assertEquals(
        ImmutableList.of(
            new Request(page1Url, null),
            new Request(page2Url, baseUrl + page1Url),
            new Request(page3Url, baseUrl + page2Url)),
        testServer1.getRequests());
  }

  /**
   * Tests navigation across multiple domains when the browser is configured to use a proxy that
   * permits direct access to those domains.
   */
  @Test
  @NotYetImplemented(HTMLUNIT)
  @NeedsLocalEnvironment
  public void crossDomainHistoryNavigationWithADirectProxy() {
    testServer1.start();
    testServer2.start();

    pacFileServer.setPacFileContents(
        "function FindProxyForURL(url, host) { return 'DIRECT'; }");
    pacFileServer.start();
    WebDriver driver = customDriverFactory.createDriver(pacFileServer.getBaseUrl());

    String page1Url = buildPage1Url(testServer2.getBaseUrl() + buildPage2Url());
    String page2Url = buildPage2Url(testServer1.getBaseUrl() + buildPage3Url());
    String page3Url = buildPage3Url();

    performNavigation(driver, testServer1.getBaseUrl() + page1Url);

    assertEquals(
        ImmutableList.of(
            new Request(page1Url, null),
            new Request(page3Url, testServer2.getBaseUrl() + page2Url)),
        testServer1.getRequests());

    assertEquals(
        ImmutableList.of(new Request(
            page2Url,
            testServer1.getBaseUrl() + page1Url)),
        testServer2.getRequests());
  }

  /**
   * Tests navigation across multiple domains when the browser is configured to use a proxy that
   * redirects the second domain to another host.
   */
  @Ignore(MARIONETTE)
  @NotYetImplemented(HTMLUNIT)
  @Test
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

    String page1Url = buildPage1Url("http://www.example.com" + buildPage2Url());
    String page2Url = buildPage2Url(testServer1.getBaseUrl() + buildPage3Url());
    String page3Url = buildPage3Url();

    performNavigation(driver, testServer1.getBaseUrl() + page1Url);

    assertEquals(
        ImmutableList.of(
            new Request(page1Url, null),
            new Request(page3Url, "http://www.example.com" + page2Url)),
        testServer1.getRequests());

    assertEquals(
        ImmutableList.of(new Request(
            "http://www.example.com" + page2Url,
            testServer1.getBaseUrl() + page1Url)),
        testServer2.getRequests());
  }

  /**
   * Tests navigation across multiple domains when the browser is configured to use a proxy that
   * intercepts requests to a specific host (www.example.com) - all other requests are permitted
   * to connect directly to the target server.
   */
  @Ignore(MARIONETTE)
  @NotYetImplemented(HTMLUNIT)
  @Test
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

    String page1Url = buildPage1Url("http://www.example.com" + buildPage2Url());
    String page2Url = buildPage2Url(testServer1.getBaseUrl() + buildPage3Url());
    String page3Url = buildPage3Url();

    WebDriver driver = customDriverFactory.createDriver(proxyServer.getPacUrl());
    performNavigation(driver, testServer1.getBaseUrl() + page1Url);

    assertEquals(
        ImmutableList.of(
            new Request(page1Url, null),
            new Request(page3Url, "http://www.example.com" + page2Url)),
        testServer1.getRequests());

    assertEquals(
        ImmutableList.of(new Request(
            "http://www.example.com" + page2Url,
            testServer1.getBaseUrl() + page1Url)),
        proxyServer.getRequests());
  }

  /**
   * Tests navigation on a single domain where the browser is configured to use a proxy that
   * intercepts requests for page 2.
   */
  @Ignore(
      value = {IE, MARIONETTE},
      reason = "IEDriver does not disable automatic proxy caching, causing this test to fail.",
      issues = 6629)
  @NotYetImplemented(HTMLUNIT)
  @Test
  @NeedsLocalEnvironment
  public void navigationWhenProxyInterceptsASpecificUrl() {
    testServer1.start();
    proxyServer.start();

    String page1Url = buildPage1Url(testServer1.getBaseUrl() + buildPage2Url());
    String page2Url = buildPage2Url(testServer1.getBaseUrl() + buildPage3Url());
    String page3Url = buildPage3Url();

    // Have our proxy intercept requests for page 2.
    proxyServer.setPacFileContents(Joiner.on('\n').join(
        "function FindProxyForURL(url, host) {",
        "  if (url.indexOf('/page2.html?next') != -1) {",
        "    return 'PROXY " + proxyServer.getHostAndPort() + "';",
        "  }",
        "  return 'DIRECT';",
        " }"));

    WebDriver driver = customDriverFactory.createDriver(proxyServer.getPacUrl());
    performNavigation(driver, testServer1.getBaseUrl() + page1Url);

    assertEquals(
        ImmutableList.of(
            new Request(page1Url, null),
            new Request(page3Url, testServer1.getBaseUrl() + page2Url)),
        testServer1.getRequests());

    assertEquals(
        ImmutableList.of(new Request(
            testServer1.getBaseUrl() + page2Url,
            testServer1.getBaseUrl() + page1Url)),
        proxyServer.getRequests());
  }

  private void performNavigation(WebDriver driver, String firstUrl) {
    WebDriverWait wait = new WebDriverWait(driver, 5);

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

  private static String buildPage1Url(String nextUrl) {
    return "/page1.html?next=" + encode(nextUrl);
  }

  private static String buildPage2Url(String nextUrl) {
    return "/page2.html?next=" + encode(nextUrl);
  }

  private static String buildPage2Url() {
    return "/page2.html";  // Nothing special here.
  }

  private static String buildPage3Url() {
    return "/page3.html";  // Nothing special here.
  }

  private static String encode(String url) {
    try {
      return URLEncoder.encode(url, Charsets.UTF_8.name());
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

      DesiredCapabilities caps = new DesiredCapabilities();
      caps.setCapability(PROXY, proxy);

      return driver = new WebDriverBuilder().setDesiredCapabilities(caps).get();
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
    protected final WebServer server;

    ServerResource() {
      int port = PortProber.findFreePort();
      this.server = WebServers.createWebServer(newCachedThreadPool(), port);
    }

    void addHandler(HttpHandler handler) {
      this.server.add(handler);
    }

    HostAndPort getHostAndPort() {
      String host = MoreObjects.firstNonNull(System.getenv("HOSTNAME"), "localhost");
      return HostAndPort.fromParts(host, server.getPort());
    }

    String getBaseUrl() {
      return "http://" + getHostAndPort();
    }

    void start() {
      try {
        server.start();
        new UrlChecker().waitUntilAvailable(10, TimeUnit.SECONDS, new URL(getBaseUrl()));
      } catch (UrlChecker.TimeoutException e) {
        throw new RuntimeException(e);
      } catch (MalformedURLException  e) {
        throw new RuntimeException(e);
      }
    }

    @Override
    protected void after() {
      server.stop();
    }
  }

  private static class PacFileServerResource extends ServerResource {

    private String pacFileContents;

    PacFileServerResource() {
      addHandler(new HttpHandler() {
        @Override
        public void handleHttpRequest(
            HttpRequest request, HttpResponse response, HttpControl control) {
          response.charset(Charsets.US_ASCII)
              .header(HttpHeaders.CONTENT_TYPE, "application/x-javascript-config")
              .content(getPacFileContents())
              .end();
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

    private final List<Request> requests;

    TestServer() {
      requests = Lists.newCopyOnWriteArrayList();
      addHandler(new PageRequestHandler(requests));
    }

    List<Request> getRequests() {
      return requests;
    }
  }

  private static class ProxyServer extends ServerResource {

    private final List<Request> requests;
    private String pacFileContents;

    ProxyServer() {
      requests = Lists.newCopyOnWriteArrayList();
      addHandler(new HttpHandler() {
        @Override
        public void handleHttpRequest(
            HttpRequest request, HttpResponse response, HttpControl control) {
          if (request.uri().equals("/pac.js")) {
            response.charset(Charsets.US_ASCII)
                .header(HttpHeaders.CONTENT_TYPE, "application/x-javascript-config")
                .content(getPacFileContents())
                .end();
          } else {
            control.nextHandler();  // Pass on to PageRequestHandler.
          }
        }
      });
      addHandler(new PageRequestHandler(requests));
    }

    String getPacUrl() {
      return getBaseUrl() + "/pac.js";
    }

    List<Request> getRequests() {
      return requests;
    }

    String getPacFileContents() {
      return pacFileContents;
    }

    void setPacFileContents(String content) {
      pacFileContents = content;
    }
  }

  private static class PageRequestHandler implements HttpHandler {
    private final List<Request> requests;

    PageRequestHandler(List<Request> requests) {
      this.requests = requests;
    }

    @Override
    public void handleHttpRequest(
        HttpRequest request, HttpResponse response, HttpControl control) {
      if (request.uri().endsWith("/favicon.ico")) {
        response.status(204).end();
        return;
      }

      // Don't record / requests so we can poll the server for availability in start().
      if (!"/".equals(request.uri())) {
        requests.add(new Request(request.uri(), request.header(HttpHeaders.REFERER)));
      }

      String responseHtml;
      if (request.uri().contains("/page1.html")) {
        responseHtml = page1;
      } else if (request.uri().contains("/page2.html")) {
        responseHtml = page2;
      } else {
        responseHtml = page3;
      }

      response.charset(Charsets.UTF_8)
          .header(HttpHeaders.CONTENT_TYPE, "text/html; charset=UTF-8")
          .content(responseHtml)
          .end();
    }
  }

  /**
   * Records basic information about a HTTP request.
   */
  private static class Request {

    private final String uri;
    private final String referrer;

    Request(String uri, String referrer) {
      this.uri = uri;
      this.referrer = referrer;
    }

    @Override
    public int hashCode() {
      return Objects.hashCode(uri, referrer);
    }

    @Override
    public boolean equals(Object o) {
      if (o instanceof Request) {
        Request that = (Request) o;
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
