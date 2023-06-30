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
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
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
    driver = new WebDriverBuilder().get();

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
                            .addHeader("Access-Control-Allow-Origin", "*"));

    appServer = new NettyAppServer(route);
    appServer.start();
  }

  @AfterEach
  public void tearDown() {
    safelyCall(() -> interceptor.close(), () -> driver.quit(), () -> appServer.stop());
  }

  @Test
  @Ignore(gitHubActions = true, reason = "Fails in GH Actions but passes locally. Needs debugging.")
  void shouldInterceptPatchRequest() throws MalformedURLException {
    AtomicBoolean seen = new AtomicBoolean(false);
    interceptor =
        new NetworkInterceptor(
            driver,
            Route.matching(req -> (req.getMethod() == HttpMethod.PATCH))
                .to(
                    () ->
                        req -> {
                          seen.set(true);
                          return new HttpResponse()
                              .setStatus(200)
                              .addHeader("Access-Control-Allow-Origin", "*")
                              .setContent(utf8String("Received response for PATCH"));
                        }));

    JavascriptExecutor js = (JavascriptExecutor) driver;
    Object response =
        js.executeAsyncScript(
            "var url = arguments[0];"
                + "var callback = arguments[arguments.length - 1];"
                + "var xhr = new XMLHttpRequest();"
                + "xhr.open('PATCH', url, true);"
                + "xhr.onload = function() {"
                + "  if (xhr.readyState == 4) {"
                + "    callback(xhr.responseText);"
                + "  }"
                + "};"
                + "xhr.send('Hey');",
            new URL(appServer.whereIs("/")).toString());

    assertThat(seen.get()).isTrue();
    assertThat(response.toString()).contains("Received response for PATCH");
  }

  @Test
  @Ignore(gitHubActions = true, reason = "Fails in GH Actions but passes locally. Needs debugging.")
  void shouldInterceptPutRequest() throws MalformedURLException {
    AtomicBoolean seen = new AtomicBoolean(false);
    interceptor =
        new NetworkInterceptor(
            driver,
            Route.matching(req -> (req.getMethod() == HttpMethod.PUT))
                .to(
                    () ->
                        req -> {
                          seen.set(true);
                          return new HttpResponse()
                              .setStatus(200)
                              .addHeader("Access-Control-Allow-Origin", "*")
                              .setContent(utf8String("Received response for PUT"));
                        }));

    JavascriptExecutor js = (JavascriptExecutor) driver;
    Object response =
        js.executeAsyncScript(
            "var url = arguments[0];"
                + "var callback = arguments[arguments.length - 1];"
                + "var xhr = new XMLHttpRequest();"
                + "xhr.open('PUT', url, true);"
                + "xhr.onload = function() {"
                + "  if (xhr.readyState == 4) {"
                + "    callback(xhr.responseText);"
                + "  }"
                + "};"
                + "xhr.send('Hey');",
            new URL(appServer.whereIs("/")).toString());

    assertThat(seen.get()).isTrue();
    assertThat(response.toString()).contains("Received response for PUT");
  }

  @Test
  void shouldInterceptPostRequest() throws MalformedURLException {
    AtomicBoolean seen = new AtomicBoolean(false);
    interceptor =
        new NetworkInterceptor(
            driver,
            Route.matching(req -> (req.getMethod() == HttpMethod.POST))
                .to(
                    () ->
                        req -> {
                          seen.set(true);
                          return new HttpResponse()
                              .setStatus(200)
                              .addHeader("Access-Control-Allow-Origin", "*")
                              .setContent(utf8String("Received response for POST"));
                        }));

    JavascriptExecutor js = (JavascriptExecutor) driver;
    Object response =
        js.executeAsyncScript(
            "var url = arguments[0];"
                + "var callback = arguments[arguments.length - 1];"
                + "var xhr = new XMLHttpRequest();"
                + "xhr.open('POST', url, true);"
                + "xhr.onload = function() {"
                + "  if (xhr.readyState == 4) {"
                + "    callback(xhr.responseText);"
                + "  }"
                + "};"
                + "xhr.send('Hey');",
            new URL(appServer.whereIs("/")).toString());

    assertThat(seen.get()).isTrue();
    assertThat(response.toString()).contains("Received response for POST");
  }

  @Test
  @Ignore(gitHubActions = true, reason = "Fails in GH Actions but passes locally.")
  void shouldInterceptDeleteRequest() throws MalformedURLException {
    AtomicBoolean seen = new AtomicBoolean(false);
    interceptor =
        new NetworkInterceptor(
            driver,
            Route.matching(req -> (req.getMethod() == HttpMethod.DELETE))
                .to(
                    () ->
                        req -> {
                          seen.set(true);
                          return new HttpResponse()
                              .setStatus(200)
                              .addHeader("Access-Control-Allow-Origin", "*")
                              .setContent(utf8String("Received response for DELETE"));
                        }));

    JavascriptExecutor js = (JavascriptExecutor) driver;
    Object response =
        js.executeAsyncScript(
            "var url = arguments[0];"
                + "var callback = arguments[arguments.length - 1];"
                + "var xhr = new XMLHttpRequest();"
                + "xhr.open('DELETE', url, true);"
                + "xhr.onload = function() {"
                + "  if (xhr.readyState == 4) {"
                + "    callback(xhr.responseText);"
                + "  }"
                + "};"
                + "xhr.send('Hey');",
            new URL(appServer.whereIs("/")).toString());

    assertThat(seen.get()).isTrue();
    assertThat(response.toString()).contains("Received response for DELETE");
  }

  @Test
  @Ignore(gitHubActions = true, reason = "Fails in GH Actions but passes locally.")
  void shouldInterceptGetRequest() throws MalformedURLException {
    AtomicBoolean seen = new AtomicBoolean(false);
    interceptor =
        new NetworkInterceptor(
            driver,
            Route.matching(req -> (req.getMethod() == HttpMethod.GET))
                .to(
                    () ->
                        req -> {
                          seen.set(true);
                          return new HttpResponse()
                              .setStatus(200)
                              .addHeader("Access-Control-Allow-Origin", "*")
                              .setContent(utf8String("Received response for GET"));
                        }));

    JavascriptExecutor js = (JavascriptExecutor) driver;
    Object response =
        js.executeAsyncScript(
            "var url = arguments[0];"
                + "var callback = arguments[arguments.length - 1];"
                + "var xhr = new XMLHttpRequest();"
                + "xhr.open('GET', url, true);"
                + "xhr.onload = function() {"
                + "  if (xhr.readyState == 4) {"
                + "    callback(xhr.responseText);"
                + "  }"
                + "};"
                + "xhr.send();",
            new URL(appServer.whereIs("/")).toString());

    assertThat(seen.get()).isTrue();
    assertThat(response.toString()).contains("Received response for GET");
  }
}
