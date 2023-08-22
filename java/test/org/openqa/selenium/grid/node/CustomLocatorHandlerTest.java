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

package org.openqa.selenium.grid.node;

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.util.Collections.emptyList;
import static java.util.Collections.emptySet;
import static java.util.Collections.singleton;
import static java.util.Collections.singletonList;
import static java.util.Collections.singletonMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableMap;
import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatcher;
import org.mockito.Mockito;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.InvalidArgumentException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.TypeToken;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.ErrorFilter;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.UrlTemplate;
import org.openqa.selenium.remote.locators.CustomLocator;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

class CustomLocatorHandlerTest {

  private final Secret registrationSecret = new Secret("cheese");
  private LocalNode.Builder nodeBuilder;
  private URI nodeUri;

  @BeforeEach
  public void partiallyBuildNode() {
    Tracer tracer = DefaultTestTracer.createTracer();
    nodeUri = URI.create("http://localhost:1234");
    nodeBuilder =
        LocalNode.builder(
            tracer,
            new GuavaEventBus(),
            nodeUri,
            URI.create("http://localhost:4567"),
            registrationSecret);
  }

  @Test
  void shouldRequireInputToHaveAUsingParameter() {
    Node node = nodeBuilder.build();

    HttpHandler handler = new CustomLocatorHandler(node, registrationSecret, emptySet());

    HttpResponse res =
        handler.execute(
            new HttpRequest(POST, "/session/1234/element")
                .setContent(Contents.asJson(singletonMap("value", "1234"))));

    assertThat(res.getStatus()).isEqualTo(HTTP_BAD_REQUEST);
    assertThatExceptionOfType(InvalidArgumentException.class)
        .isThrownBy(() -> Values.get(res, MAP_TYPE));
  }

  @Test
  void shouldRequireInputToHaveAValueParameter() {
    Node node = nodeBuilder.build();

    HttpHandler handler = new CustomLocatorHandler(node, registrationSecret, emptySet());

    HttpResponse res =
        handler.execute(
            new HttpRequest(POST, "/session/1234/element")
                .setContent(Contents.asJson(singletonMap("using", "magic"))));

    assertThat(res.getStatus()).isEqualTo(HTTP_BAD_REQUEST);
    assertThatExceptionOfType(InvalidArgumentException.class)
        .isThrownBy(() -> Values.get(res, MAP_TYPE));
  }

  @Test
  void shouldNotRejectRequestWithAnUnknownLocatorMechanism() {
    Node node = nodeBuilder.build();

    HttpHandler handler = new CustomLocatorHandler(node, registrationSecret, emptySet());

    // Getting a NoSuchSessionException means the request went through the
    // CustomLocatorHandler successfully but stopped at the Node because
    // the actually does not exist.
    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(
            () ->
                handler.execute(
                    new HttpRequest(POST, "/session/1234/element")
                        .setContent(
                            Contents.asJson(
                                ImmutableMap.of(
                                    "using", "cheese",
                                    "value", "tasty")))));
  }

  @Test
  void shouldCallTheGivenLocatorForALocator() {
    Capabilities caps = new ImmutableCapabilities("browserName", "cheesefox");
    Node node =
        nodeBuilder
            .add(
                caps,
                new TestSessionFactory((id, c) -> new Session(id, nodeUri, caps, c, Instant.now())))
            .build();

    HttpHandler handler =
        new CustomLocatorHandler(
            node,
            registrationSecret,
            singleton(
                new CustomLocator() {
                  @Override
                  public String getLocatorName() {
                    return "cheese";
                  }

                  @Override
                  public By createBy(Object usingParameter) {
                    return new By() {
                      @Override
                      public List<WebElement> findElements(SearchContext context) {
                        return emptyList();
                      }
                    };
                  }
                }));

    HttpResponse res =
        handler
            .with(new ErrorFilter())
            .execute(
                new HttpRequest(POST, "/session/1234/element")
                    .setContent(
                        Contents.asJson(
                            ImmutableMap.of(
                                "using", "cheese",
                                "value", "tasty"))));

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> Values.get(res, WebElement.class));
  }

  @Test
  void shouldBeAbleToUseNodeAsWebDriver() {
    String elementId = UUID.randomUUID().toString();

    Node node = Mockito.mock(Node.class);
    when(node.executeWebDriverCommand(argThat(matchesUri("/session/{sessionId}/elements"))))
        .thenReturn(
            new HttpResponse()
                .addHeader("Content-Type", Json.JSON_UTF_8)
                .setContent(
                    Contents.asJson(
                        singletonMap(
                            "value",
                            singletonList(
                                singletonMap(Dialect.W3C.getEncodedElementKey(), elementId))))));

    HttpHandler handler =
        new CustomLocatorHandler(
            node,
            registrationSecret,
            singleton(
                new CustomLocator() {
                  @Override
                  public String getLocatorName() {
                    return "cheese";
                  }

                  @Override
                  public By createBy(Object usingParameter) {
                    return By.id("brie");
                  }
                }));

    HttpResponse res =
        handler.execute(
            new HttpRequest(POST, "/session/1234/elements")
                .setContent(
                    Contents.asJson(
                        ImmutableMap.of(
                            "using", "cheese",
                            "value", "tasty"))));

    List<Map<String, Object>> elements =
        Values.get(res, new TypeToken<List<Map<String, Object>>>() {}.getType());
    assertThat(elements).hasSize(1);
    Object seenId = elements.get(0).get(Dialect.W3C.getEncodedElementKey());
    assertThat(seenId).isEqualTo(elementId);
  }

  @Test
  void shouldBeAbleToRootASearchWithinAnElement() {
    String elementId = UUID.randomUUID().toString();

    Node node = Mockito.mock(Node.class);
    when(node.executeWebDriverCommand(
            argThat(matchesUri("/session/{sessionId}/element/{elementId}/elements"))))
        .thenReturn(
            new HttpResponse()
                .addHeader("Content-Type", Json.JSON_UTF_8)
                .setContent(
                    Contents.asJson(
                        singletonMap(
                            "value",
                            singletonList(
                                singletonMap(Dialect.W3C.getEncodedElementKey(), elementId))))));

    HttpHandler handler =
        new CustomLocatorHandler(
            node,
            registrationSecret,
            singleton(
                new CustomLocator() {
                  @Override
                  public String getLocatorName() {
                    return "cheese";
                  }

                  @Override
                  public By createBy(Object usingParameter) {
                    return By.id("brie");
                  }
                }));

    HttpResponse res =
        handler.execute(
            new HttpRequest(POST, "/session/1234/element/234345/elements")
                .setContent(
                    Contents.asJson(
                        ImmutableMap.of(
                            "using", "cheese",
                            "value", "tasty"))));

    List<Map<String, Object>> elements =
        Values.get(res, new TypeToken<List<Map<String, Object>>>() {}.getType());
    assertThat(elements).hasSize(1);
    Object seenId = elements.get(0).get(Dialect.W3C.getEncodedElementKey());
    assertThat(seenId).isEqualTo(elementId);
  }

  private ArgumentMatcher<HttpRequest> matchesUri(String template) {
    UrlTemplate ut = new UrlTemplate(template);

    return req -> ut.match(req.getUri()) != null;
  }
}
