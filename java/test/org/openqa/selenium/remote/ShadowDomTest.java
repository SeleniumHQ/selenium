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

package org.openqa.selenium.remote;

import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static java.util.Collections.singletonMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchShadowRootException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

@Tag("UnitTests")
class ShadowDomTest {

  private final SessionId id = new SessionId(UUID.randomUUID());
  private final UUID elementId = UUID.randomUUID();
  private final Map<HttpRequest, HttpResponse> cannedResponses = new HashMap<>();
  private RemoteWebDriver driver;
  private RemoteWebElement element;

  @BeforeEach
  public void createDriver() {
    Function<Command, HttpRequest> toHttpReq = Dialect.W3C.getCommandCodec()::encode;
    Function<HttpResponse, Response> toHttpRes = Dialect.W3C.getResponseCodec()::decode;

    Function<HttpRequest, HttpResponse> handler =
        req -> {
          HttpResponse res =
              cannedResponses.entrySet().stream()
                  .filter(
                      e ->
                          e.getKey().getMethod() == req.getMethod()
                              && e.getKey().getUri().equals(req.getUri()))
                  .map(Map.Entry::getValue)
                  .findFirst()
                  .orElse(
                      new HttpResponse()
                          .setStatus(HTTP_NOT_FOUND)
                          .setContent(
                              Contents.asJson(
                                  Map.of(
                                      "value",
                                      Map.of(
                                          "error", "unknown command", "message", req.getUri())))));

          return res.setHeader("Content-Type", JSON_UTF_8);
        };

    CommandExecutor executor = cmd -> toHttpReq.andThen(handler).andThen(toHttpRes).apply(cmd);

    driver =
        new RemoteWebDriver(executor, new ImmutableCapabilities()) {
          @Override
          protected void startSession(Capabilities capabilities) {
            setSessionId(id.toString());
          }
        };

    element = new RemoteWebElement();
    element.setParent(driver);
    element.setId(elementId.toString());
  }

  @Test
  void shouldThrowAnExceptionIfTheShadowRootCannotBeFound() {
    HttpRequest expected =
        new HttpRequest(GET, String.format("/session/%s/element/%s/shadow", id, elementId));

    cannedResponses.put(
        expected,
        new HttpResponse()
            .setStatus(HTTP_NOT_FOUND)
            .setContent(
                Contents.asJson(
                    Map.of("value", Map.of("error", "no such shadow root", "message", "")))));

    assertThatExceptionOfType(NoSuchShadowRootException.class).isThrownBy(element::getShadowRoot);
  }

  @Test
  void shouldGetShadowRoot() {
    HttpRequest expected =
        new HttpRequest(GET, String.format("/session/%s/element/%s/shadow", id, elementId));
    UUID shadowId = UUID.randomUUID();

    cannedResponses.put(
        expected,
        new HttpResponse()
            .setContent(
                Contents.asJson(
                    singletonMap(
                        "value", singletonMap("shadow-6066-11e4-a52e-4f735466cecf", shadowId)))));

    SearchContext context = element.getShadowRoot();

    assertThat(context).isNotNull();
  }

  @Test
  void shouldBeAbleToFindAnElementFromAShadowRoot() {
    String shadowId = UUID.randomUUID().toString();
    UUID elementId = UUID.randomUUID();

    HttpRequest expected =
        new HttpRequest(POST, String.format("/session/%s/shadow/%s/element", id, shadowId));
    cannedResponses.put(
        expected,
        new HttpResponse()
            .setContent(
                Contents.asJson(
                    Map.of("value", Map.of(Dialect.W3C.getEncodedElementKey(), elementId)))));

    SearchContext context = new ShadowRoot(driver, shadowId);

    RemoteWebElement element = (RemoteWebElement) context.findElement(By.cssSelector("#cheese"));

    assertThat(element).isNotNull();
    assertThat(element.getId()).isEqualTo(elementId.toString());
  }

  @Test
  void shouldBeAbleToFindElementsFromAShadowRoot() {
    String shadowId = UUID.randomUUID().toString();
    UUID elementId = UUID.randomUUID();

    HttpRequest expected =
        new HttpRequest(POST, String.format("/session/%s/shadow/%s/elements", id, shadowId));
    cannedResponses.put(
        expected,
        new HttpResponse()
            .setContent(
                Contents.asJson(
                    Map.of(
                        "value", List.of(Map.of(Dialect.W3C.getEncodedElementKey(), elementId))))));

    SearchContext context = new ShadowRoot(driver, shadowId);

    List<WebElement> elements = context.findElements(By.cssSelector("#cheese"));

    assertThat(elements).hasSize(1);
    RemoteWebElement remote = (RemoteWebElement) elements.get(0);
    assertThat(remote.getId()).isEqualTo(elementId.toString());
  }

  @Test
  void failingToFindAnElementFromAShadowRootThrowsAnException() {
    String shadowId = UUID.randomUUID().toString();

    HttpRequest expected =
        new HttpRequest(POST, String.format("/session/%s/shadow/%s/element", id, shadowId));
    cannedResponses.put(
        expected,
        new HttpResponse()
            .setStatus(HTTP_NOT_FOUND)
            .setContent(
                Contents.asJson(
                    Map.of("value", Map.of("error", "no such element", "message", "oh noes!")))));

    SearchContext context = new ShadowRoot(driver, shadowId);

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> context.findElement(By.cssSelector("#cheese")));
  }

  @Test
  void shouldBeAbleToGetShadowRootFromExecuteScript() {
    String shadowId = UUID.randomUUID().toString();

    HttpRequest execute = new HttpRequest(POST, String.format("/session/%s/execute/sync", id));

    cannedResponses.put(
        execute,
        new HttpResponse()
            .setContent(
                Contents.asJson(
                    singletonMap(
                        "value", singletonMap("shadow-6066-11e4-a52e-4f735466cecf", shadowId)))));

    HttpRequest shadow =
        new HttpRequest(GET, String.format("/session/%s/element/%s/shadow", id, elementId));
    cannedResponses.put(
        shadow,
        new HttpResponse()
            .setContent(
                Contents.asJson(
                    singletonMap(
                        "value", singletonMap("shadow-6066-11e4-a52e-4f735466cecf", shadowId)))));

    ShadowRoot shadowContext = (ShadowRoot) element.getShadowRoot();
    ShadowRoot executeContext =
        (ShadowRoot) ((JavascriptExecutor) driver).executeScript("return Arguments[0].shadowRoot");
    assertThat(shadowContext.getId()).isEqualTo(executeContext.getId());
  }
}
