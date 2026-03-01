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

package org.openqa.selenium.grid.node.relay;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.node.ActiveSession;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

public class RelaySessionFactoryTest {

  @Test
  public void testFilterRelayCapabilities() {
    Capabilities capabilitiesWithApp =
        new ImmutableCapabilities(
            "browserName", "chrome", "platformName", "Android", "appium:app", "/link/to/app.apk");
    Capabilities capabilitiesWithAppPackage =
        new ImmutableCapabilities(
            "browserName",
            "chrome",
            "platformName",
            "Android",
            "appium:appPackage",
            "com.example.app");
    Capabilities capabilitiesWithBundleId =
        new ImmutableCapabilities(
            "browserName",
            "chrome",
            "platformName",
            "Android",
            "appium:bundleId",
            "com.example.app");
    Capabilities capabilitiesWithoutApp =
        new ImmutableCapabilities("browserName", "chrome", "platformName", "Android");

    RelaySessionFactory factory = Mockito.mock(RelaySessionFactory.class);

    when(factory.filterRelayCapabilities(capabilitiesWithApp)).thenCallRealMethod();
    when(factory.filterRelayCapabilities(capabilitiesWithAppPackage)).thenCallRealMethod();
    when(factory.filterRelayCapabilities(capabilitiesWithBundleId)).thenCallRealMethod();
    when(factory.filterRelayCapabilities(capabilitiesWithoutApp)).thenCallRealMethod();

    capabilitiesWithApp = factory.filterRelayCapabilities(capabilitiesWithApp);
    capabilitiesWithAppPackage = factory.filterRelayCapabilities(capabilitiesWithAppPackage);
    capabilitiesWithBundleId = factory.filterRelayCapabilities(capabilitiesWithBundleId);
    capabilitiesWithoutApp = factory.filterRelayCapabilities(capabilitiesWithoutApp);

    assertThat(capabilitiesWithApp.getCapability("browserName")).isEqualTo(null);
    assertThat(capabilitiesWithAppPackage.getCapability("browserName")).isEqualTo(null);
    assertThat(capabilitiesWithBundleId.getCapability("browserName")).isEqualTo(null);
    assertThat(capabilitiesWithoutApp.getCapability("browserName")).isEqualTo("chrome");
  }

  @Test
  void stereotypeSePrefixedCapsAreMergedIntoSession() {
    String fakeSessionId = UUID.randomUUID().toString();

    // The remote (e.g. Appium) only returns basic caps — no se: prefixed caps
    Map<String, Object> responsePayload =
        Map.of(
            "value",
            Map.of(
                "sessionId",
                fakeSessionId,
                "capabilities",
                Map.of(
                    "browserName", "chrome",
                    "platformName", "android")));

    Route route =
        Route.post("/session")
            .to(
                () ->
                    req -> {
                      HttpResponse response = new HttpResponse();
                      response.setStatus(200);
                      response.setContent(Contents.asJson(responsePayload));
                      return response;
                    });

    PassthroughHttpClient.Factory clientFactory = new PassthroughHttpClient.Factory(route);
    Tracer tracer = DefaultTestTracer.createTracer();

    // Stereotype includes se: prefixed capabilities
    Capabilities stereotype =
        new ImmutableCapabilities(
            "browserName", "chrome",
            "platformName", "android",
            "appium:deviceName", "emulator",
            "se:downloadsEnabled", true,
            "se:vncLocalAddress", "ws://10.0.0.1:7900");

    RelaySessionFactory factory =
        new RelaySessionFactory(
            tracer,
            clientFactory,
            Duration.ofSeconds(300),
            URI.create("http://localhost:4723"),
            null,
            "",
            stereotype);

    // Client request does NOT include se: caps — just the basics
    Capabilities requestCaps =
        new ImmutableCapabilities(
            "browserName", "chrome",
            "platformName", "android",
            "appium:deviceName", "emulator");

    CreateSessionRequest sessionRequest =
        new CreateSessionRequest(Set.of(Dialect.W3C), requestCaps, Map.of());

    Either<WebDriverException, ActiveSession> result = factory.apply(sessionRequest);

    assertThat(result.isRight()).isTrue();
    ActiveSession session = result.right();
    Capabilities sessionCaps = session.getCapabilities();

    // se: prefixed caps from stereotype must be present in session capabilities
    assertThat(sessionCaps.getCapability("se:downloadsEnabled")).isEqualTo(true);
    assertThat(sessionCaps.getCapability("se:vncLocalAddress")).isEqualTo("ws://10.0.0.1:7900");
    // Standard caps from remote response must also be present
    assertThat(sessionCaps.getCapability("browserName")).isEqualTo("chrome");
    assertThat(sessionCaps.getCapability("platformName").toString())
        .isEqualToIgnoringCase("android");
  }

  @Test
  void remoteResponseOverridesStereotypeSePrefixedCaps() {
    String fakeSessionId = UUID.randomUUID().toString();

    // Remote returns its own se:downloadsEnabled value
    Map<String, Object> responsePayload =
        Map.of(
            "value",
            Map.of(
                "sessionId",
                fakeSessionId,
                "capabilities",
                Map.of(
                    "browserName", "chrome",
                    "platformName", "android",
                    "se:downloadsEnabled", false)));

    Route route =
        Route.post("/session")
            .to(
                () ->
                    req -> {
                      HttpResponse response = new HttpResponse();
                      response.setStatus(200);
                      response.setContent(Contents.asJson(responsePayload));
                      return response;
                    });

    PassthroughHttpClient.Factory clientFactory = new PassthroughHttpClient.Factory(route);
    Tracer tracer = DefaultTestTracer.createTracer();

    Capabilities stereotype =
        new ImmutableCapabilities(
            "browserName", "chrome",
            "platformName", "android",
            "se:downloadsEnabled", true);

    RelaySessionFactory factory =
        new RelaySessionFactory(
            tracer,
            clientFactory,
            Duration.ofSeconds(300),
            URI.create("http://localhost:4723"),
            null,
            "",
            stereotype);

    Capabilities requestCaps =
        new ImmutableCapabilities(
            "browserName", "chrome",
            "platformName", "android");

    CreateSessionRequest sessionRequest =
        new CreateSessionRequest(Set.of(Dialect.W3C), requestCaps, Map.of());

    Either<WebDriverException, ActiveSession> result = factory.apply(sessionRequest);

    assertThat(result.isRight()).isTrue();
    ActiveSession session = result.right();
    Capabilities sessionCaps = session.getCapabilities();

    // Remote response value should win over stereotype (merge overlays remote on top)
    assertThat(sessionCaps.getCapability("se:downloadsEnabled")).isEqualTo(false);
  }
}
