/*
 Copyright 2011 Software Freedom Conservancy.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

package org.openqa.selenium.remote.server;

import com.google.common.base.Supplier;
import com.google.common.collect.Iterators;

import org.jmock.Expectations;
import org.jmock.Mockery;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.testing.FakeHttpServletRequest;
import org.openqa.selenium.remote.server.testing.FakeHttpServletResponse;
import org.openqa.selenium.remote.server.testing.TestSessions;
import org.openqa.selenium.remote.server.testing.UrlInfo;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.seleniumhq.jetty7.server.handler.ContextHandler;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class DriverServletTest {
  
  private static final String BASE_URL = "http://localhost:4444";
  private static final String CONTEXT_PATH = "/wd/hub";

  private Mockery mockery;
  private TestSessions testSessions;
  private DriverServlet driverServlet;
  private long clientTimeout;
  private long browserTimeout;

  @Before
  public void setUp() throws ServletException {
    mockery = new Mockery();
    testSessions = new TestSessions(mockery);

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
        servletContext.setAttribute(RemoteControlConfiguration.KEY,
                                    new RemoteControlConfiguration());
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
  public void navigateToUrlCommandHandler() throws IOException, ServletException, JSONException {
    final SessionId sessionId = createSession();

    mockery.checking(new Expectations() {{
      one(testSessions.get(sessionId).getDriver()).get("http://www.google.com");
    }});

    FakeHttpServletResponse response = sendCommand("POST",
        String.format("/session/%s/url", sessionId),
        new JSONObject().put("url", "http://www.google.com"));

    assertEquals(HttpServletResponse.SC_NO_CONTENT, response.getStatus());
    mockery.assertIsSatisfied();
  }

  @Test
  public void reportsBadRequestForMalformedCrossDomainRpcs()
      throws IOException, ServletException {
    FakeHttpServletResponse response = sendCommand("POST", "/xdrpc",
        new JSONObject());

    assertEquals(HttpServletResponse.SC_BAD_REQUEST, response.getStatus());
    assertEquals("Missing required parameter: method\r\n", response.getBody());
  }

  @Test
  public void handlesWelformedAndSuccessfulCrossDomainRpcs()
      throws IOException, ServletException, JSONException {
    final SessionId sessionId = createSession();

    mockery.checking(new Expectations() {{
      one(testSessions.get(sessionId).getDriver()).get("http://www.google.com");
    }});

    FakeHttpServletResponse response = sendCommand("POST", "/xdrpc",
        new JSONObject()
            .put("method", "POST")
            .put("path", String.format("/session/%s/url", sessionId))
            .put("data", new JSONObject()
                .put("url", "http://www.google.com")));

    mockery.assertIsSatisfied();
    assertEquals(HttpServletResponse.SC_OK, response.getStatus());
    assertEquals("application/json; charset=UTF-8",
        response.getHeader("content-type"));

    JSONObject jsonResponse = new JSONObject(response.getBody());
    assertEquals(ErrorCodes.SUCCESS, jsonResponse.getInt("status"));
    assertEquals(sessionId.toString(), jsonResponse.getString("sessionId"));
    assertTrue(jsonResponse.isNull("value"));
  }

  @Test
  public void doesNotRedirectForNewSessionsRequestedViaCrossDomainRpc()
      throws JSONException, IOException, ServletException {
    FakeHttpServletResponse response = sendCommand("POST",
        String.format("/xdrpc"),
        new JSONObject()
            .put("method", "POST")
            .put("path", "/session")
            .put("data", new JSONObject()
                .put("desiredCapabilities", new JSONObject()
                    .put("browserName", "firefox")
                    .put("version", true))));

    mockery.assertIsSatisfied();
    assertEquals(HttpServletResponse.SC_OK, response.getStatus());
    assertEquals("application/json; charset=UTF-8",
        response.getHeader("content-type"));

    JSONObject jsonResponse = new JSONObject(response.getBody());
    assertEquals(ErrorCodes.SUCCESS, jsonResponse.getInt("status"));
    assertFalse(jsonResponse.isNull("sessionId"));

    JSONObject value = jsonResponse.getJSONObject("value");
    assertEquals(2, Iterators.size(value.keys()));
    assertEquals("firefox", value.getString("browserName"));
    assertTrue(value.getBoolean("version"));
  }

  private SessionId createSession() throws IOException, ServletException {
    FakeHttpServletResponse response = sendCommand("POST", "/session", null);

    assertEquals(HttpServletResponse.SC_SEE_OTHER, response.getStatus());

    String location = response.getHeader("location");
    assertNotNull(location);
    assertTrue(location.startsWith("/wd/hub/session/"));
    
    String sessionId = location.substring("/wd/hub/session/".length());
    assertFalse(sessionId.isEmpty());
    return new SessionId(sessionId);
  }
  
  private FakeHttpServletResponse sendCommand(String method, String commandPath,
      JSONObject parameters) throws IOException, ServletException {
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
  public void timeouts() throws IOException, ServletException, JSONException {
    assertEquals(2000, browserTimeout);
    assertEquals(18000, clientTimeout);
  }

}
