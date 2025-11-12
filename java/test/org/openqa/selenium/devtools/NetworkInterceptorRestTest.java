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

package org.openqa.selenium.devtools;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assumptions.assumeThat;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.testing.Safely.safelyCall;
import static org.openqa.selenium.testing.TestUtilities.isFirefoxVersionOlderThan;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

class NetworkInterceptorRestTest extends JupiterTestBase {

  private NettyAppServer appServer;
  private WebDriver driver;
  private NetworkInterceptor interceptor;

  @BeforeAll
  public static void shouldTestBeRunAtAll() {
    // Until Firefox can initialise the Fetch domain, we need this check
    assumeThat(Browser.detect()).isNotEqualTo(Browser.FIREFOX);
    assumeThat(Boolean.getBoolean("selenium.skiptest")).isFalse();
  }

  @BeforeEach
  public void setup() {
    driver = new WebDriverBuilder().get(Objects.requireNonNull(Browser.detect()).getCapabilities());

    assumeThat(driver).isInstanceOf(HasDevTools.class);
    assumeThat(isFirefoxVersionOlderThan(87, driver)).isFalse();

    Route route =
        Route.matching(req -> req.getMethod() == HttpMethod.OPTIONS)
            .to(
                () ->
                    req ->
                        new HttpResponse()
                            .addHeader(
                                "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH")
                            .addHeader("Access-Control-Allow-Origin", "*")
                            .addHeader("Access-Control-Allow-Headers", "*"));

    appServer = new NettyAppServer(route);
    appServer.start();
  }

  @AfterEach
  public void tearDown() {
    safelyCall(() -> interceptor.close(), () -> driver.quit(), () -> appServer.stop());
  }

  private void assertRequest(HttpMethod method, boolean withBody) throws MalformedURLException {
    AtomicBoolean seen = new AtomicBoolean(false);
    interceptor =
        new NetworkInterceptor(
            driver,
            Route.matching(
                    req -> req.getMethod() == method || req.getMethod() == HttpMethod.OPTIONS)
                .to(
                    () ->
                        req -> {
                          if (req.getMethod() == HttpMethod.OPTIONS) {
                            return new HttpResponse()
                                .setStatus(200)
                                .addHeader("Access-Control-Allow-Origin", "*")
                                .addHeader(
                                    "Access-Control-Allow-Methods",
                                    "GET, POST, PUT, DELETE, PATCH");
                          }
                          seen.set(true);
                          return new HttpResponse()
                              .setStatus(200)
                              .addHeader("Access-Control-Allow-Origin", "*")
                              .setContent(utf8String("Received response for " + method));
                        }));

    JavascriptExecutor js = (JavascriptExecutor) driver;
    String script =
        "var url = arguments[0];"
            + "var callback = arguments[arguments.length - 1];"
            + "var xhr = new XMLHttpRequest();"
            + "xhr.open(arguments[1], url, true);"
            + "xhr.onload = function() {"
            + "  if (xhr.readyState == 4) {"
            + "    callback(xhr.responseText);"
            + "  }"
            + "};"
            + "xhr.onerror = function() {"
            + "  callback('ERROR: ' + xhr.statusText);"
            + "};"
            + (withBody ? "xhr.send('Hey');" : "xhr.send();");

    Object response =
        js.executeAsyncScript(
            script, new URL(appServer.whereIs("/")).toString(), method.toString());

    assertThat(seen.get()).isTrue();
    assertThat(response.toString()).contains("Received response for " + method);
  }

  @Test
  @NoDriverBeforeTest
  void shouldInterceptPatchRequest() throws MalformedURLException {
    assertRequest(HttpMethod.PATCH, true);
  }

  @Test
  @NoDriverBeforeTest
  void shouldInterceptPutRequest() throws MalformedURLException {
    assertRequest(HttpMethod.PUT, true);
  }

  @Test
  @NoDriverBeforeTest
  void shouldInterceptPostRequest() throws MalformedURLException {
    assertRequest(HttpMethod.POST, true);
  }

  @Test
  @NoDriverBeforeTest
  void shouldInterceptDeleteRequest() throws MalformedURLException {
    assertRequest(HttpMethod.DELETE, true);
  }

  @Test
  @NoDriverBeforeTest
  void shouldInterceptGetRequest() throws MalformedURLException {
    assertRequest(HttpMethod.GET, false);
  }
}
