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

package org.openqa.selenium.remote.server;

import static java.util.concurrent.TimeUnit.MINUTES;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.verify;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import com.google.common.collect.ImmutableMap;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mockito;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.testing.FakeHttpServletRequest;
import org.openqa.testing.FakeHttpServletResponse;
import org.openqa.testing.UrlInfo;

import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;

public class WebDriverServletTest {

  private static final String BASE_URL = "http://localhost:4444";
  private static final String CONTEXT_PATH = "/wd/hub";

  private Json json = new Json();
  private ActiveSessions testSessions;
  private WebDriverServlet driverServlet;
  private WebDriver driver;

  @Before
  public void setUp() {
    testSessions = new ActiveSessions(1, MINUTES);
    driver = Mockito.mock(WebDriver.class);

    InMemorySession.Factory factory = new InMemorySession.Factory(
        new DriverProvider() {
          @Override
          public Capabilities getProvidedCapabilities() {
            return new ImmutableCapabilities();
          }

          @Override
          public boolean canCreateDriverInstanceFor(Capabilities capabilities) {
            return true;
          }

          @Override
          public WebDriver newInstance(Capabilities capabilities) {
            return driver;
          }
        });

    NewSessionPipeline pipeline = NewSessionPipeline.builder()
        .add(factory)
        .create();

    // Override log methods for testing.
    driverServlet = new WebDriverServlet(testSessions, pipeline);
  }

  @Test
  public void navigateToUrlCommandHandler() throws IOException, ServletException {
    final SessionId sessionId = createSession();

    WebDriver driver = testSessions.get(sessionId).getWrappedDriver();

    Map<String, Object> json = ImmutableMap.of("url", "http://www.google.com");
    FakeHttpServletResponse response = sendCommand("POST",
                                                   String.format("/session/%s/url", sessionId),
                                                   json);

    assertEquals(HttpServletResponse.SC_OK, response.getStatus());

    verify(driver).get("http://www.google.com");
  }

  @Test
  public void reportsBadRequestForMalformedCrossDomainRpcs()
      throws IOException, ServletException {
    FakeHttpServletResponse response = sendCommand("POST", "/xdrpc", ImmutableMap.of());

    assertEquals(HttpServletResponse.SC_BAD_REQUEST, response.getStatus());
    assertEquals("Missing required parameter: method\r\n", response.getBody());
  }

  @Test
  public void handlesWellFormedAndSuccessfulCrossDomainRpcs()
      throws IOException, ServletException {
    final SessionId sessionId = createSession();

    WebDriver driver = testSessions.get(sessionId).getWrappedDriver();

    Map<String, Object> json = ImmutableMap.of(
        "method", "POST",
        "path", String.format("/session/%s/url", sessionId),
        "data", ImmutableMap.of("url", "http://www.google.com"));
    FakeHttpServletResponse response = sendCommand("POST", "/xdrpc", json);

    verify(driver).get("http://www.google.com");
    assertEquals(HttpServletResponse.SC_OK, response.getStatus());
    assertEquals("application/json; charset=utf-8",
                 response.getHeader("content-type"));

    Map<String, Object> jsonResponse = this.json.toType(response.getBody(), MAP_TYPE);
    assertEquals(ErrorCodes.SUCCESS, ((Number) jsonResponse.get("status")).intValue());
    assertEquals(sessionId.toString(), jsonResponse.get("sessionId"));
    assertNull(jsonResponse.get("value"));
  }

  @Test
  public void doesNotRedirectForNewSessionsRequestedViaCrossDomainRpc()
      throws IOException, ServletException {
    Map<String, Object> json = ImmutableMap.of(
        "method", "POST",
        "path", "/session",
        "data", ImmutableMap.of(
            "desiredCapabilities", ImmutableMap.of(
                CapabilityType.BROWSER_NAME, BrowserType.FIREFOX,
                CapabilityType.VERSION, true)));
    FakeHttpServletResponse response = sendCommand("POST", "/xdrpc", json);

    assertEquals(HttpServletResponse.SC_OK, response.getStatus());
    assertEquals("application/json; charset=utf-8",
                 response.getHeader("content-type"));

    Map<String, Object> jsonResponse = this.json.toType(response.getBody(), MAP_TYPE);
    assertEquals(ErrorCodes.SUCCESS, ((Number) jsonResponse.get("status")).intValue());
    assertNotNull(jsonResponse.get("sessionId"));

    Map<?, ?> value = (Map<?, ?>) jsonResponse.get("value");
    // values: browsername, version, remote session id.
    assertEquals(value.toString(), 3, value.entrySet().size());
    assertEquals(BrowserType.FIREFOX, value.get(CapabilityType.BROWSER_NAME));
    assertTrue((Boolean) value.get(CapabilityType.VERSION));
  }

  @Test
  public void handlesInvalidCommandsToRootOfDriverService()
      throws IOException, ServletException {
    // Command path will be null in servlet API when request is to the context root (e.g. /wd/hub).
    FakeHttpServletResponse response = sendCommand("POST", null, ImmutableMap.of());

    // An Unknown Command has an HTTP status code of 404. Fact.
    assertEquals(404, response.getStatus());

    Map<String, Object> jsonResponse = json.toType(response.getBody(), MAP_TYPE);
    assertEquals(ErrorCodes.UNKNOWN_COMMAND, ((Number) jsonResponse.get("status")).intValue());

    Map<?, ?> value = (Map<?, ?>) jsonResponse.get("value");
    assertThat(value.get("message")).isInstanceOf(String.class);
  }

  private SessionId createSession() throws IOException, ServletException {
    Map<String, Object> caps = ImmutableMap.of("desiredCapabilities", ImmutableMap.of());
    FakeHttpServletResponse response = sendCommand("POST", "/session", caps);

    assertEquals(HttpServletResponse.SC_OK, response.getStatus());

    Response resp = json.toType(response.getBody(), Response.class);

    String sessionId = resp.getSessionId();
    assertNotNull(sessionId);
    assertFalse(sessionId.isEmpty());
    return new SessionId(sessionId);
  }

  private FakeHttpServletResponse sendCommand(
      String method,
      String commandPath,
      Map<String, Object> parameters) throws IOException, ServletException {
    FakeHttpServletRequest request = new FakeHttpServletRequest(method, createUrl(commandPath));
    if (parameters != null) {
      request.setBody(new Json().toJson(parameters));
    }

    FakeHttpServletResponse response = new FakeHttpServletResponse();

    driverServlet.service(request, response);
    return response;
  }

  private static UrlInfo createUrl(String path) {
    return new UrlInfo(BASE_URL, CONTEXT_PATH, path);
  }

//  @Test
//  public void timeouts() throws IOException, ServletException {
//    assertEquals(2000, driverServlet.getIndividualCommandTimeoutMs());
//    assertEquals(18000, driverServlet.getInactiveSessionTimeout());
//  }

}
