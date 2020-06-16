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

package org.openqa.selenium.grid.node.config;

import org.assertj.core.api.Condition;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.UUID;

import static java.util.Collections.emptyMap;
import static java.util.Collections.singletonMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assume.assumeFalse;
import static org.junit.Assume.assumeTrue;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

public class NodeOptionsTest {

  private Tracer tracer;
  private HttpClient.Factory clientFactory;
  private LocalNode.Builder builder;
  private LocalNode.Builder builderSpy;

  @Before
  public void setUp() throws URISyntaxException {
    tracer = DefaultTestTracer.createTracer();
    EventBus bus = new GuavaEventBus();
    clientFactory = HttpClient.Factory.createDefault();
    URI uri = new URI("http://localhost:1234");
    builder = LocalNode.builder(tracer, bus, uri, uri, null);
    builderSpy = spy(builder);
  }

  @Test
  public void canConfigureNodeWithDriverDetection() {
    assumeFalse("We don't have driver servers in PATH when we run unit tests",
                Boolean.parseBoolean(System.getenv("TRAVIS")));

    Config config = new MapConfig(singletonMap(
        "node", singletonMap("detect-drivers", "true")));
    new NodeOptions(config).configure(tracer, clientFactory, builderSpy);

    Capabilities chrome = toPayload("chrome");

    verify(builderSpy, atLeastOnce()).add(
        argThat(caps -> caps.getBrowserName().equals(chrome.getBrowserName())),
        argThat(factory -> factory instanceof DriverServiceSessionFactory && factory.test(chrome)));

    LocalNode node = builder.build();
    assertThat(node).is(supporting(chrome));
    assertThat(node).isNot(supporting("cheese"));
  }

  @Test
  public void shouldDetectCorrectDriversOnWindows() {
    assumeTrue(Platform.getCurrent().is(Platform.WINDOWS));
    assumeFalse("We don't have driver servers in PATH when we run unit tests",
                Boolean.getBoolean("TRAVIS"));

    Config config = new MapConfig(singletonMap(
        "node", singletonMap("detect-drivers", "true")));
    new NodeOptions(config).configure(tracer, clientFactory, builder);

    LocalNode node = builder.build();
    assertThat(node).is(supporting("chrome"));
    assertThat(node).is(supporting("firefox"));
    assertThat(node).is(supporting("internet explorer"));
    assertThat(node).is(supporting("MicrosoftEdge"));
    assertThat(node).isNot(supporting("safari"));
  }

  @Test
  public void shouldDetectCorrectDriversOnMac() {
    assumeTrue(Platform.getCurrent().is(Platform.MAC));
    assumeFalse("We don't have driver servers in PATH when we run unit tests",
                Boolean.getBoolean("TRAVIS"));

    Config config = new MapConfig(singletonMap(
        "node", singletonMap("detect-drivers", "true")));
    new NodeOptions(config).configure(tracer, clientFactory, builder);

    LocalNode node = builder.build();
    assertThat(node).is(supporting("chrome"));
    assertThat(node).is(supporting("firefox"));
    assertThat(node).isNot(supporting("internet explorer"));
    assertThat(node).is(supporting("MicrosoftEdge"));
    assertThat(node).is(supporting("safari"));
  }

  @Test
  public void canAddMoreSessionFactoriesAfterDriverDetection() throws URISyntaxException {
    Config config = new MapConfig(singletonMap(
        "node", singletonMap("detect-drivers", "true")));
    new NodeOptions(config).configure(tracer, clientFactory, builder);

    Capabilities cheese = toPayload("cheese");

    URI uri = new URI("http://localhost:1234");
    class Handler extends Session implements HttpHandler {

      private Handler(Capabilities capabilities) {
        super(new SessionId(UUID.randomUUID()), uri, capabilities);
      }

      @Override
      public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
        return new HttpResponse();
      }
    }

    builder.add(cheese, new TestSessionFactory((id, c) -> new Handler(c)));

    LocalNode node = builder.build();
    assertThat(node).is(supporting("chrome"));
    assertThat(node).is(supporting(cheese));
  }

  @Test
  public void canConfigureNodeWithoutDriverDetection() {
    Config config = new MapConfig(singletonMap(
        "node", singletonMap("detect-drivers", "false")));
    new NodeOptions(config).configure(tracer, clientFactory, builderSpy);

    verifyNoInteractions(builderSpy);
  }

  @Test
  public void doNotDetectDriversByDefault() {
    Config config = new MapConfig(emptyMap());
    new NodeOptions(config).configure(tracer, clientFactory, builderSpy);

    verifyNoInteractions(builderSpy);
  }

  private Capabilities toPayload(String browserName) {
    return new ImmutableCapabilities("browserName", browserName);
  }

  private Condition<LocalNode> supporting(Capabilities caps) {
    return new Condition<>(node -> node.isSupporting(caps), "supporting " + caps);
  }

  private Condition<LocalNode> supporting(String browserName) {
    return new Condition<>(node -> node.isSupporting(toPayload(browserName)), "supporting " + browserName);
  }
}
