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

import com.google.common.net.HostAndPort;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.SeleniumExtension;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.time.Duration;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

import static com.google.common.net.HttpHeaders.REFERER;
import static java.nio.charset.StandardCharsets.US_ASCII;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.build.InProject.locate;
import static org.openqa.selenium.remote.CapabilityType.PROXY;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.Safely.safelyCall;

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
public class ReferrerTest {

  @RegisterExtension
  static SeleniumExtension seleniumExtension = new SeleniumExtension();

  private static final String PAGE_1 = "/page1.html";
  private static final String PAGE_2 = "/page2.html";
  private static final String PAGE_3 = "/page3.html";
  private static String page1;
  private static String page2;
  private static String page3;
  private TestServer server1;
  private TestServer server2;
  private ProxyServer proxyServer;

  @BeforeAll
  public static void readContents() throws IOException {
    page1 = new String(Files.readAllBytes(locate("common/src/web/proxy" + PAGE_1)));
    page2 = new String(Files.readAllBytes(locate("common/src/web/proxy" + PAGE_2)));
    page3 = new String(Files.readAllBytes(locate("common/src/web/proxy/page3.html")));
  }

  @BeforeEach
  public void startServers() {
    server1 = new TestServer();
    server2 = new TestServer();
    proxyServer = new ProxyServer();
  }

  @AfterEach
  public void stopServers() {
    safelyCall(() -> proxyServer.stop());
    safelyCall(() -> server1.stop());
    safelyCall(() -> server2.stop());
  }

  private WebDriver createDriver(String pacUrl) {
    Proxy proxy = new Proxy();
    proxy.setProxyAutoconfigUrl(pacUrl);

    Capabilities caps = new ImmutableCapabilities(PROXY, proxy);

    return seleniumExtension.createNewDriver(caps);
  }

  /**
   * Tests navigation when all of the files are hosted on the same domain and the browser
   * does not have a proxy configured.
   */
  @Test
  public void basicHistoryNavigationWithoutAProxy() {
    String page1Url = server1.whereIs(PAGE_1 + "?next=" + encode(server1.whereIs(PAGE_2)));
    String page2Url = server1.whereIs(PAGE_2 + "?next=" + encode(server1.whereIs(PAGE_3)));

    performNavigation(seleniumExtension.getDriver(), page1Url);

    assertThat(server1.getRequests()).containsExactly(
      new ExpectedRequest(PAGE_1, null),
      new ExpectedRequest(PAGE_2, page1Url),
      new ExpectedRequest(PAGE_3, page2Url));
  }

  /**
   * Tests navigation when all of the files are hosted on the same domain and the browser is
   * configured to use a proxy that permits direct access to that domain.
   */
  @Test
  public void basicHistoryNavigationWithADirectProxy() {
    proxyServer.setPacFileContents("function FindProxyForURL(url, host) { return 'DIRECT'; }");
    WebDriver driver = createDriver(proxyServer.whereIs("/pac.js"));

    String page1Url = server1.whereIs(PAGE_1) + "?next=" + encode(server1.whereIs(PAGE_2));
    String page2Url = server1.whereIs(PAGE_2) + "?next=" + encode(server1.whereIs(PAGE_3));

    performNavigation(driver, page1Url);

    assertThat(server1.getRequests())
      .containsExactly(
        new ExpectedRequest(PAGE_1, null),
        new ExpectedRequest(PAGE_2, page1Url),
        new ExpectedRequest(PAGE_3, page2Url));
  }

  private static String encode(String url) {
    try {
      return URLEncoder.encode(url, UTF_8.name());
    } catch (UnsupportedEncodingException e) {
      throw new RuntimeException("UTF-8 should always be supported!", e);
    }
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

  private static class ExpectedRequest {
    private final String uri;
    private final String referer;

    public ExpectedRequest(HttpRequest request) {
      this(request.getUri(), request.getHeader(REFERER));
    }

    public ExpectedRequest(String uri, String referer) {
      this.uri = uri;
      this.referer = referer;
    }

    @Override
    public String toString() {
      return "ExpectedRequest{" +
        "uri='" + uri + '\'' +
        ", referer='" + referer + '\'' +
        '}';
    }

    @Override
    public boolean equals(Object o) {
      if (!(o instanceof ExpectedRequest)) {
        return false;
      }
      ExpectedRequest that = (ExpectedRequest) o;
      return this.uri.equals(that.uri) &&
        Objects.equals(this.referer, that.referer);
    }

    @Override
    public int hashCode() {
      return Objects.hash(uri, referer);
    }
  }

  private static class RecordingHandler implements HttpHandler {

    private final List<ExpectedRequest> requests = new CopyOnWriteArrayList<>();

    @Override
    public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
      if (req.getUri().endsWith("/favicon.ico")) {
        return new HttpResponse().setStatus(204);
      }

      // Don't record / requests so we can poll the server for availability in start().
      if (!"/".equals(req.getUri())) {
        requests.add(new ExpectedRequest(req));
      }

      String responseHtml;
      if (req.getUri().contains(PAGE_1)) {
        responseHtml = page1;
      } else if (req.getUri().contains(PAGE_2)) {
        responseHtml = page2;
      } else {
        responseHtml = page3;
      }

      return new HttpResponse()
        .setHeader("Content-Type", "text/html; charset=utf-8")
        .setContent(Contents.utf8String(responseHtml));
    }

    public List<ExpectedRequest> getRequests() {
      return requests.stream().collect(Collectors.toList());
    }
  }

  private static class TestServer {
    private final AppServer server;
    private final RecordingHandler handler = new RecordingHandler();

    public TestServer() {
      server = new NettyAppServer(handler);
      server.start();
    }

    public String whereIs(String relativeUrl) {
      return server.whereIs(relativeUrl);
    }

    public void stop() {
      server.stop();
    }

    public List<ExpectedRequest> getRequests() {
      return handler.getRequests();
    }

    public HostAndPort getHostAndPort() {
      URI uri = URI.create(server.whereIs("/"));
      return HostAndPort.fromParts(uri.getHost(), uri.getPort());
    }
  }

  private static class ProxyServer {
    private final AppServer server;
    private final RecordingHandler handler = new RecordingHandler();
    private String pacFileContents;

    public ProxyServer() {
      server = new NettyAppServer(
        req -> {
          if (pacFileContents != null && req.getUri().endsWith("/pac.js")) {
            return new HttpResponse()
              .setHeader("Content-Type", "application/x-javascript-config; charset=us-ascii")
              .setContent(Contents.bytes(pacFileContents.getBytes(US_ASCII)));
          }
          return handler.execute(req);
        }
      );
      server.start();
    }

    public void setPacFileContents(String pacFileContents) {
      this.pacFileContents = pacFileContents;
    }

    public String whereIs(String relativeUrl) {
      return server.whereIs(relativeUrl);
    }

    public List<ExpectedRequest> getRequests() {
      return handler.getRequests();
    }

    public void stop() {
      server.stop();
    }

    public HostAndPort getHostAndPort() {
      URI uri = URI.create(server.whereIs("/"));
      return HostAndPort.fromParts(uri.getHost(), uri.getPort());
    }
  }
}
