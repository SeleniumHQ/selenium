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

import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.openqa.selenium.remote.http.Contents.utf8String;

import java.net.URI;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.function.Predicate;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.module.Network;
import org.openqa.selenium.bidi.network.Header;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.drivers.Browser;

class WebNetworkTest extends JupiterTestBase {

  private String page;
  private AppServer server;

  @BeforeEach
  public void setUp() {
    server = new NettyAppServer();
    server.start();
  }

  @AfterEach
  public void cleanUp() {
    driver.quit();
  }

  @Test
  @Ignore(Browser.CHROME)
  @Ignore(Browser.EDGE)
  void canAddAuthenticationHandler() {
    ((RemoteWebDriver) driver)
        .network()
        .addAuthenticationHandler(new UsernameAndPassword("test", "test"));

    page = server.whereIs("basicAuth");
    driver.get(page);

    assertThat(driver.findElement(By.tagName("h1")).getText()).isEqualTo("authorized");
  }

  @Test
  @Ignore(Browser.CHROME)
  @Ignore(Browser.EDGE)
  void canAddAuthenticationHandlerWithFilter() {
    Predicate<URI> filter = uri -> uri.getPath().contains("basicAuth");

    ((RemoteWebDriver) driver)
        .network()
        .addAuthenticationHandler(filter, new UsernameAndPassword("test", "test"));

    page = server.whereIs("basicAuth");
    driver.get(page);

    assertThat(driver.findElement(By.tagName("h1")).getText()).isEqualTo("authorized");
  }

  @Test
  @Ignore(Browser.CHROME)
  @Ignore(Browser.EDGE)
  void canAddMultipleAuthenticationHandlersWithFilter() {
    ((RemoteWebDriver) driver)
        .network()
        .addAuthenticationHandler(
            uri -> uri.getPath().contains("basicAuth"), new UsernameAndPassword("test", "test"));

    ((RemoteWebDriver) driver)
        .network()
        .addAuthenticationHandler(
            uri -> uri.getPath().contains("test"), new UsernameAndPassword("test1", "test1"));

    page = server.whereIs("basicAuth");
    driver.get(page);

    assertThat(driver.findElement(By.tagName("h1")).getText()).isEqualTo("authorized");
  }

  @Test
  @Ignore(Browser.CHROME)
  @Ignore(Browser.EDGE)
  void canAddMultipleAuthenticationHandlersWithTheSameFilter() {
    ((RemoteWebDriver) driver)
        .network()
        .addAuthenticationHandler(
            uri -> uri.getPath().contains("basicAuth"), new UsernameAndPassword("test", "test"));

    ((RemoteWebDriver) driver)
        .network()
        .addAuthenticationHandler(
            uri -> uri.getPath().contains("basicAuth"), new UsernameAndPassword("test", "test"));

    page = server.whereIs("basicAuth");
    driver.get(page);

    assertThat(driver.findElement(By.tagName("h1")).getText()).isEqualTo("authorized");
  }

  @Test
  @Ignore(Browser.CHROME)
  @Ignore(Browser.EDGE)
  void canRemoveAuthenticationHandler() {
    long id =
        ((RemoteWebDriver) driver)
            .network()
            .addAuthenticationHandler(new UsernameAndPassword("test", "test"));

    ((RemoteWebDriver) driver).network().removeAuthenticationHandler(id);
    page = server.whereIs("basicAuth");
    driver.get(page);

    assertThatExceptionOfType(UnhandledAlertException.class)
        .isThrownBy(() -> driver.findElement(By.tagName("h1")));
  }

  @Test
  @Ignore(Browser.CHROME)
  @Ignore(Browser.EDGE)
  void canRemoveAuthenticationHandlerThatDoesNotExist() {
    ((RemoteWebDriver) driver).network().removeAuthenticationHandler(5);
    page = server.whereIs("basicAuth");
    driver.get(page);

    assertThatExceptionOfType(UnhandledAlertException.class)
        .isThrownBy(() -> driver.findElement(By.tagName("h1")));
  }

  @Test
  @Ignore(Browser.CHROME)
  @Ignore(Browser.EDGE)
  void canClearAuthenticationHandlers() {
    ((RemoteWebDriver) driver)
        .network()
        .addAuthenticationHandler(
            uri -> uri.getPath().contains("basicAuth"), new UsernameAndPassword("test", "test"));

    ((RemoteWebDriver) driver)
        .network()
        .addAuthenticationHandler(new UsernameAndPassword("test", "test"));

    ((RemoteWebDriver) driver)
        .network()
        .addAuthenticationHandler(new UsernameAndPassword("test1", "test1"));

    ((RemoteWebDriver) driver).network().clearAuthenticationHandlers();
    page = server.whereIs("basicAuth");
    driver.get(page);

    assertThatExceptionOfType(UnhandledAlertException.class)
        .isThrownBy(() -> driver.findElement(By.tagName("h1")));
  }

  @Test
  @Ignore(Browser.CHROME)
  @Ignore(Browser.EDGE)
  void canAddRequestHandler() {
    Predicate<URI> filter = uri -> uri.getPath().contains("logEntry");

    page = server.whereIs("/bidi/logEntryAdded.html");

    ((RemoteWebDriver) driver).network().addRequestHandler(filter, httpRequest -> httpRequest);

    driver.get(page);

    assertThat(driver.findElement(By.tagName("h1")).getText()).isEqualTo("Long entry added events");
  }

  @Test
  @Ignore(Browser.CHROME)
  @Ignore(Browser.EDGE)
  void canAddRequestHandlerToModifyMethod() {
    Predicate<URI> filter = uri -> uri.getPath().contains("logEntry");

    page = server.whereIs("/bidi/logEntryAdded.html");

    ((RemoteWebDriver) driver)
        .network()
        .addRequestHandler(filter, httpRequest -> new HttpRequest(HttpMethod.HEAD, page));

    driver.get(page);

    assertThatThrownBy(() -> driver.findElement(By.tagName("h1")))
        .isInstanceOf(NoSuchElementException.class);
  }

  @Test
  @Ignore(Browser.CHROME)
  @Ignore(Browser.EDGE)
  void canAddRequestHandlerToModifyHeaders() throws InterruptedException {
    Route route =
        Route.matching(req -> req.getUri().contains("network"))
            .to(
                () ->
                    req -> {
                      HttpResponse response = new HttpResponse();

                      req.getHeaderNames()
                          .forEach(
                              header -> {
                                String value = req.getHeader(header);
                                response.addHeader(header, value);
                              });
                      return response.setContent(utf8String("Received response for network"));
                    });

    server = new NettyAppServer(route);
    server.start();

    Predicate<URI> filter = uri -> uri.getPath().contains("network");

    CountDownLatch latch = new CountDownLatch(1);

    page = server.whereIs("network.html");

    ((RemoteWebDriver) driver)
        .network()
        .addRequestHandler(
            filter,
            httpRequest ->
                new HttpRequest(HttpMethod.HEAD, page).addHeader("test", "network-intercept"));

    Network network = new Network(driver);
    network.onResponseCompleted(
        responseDetails -> {
          List<Header> headers = responseDetails.getResponseData().getHeaders();
          headers.forEach(
              header -> {
                if (header.getName().equals("test")) {
                  assertThat(header.getValue().getValue()).isEqualTo("network-intercept");
                  latch.countDown();
                }
              });
        });

    driver.get(page);

    latch.await(5, TimeUnit.SECONDS);

    assertThat(latch.getCount()).isEqualTo(0);
  }

  @Test
  @Ignore(Browser.CHROME)
  @Ignore(Browser.EDGE)
  void canAddRequestHandlerToModifyBody() throws InterruptedException {
    Route route =
        Route.matching(req -> req.getUri().contains("network"))
            .to(
                () ->
                    req -> {
                      HttpResponse response = new HttpResponse();
                      return response.setContent(req.getContent());
                    });

    server = new NettyAppServer(route);
    server.start();

    Predicate<URI> filter = uri -> uri.getPath().contains("network");

    page = server.whereIs("network.html");

    ((RemoteWebDriver) driver)
        .network()
        .addRequestHandler(
            filter,
            httpRequest ->
                new HttpRequest(HttpMethod.POST, page)
                    .setContent(utf8String("Received response for the request")));

    driver.get(page);

    assertThat(driver.getPageSource().contains("Received response for the request")).isTrue();
  }

  @Test
  @Ignore(Browser.CHROME)
  @Ignore(Browser.EDGE)
  void canAddMultipleRequestHandlers() {
    page = server.whereIs("/bidi/logEntryAdded.html");

    ((RemoteWebDriver) driver)
        .network()
        .addRequestHandler(uri -> uri.getPath().contains("logEntry"), httpRequest -> httpRequest);

    ((RemoteWebDriver) driver)
        .network()
        .addRequestHandler(
            uri -> uri.getPath().contains("hello"),
            httpRequest -> new HttpRequest(HttpMethod.HEAD, page));

    driver.get(page);

    assertThat(driver.findElement(By.tagName("h1")).getText()).isEqualTo("Long entry added events");
  }

  @Test
  @Ignore(Browser.CHROME)
  @Ignore(Browser.EDGE)
  void canAddMultipleRequestHandlersWithTheSameFilter() {
    ((RemoteWebDriver) driver)
        .network()
        .addRequestHandler(uri -> uri.getPath().contains("logEntry"), httpRequest -> httpRequest);

    ((RemoteWebDriver) driver)
        .network()
        .addRequestHandler(uri -> uri.getPath().contains("logEntry"), httpRequest -> httpRequest);

    page = server.whereIs("/bidi/logEntryAdded.html");

    driver.get(page);

    assertThat(driver.findElement(By.tagName("h1")).getText()).isEqualTo("Long entry added events");
  }

  @Test
  @Ignore(Browser.CHROME)
  @Ignore(Browser.EDGE)
  void canRemoveRequestHandler() throws InterruptedException {
    Route route =
        Route.matching(req -> req.getUri().contains("network"))
            .to(
                () ->
                    req -> {
                      HttpResponse response = new HttpResponse();

                      req.getHeaderNames()
                          .forEach(
                              header -> {
                                String value = req.getHeader(header);
                                response.addHeader(header, value);
                              });
                      return response.setContent(utf8String("Received response for network"));
                    });

    server = new NettyAppServer(route);
    server.start();

    Predicate<URI> filter = uri -> uri.getPath().contains("network");

    CountDownLatch latch = new CountDownLatch(1);

    page = server.whereIs("network.html");

    long id =
        ((RemoteWebDriver) driver)
            .network()
            .addRequestHandler(
                filter,
                httpRequest ->
                    new HttpRequest(HttpMethod.HEAD, page).addHeader("test", "network-intercept"));

    ((RemoteWebDriver) driver).network().removeRequestHandler(id);

    Network network = new Network(driver);
    network.onResponseCompleted(
        responseDetails -> {
          List<Header> headers = responseDetails.getResponseData().getHeaders();
          headers.forEach(
              header -> {
                if (header.getName().equals("test")) {
                  assertThat(header.getValue().getValue()).isEqualTo("network-intercept");
                  latch.countDown();
                }
              });
        });

    driver.get(page);

    latch.await(5, TimeUnit.SECONDS);

    assertThat(latch.getCount()).isEqualTo(1);
  }

  @Test
  @Ignore(Browser.CHROME)
  @Ignore(Browser.EDGE)
  void canRemoveRequestHandlerThatDoesNotExist() {
    ((RemoteWebDriver) driver).network().removeAuthenticationHandler(5);
    page = server.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);

    assertThat(driver.findElement(By.tagName("h1")).getText()).isEqualTo("Long entry added events");
  }

  @Test
  @Ignore(Browser.CHROME)
  @Ignore(Browser.EDGE)
  void canClearRequestHandlers() {
    page = server.whereIs("/bidi/logEntryAdded.html");

    ((RemoteWebDriver) driver)
        .network()
        .addRequestHandler(
            uri -> uri.getPath().contains("logEntryAdded"),
            httpRequest -> new HttpRequest(HttpMethod.DELETE, page));

    ((RemoteWebDriver) driver)
        .network()
        .addRequestHandler(
            uri -> uri.getPath().contains("hello"),
            httpRequest -> new HttpRequest(HttpMethod.HEAD, page));

    ((RemoteWebDriver) driver).network().clearRequestHandlers();

    driver.get(page);

    assertThat(driver.findElement(By.tagName("h1")).getText()).isEqualTo("Long entry added events");
  }
}
