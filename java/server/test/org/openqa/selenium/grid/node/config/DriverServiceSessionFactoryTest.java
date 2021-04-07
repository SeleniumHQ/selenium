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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.node.ActiveSession;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.service.DriverService;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.function.Predicate;

public class DriverServiceSessionFactoryTest {

  private Tracer tracer;
  private HttpClient.Factory clientFactory;
  private DriverService.Builder builder;
  private DriverService driverService;

  @Before
  public void setUp() throws MalformedURLException {
    tracer = DefaultTestTracer.createTracer();

    clientFactory = mock(HttpClient.Factory.class);

    driverService = mock(DriverService.class);
    when(driverService.getUrl()).thenReturn(new URL("http://localhost:1234/"));

    builder = mock(DriverService.Builder.class);
    when(builder.build()).thenReturn(driverService);
  }

  @Test
  public void itDelegatesCapabilitiesTestingToPredicate() {
    DriverServiceSessionFactory factory = factoryFor("chrome", builder);

    assertThat(factory.test(toPayload("chrome"))).isTrue();
    assertThat(factory.test(toPayload("firefox"))).isFalse();

    verifyNoInteractions(builder);
  }

  @Test
  public void shouldNotInstantiateSessionIfNoDialectSpecifiedInARequest() {
    DriverServiceSessionFactory factory = factoryFor("chrome", builder);

    Either<WebDriverException, ActiveSession> session = factory.apply(new CreateSessionRequest(
      ImmutableSet.of(), toPayload("chrome"), ImmutableMap.of()));

    assertThat(session.isLeft()).isTrue();
    verifyNoInteractions(builder);
  }

  @Test
  public void shouldNotInstantiateSessionIfCapabilitiesDoNotMatch() {
    DriverServiceSessionFactory factory = factoryFor("chrome", builder);

    Either<WebDriverException, ActiveSession> session = factory.apply(new CreateSessionRequest(
      ImmutableSet.of(Dialect.W3C), toPayload("firefox"), ImmutableMap.of()));

    assertThat(session.isLeft()).isTrue();
    verifyNoInteractions(builder);
  }

  @Test
  public void shouldNotInstantiateSessionIfBuilderCanNotBuildService() {
    when(builder.build()).thenThrow(new WebDriverException());

    DriverServiceSessionFactory factory = factoryFor("chrome", builder);

    Either<WebDriverException, ActiveSession> session = factory.apply(new CreateSessionRequest(
      ImmutableSet.of(Dialect.W3C), toPayload("chrome"), ImmutableMap.of()));

    assertThat(session.isLeft()).isTrue();
    verify(builder, times(1)).build();
    verifyNoMoreInteractions(builder);
  }

  @Test
  public void shouldNotInstantiateSessionIfRemoteEndReturnsInvalidResponse() throws IOException {
    HttpClient httpClient = mock(HttpClient.class);
    when(httpClient.execute(any(HttpRequest.class))).thenReturn(
        new HttpResponse().setStatus(200).setContent(() -> new ByteArrayInputStream(
            "Hello, world!".getBytes())));
    when(clientFactory.createClient(any(URL.class))).thenReturn(httpClient);

    DriverServiceSessionFactory factory = factoryFor("chrome", builder);

    Either<WebDriverException, ActiveSession> session = factory.apply(new CreateSessionRequest(
      ImmutableSet.of(Dialect.W3C), toPayload("chrome"), ImmutableMap.of()));

    assertThat(session.isLeft()).isTrue();

    verify(builder, times(1)).build();
    verifyNoMoreInteractions(builder);
    verify(driverService, times(1)).start();
    verify(driverService, atLeastOnce()).getUrl();
    verify(driverService, times(1)).stop();
    verifyNoMoreInteractions(driverService);
  }

  @Test
  public void shouldInstantiateSessionIfEverythingIsOK() throws IOException {
    HttpClient httpClient = mock(HttpClient.class);
    when(httpClient.execute(any(HttpRequest.class))).thenReturn(
        new HttpResponse().setStatus(200).setContent(() -> new ByteArrayInputStream(
            "{ \"value\": { \"sessionId\": \"1\", \"capabilities\": {} } }".getBytes())));
    when(clientFactory.createClient(any(URL.class))).thenReturn(httpClient);

    DriverServiceSessionFactory factory = factoryFor("chrome", builder);

    Either<WebDriverException, ActiveSession> session = factory.apply(new CreateSessionRequest(
      ImmutableSet.of(Dialect.W3C), toPayload("chrome"), ImmutableMap.of()));

    assertThat(session.isRight()).isTrue();

    verify(builder, times(1)).build();
    verifyNoMoreInteractions(builder);
    verify(driverService, times(1)).start();
    verify(driverService, atLeastOnce()).getUrl();
    verifyNoMoreInteractions(driverService);
  }

  private DriverServiceSessionFactory factoryFor(String browser, DriverService.Builder builder) {
    Predicate<Capabilities> predicate = c -> c.getBrowserName().equals(browser);
    ImmutableCapabilities stereotype = new ImmutableCapabilities(BROWSER_NAME, browser);
    return new DriverServiceSessionFactory(tracer, clientFactory, stereotype, predicate, builder);
  }

  private Capabilities toPayload(String browserName) {
    return new ImmutableCapabilities("browserName", browserName);
  }
}
