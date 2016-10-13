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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.verify;

import com.google.common.base.Supplier;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.testing.FakeHttpServletRequest;
import org.openqa.testing.FakeHttpServletResponse;
import org.openqa.testing.TestSessions;
import org.openqa.testing.UrlInfo;
import org.seleniumhq.jetty9.server.handler.ContextHandler;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;

@RunWith(JUnit4.class)
public class DriverServletTest {

  private static final String BASE_URL = "http://localhost:4444";
  private static final String CONTEXT_PATH = "/wd/hub";

  private TestSessions testSessions;
  private DriverServlet driverServlet;
  private long clientTimeout;
  private long browserTimeout;

  @Before
  public void setUp() throws ServletException {
    testSessions = new TestSessions();

    // Override log methods for testing.
    driverServlet = new DriverServlet(createSupplier(testSessions)) {
      @Override
      public void log(String msg) {
      }

      @Override
      public void log(String message, Throwable t) {
      }

      @Override
      public ServletContext getServletContext() {
        final ContextHandler.Context servletContext = new ContextHandler().getServletContext();
        servletContext.setInitParameter("webdriver.server.session.timeout", "18");
        servletContext.setInitParameter("webdriver.server.browser.timeout", "2");
        return servletContext;
      }

      @Override
      protected void createSessionCleaner(Logger logger, DriverSessions driverSessions,
                                          long sessionTimeOutInMs, long browserTimeoutInMs) {
        clientTimeout = sessionTimeOutInMs;
        browserTimeout = browserTimeoutInMs;
      }
    };
    driverServlet.init();
  }

  @Test
  public void navigateToUrlCommandHandler() throws IOException, ServletException {
    final SessionId sessionId = createSession();

    WebDriver driver = testSessions.get(sessionId).getDriver();

    JsonObject json = new JsonObject();
    json.addProperty("url", "http://www.google.com");
    FakeHttpServletResponse response = sendCommand("POST",
        String.format("/session/%s/url", sessionId), json);

    assertEquals(HttpServletResponse.SC_OK, response.getStatus());

    verify(driver).get("http://www.google.com");
  }

  @Test
  public void reportsBadRequestForMalformedCrossDomainRpcs()
      throws IOException, ServletException {
    FakeHttpServletResponse response = sendCommand("POST", "/xdrpc", new JsonObject());

    assertEquals(HttpServletResponse.SC_BAD_REQUEST, response.getStatus());
    assertEquals("Missing required parameter: method\r\n", response.getBody());
  }

  @Test
  public void handlesWellFormedAndSuccessfulCrossDomainRpcs()
      throws IOException, ServletException {
    final SessionId sessionId = createSession();

    WebDriver driver = testSessions.get(sessionId).getDriver();

    JsonObject json = new JsonObject();
    json.addProperty("method", "POST");
    json.addProperty("path", String.format("/session/%s/url", sessionId));
    JsonObject data = new JsonObject();
    data.addProperty("url", "http://www.google.com");
    json.add("data", data);
    FakeHttpServletResponse response = sendCommand("POST", "/xdrpc", json);

    verify(driver).get("http://www.google.com");
    assertEquals(HttpServletResponse.SC_OK, response.getStatus());
    assertEquals("application/json; charset=utf-8",
        response.getHeader("content-type"));

    JsonObject jsonResponse = new JsonParser().parse(response.getBody()).getAsJsonObject();
    assertEquals(ErrorCodes.SUCCESS, jsonResponse.get("status").getAsInt());
    assertEquals(sessionId.toString(), jsonResponse.get("sessionId").getAsString());
    assertTrue(jsonResponse.get("value").isJsonNull());
  }

  @Test
  public void doesNotRedirectForNewSessionsRequestedViaCrossDomainRpc()
      throws IOException, ServletException {
    JsonObject json = new JsonObject();
    json.addProperty("method", "POST");
    json.addProperty("path", "/session");
    JsonObject caps = new JsonObject();
    caps.addProperty(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);
    caps.addProperty(CapabilityType.VERSION, true);
    JsonObject data = new JsonObject();
    data.add("desiredCapabilities", caps);
    json.add("data", data);
    FakeHttpServletResponse response = sendCommand("POST", "/xdrpc", json);

    assertEquals(HttpServletResponse.SC_OK, response.getStatus());
    assertEquals("application/json; charset=utf-8",
        response.getHeader("content-type"));

    JsonObject jsonResponse = new JsonParser().parse(response.getBody()).getAsJsonObject();
    assertEquals(ErrorCodes.SUCCESS, jsonResponse.get("status").getAsInt());
    assertFalse(jsonResponse.get("sessionId").isJsonNull());

    JsonObject value = jsonResponse.get("value").getAsJsonObject();
    // values: browsername, version, remote session id.
    assertEquals(3, value.entrySet().size());
    assertEquals(BrowserType.FIREFOX, value.get(CapabilityType.BROWSER_NAME).getAsString());
    assertTrue(value.get(CapabilityType.VERSION).getAsBoolean());
  }

  @Test
  public void handlesInvalidCommandsToRootOfDriverService()
      throws IOException, ServletException {
    // Command path will be null in servlet API when request is to the context root (e.g. /wd/hub).
    FakeHttpServletResponse response = sendCommand("POST", null, new JsonObject());
    assertEquals(500, response.getStatus());

    JsonObject jsonResponse = new JsonParser().parse(response.getBody()).getAsJsonObject();
    assertEquals(ErrorCodes.UNKNOWN_COMMAND, jsonResponse.get("status").getAsInt());

    JsonObject value = jsonResponse.get("value").getAsJsonObject();
    assertTrue(value.get("message").getAsString().startsWith("POST /"));
  }

  private SessionId createSession() throws IOException, ServletException {
    FakeHttpServletResponse response = sendCommand("POST", "/session", null);

    assertEquals(HttpServletResponse.SC_OK, response.getStatus());

    Response resp = new JsonToBeanConverter().convert(
      Response.class, response.getBody());

    String sessionId = resp.getSessionId();
    assertNotNull(sessionId);
    assertFalse(sessionId.isEmpty());
    return new SessionId(sessionId);
  }

  private FakeHttpServletResponse sendCommand(String method, String commandPath,
      JsonObject parameters) throws IOException, ServletException {
    FakeHttpServletRequest request = new FakeHttpServletRequest(method, createUrl(commandPath));
    if (parameters != null) {
      request.setBody(parameters.toString());
    }

    FakeHttpServletResponse response = new FakeHttpServletResponse();

    driverServlet.service(request, response);
    return response;
  }

  private static UrlInfo createUrl(String path) {
    return new UrlInfo(BASE_URL, CONTEXT_PATH, path);
  }

  private static Supplier<DriverSessions> createSupplier(final DriverSessions sessions) {
    return new Supplier<DriverSessions>() {
      public DriverSessions get() {
        return sessions;
      }
    };
  }

  @Test
  public void timeouts() throws IOException, ServletException {
    assertEquals(2000, browserTimeout);
    assertEquals(18000, clientTimeout);
  }

}
