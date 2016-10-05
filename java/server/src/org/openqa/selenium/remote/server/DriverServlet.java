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

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Strings.nullToEmpty;
import static java.util.Collections.list;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Strings;
import com.google.common.base.Supplier;
import com.google.common.collect.ImmutableMap;
import com.google.common.io.ByteStreams;
import com.google.common.io.Files;
import com.google.common.net.HttpHeaders;
import com.google.common.net.MediaType;

import org.openqa.selenium.logging.LoggingHandler;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.server.log.LoggingManager;
import org.openqa.selenium.remote.server.log.PerSessionLogHandler;
import org.openqa.selenium.remote.server.xdrpc.CrossDomainRpc;
import org.openqa.selenium.remote.server.xdrpc.CrossDomainRpcLoader;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.util.Enumeration;
import java.util.concurrent.TimeUnit;
import java.util.logging.Handler;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DriverServlet extends HttpServlet {
  public static final String SESSIONS_KEY = DriverServlet.class.getName() + ".sessions";
  public static final String SESSION_TIMEOUT_PARAMETER = "webdriver.server.session.timeout";
  public static final String BROWSER_TIMEOUT_PARAMETER = "webdriver.server.browser.timeout";

  private static final String CROSS_DOMAIN_RPC_PATH = "/xdrpc";

  private final StaticResourceHandler staticResourceHandler = new StaticResourceHandler();

  private final Supplier<DriverSessions> sessionsSupplier;

  private SessionCleaner sessionCleaner;
  private JsonHttpCommandHandler commandHandler;

  public DriverServlet() {
    this.sessionsSupplier = new DriverSessionsSupplier();
  }

  @VisibleForTesting
  DriverServlet(Supplier<DriverSessions> sessionsSupplier) {
    this.sessionsSupplier = sessionsSupplier;
  }

  @Override
  public void init() throws ServletException {
    super.init();

    Logger logger = configureLogging();

    DriverSessions driverSessions = sessionsSupplier.get();
    commandHandler = new JsonHttpCommandHandler(driverSessions, logger);

    long sessionTimeOutInMs = getValueToUseInMs(SESSION_TIMEOUT_PARAMETER, 1800);
    long browserTimeoutInMs = getValueToUseInMs(BROWSER_TIMEOUT_PARAMETER, 0);

    if (sessionTimeOutInMs > 0 || browserTimeoutInMs > 0) {
      createSessionCleaner(logger, driverSessions, sessionTimeOutInMs, browserTimeoutInMs);
    }
  }

  private synchronized Logger configureLogging() {
    Logger logger = getLogger();
    logger.addHandler(LoggingHandler.getInstance());

    Logger rootLogger = Logger.getLogger("");
    boolean sessionLoggerAttached = false;
    for (Handler handler : rootLogger.getHandlers()) {
      sessionLoggerAttached |= handler instanceof PerSessionLogHandler;
    }
    if (!sessionLoggerAttached) {
      rootLogger.addHandler(LoggingManager.perSessionLogHandler());
    }

    return logger;
  }

  @VisibleForTesting
  protected void createSessionCleaner(Logger logger, DriverSessions driverSessions,
                                    long sessionTimeOutInMs, long browserTimeoutInMs) {
    sessionCleaner = new SessionCleaner(driverSessions, logger, sessionTimeOutInMs, browserTimeoutInMs);
    sessionCleaner.start();
  }

  private long getValueToUseInMs(String propertyName, long defaultValue) {
    long time = defaultValue;
    final String property = getServletContext().getInitParameter(propertyName);
    if (property != null) {
      time = Long.parseLong(property);
    }

    return TimeUnit.SECONDS.toMillis(time);
  }

  @Override
  public void destroy() {
    getLogger().removeHandler(LoggingHandler.getInstance());
    if (sessionCleaner != null) {
      sessionCleaner.stopCleaner();
    }
  }

  protected Logger getLogger() {
    return Logger.getLogger(getClass().getName());
  }

  @Override
  protected void service(HttpServletRequest request, HttpServletResponse response)
      throws IOException, ServletException {
    if (request.getHeader("Origin") != null) {
      setAccessControlHeaders(response);
    }
    // Make sure our browser-clients never cache responses.
    response.setHeader("Expires", "Thu, 01 Jan 1970 00:00:00 GMT");
    response.setHeader("Cache-Control", "no-cache");
    super.service(request, response);
  }

  /**
   * Sets access control headers to allow cross-origin resource sharing from
   * any origin.
   *
   * @param response The response to modify.
   * @see <a href="http://www.w3.org/TR/cors/">http://www.w3.org/TR/cors/</a>
   */
  private void setAccessControlHeaders(HttpServletResponse response) {
    response.setHeader("Access-Control-Allow-Origin", "*");  // Real safe.
    response.setHeader("Access-Control-Allow-Methods", "DELETE,GET,HEAD,POST");
    response.setHeader("Access-Control-Allow-Headers", "Accept,Content-Type");
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    if (request.getPathInfo() == null || "/".equals(request.getPathInfo())) {
      staticResourceHandler.redirectToHub(request, response);
    } else if (staticResourceHandler.isStaticResourceRequest(request)) {
      staticResourceHandler.service(request, response);
    } else {
      handleRequest(request, response);
    }
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    if (CROSS_DOMAIN_RPC_PATH.equalsIgnoreCase(request.getPathInfo())) {
      handleCrossDomainRpc(request, response);
    } else {
      handleRequest(request, response);
    }
  }

  @Override
  protected void doDelete(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    handleRequest(request, response);
  }

  private void handleCrossDomainRpc(
      HttpServletRequest servletRequest, HttpServletResponse servletResponse)
      throws ServletException, IOException {
    CrossDomainRpc rpc;

    try {
      rpc = new CrossDomainRpcLoader().loadRpc(servletRequest);
    } catch (IllegalArgumentException e) {
      servletResponse.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      servletResponse.getOutputStream().println(e.getMessage());
      servletResponse.getOutputStream().flush();
      return;
    }

    HttpRequest request = new HttpRequest(
        HttpMethod.valueOf(rpc.getMethod()),
        rpc.getPath());
    request.setHeader(HttpHeaders.CONTENT_TYPE, MediaType.JSON_UTF_8.toString());
    request.setContent(rpc.getContent());

    HttpResponse response = commandHandler.handleRequest(request);
    sendResponse(response, servletResponse);
  }

  protected void handleRequest(
      HttpServletRequest servletRequest, HttpServletResponse servletResponse)
      throws ServletException, IOException {
    HttpRequest request = createInternalRequest(servletRequest);
    HttpResponse response = commandHandler.handleRequest(request);
    sendResponse(response, servletResponse);
  }

  private static HttpRequest createInternalRequest(HttpServletRequest servletRequest)
      throws IOException {
    String path = servletRequest.getPathInfo();
    if (Strings.isNullOrEmpty(path)) {
      path = "/";
    }
    HttpRequest request = new HttpRequest(
        HttpMethod.valueOf(servletRequest.getMethod().toUpperCase()),
        path);

    @SuppressWarnings("unchecked")
    Enumeration<String> headerNames = servletRequest.getHeaderNames();
    for (String name : list(headerNames)) {
      @SuppressWarnings("unchecked")
      Enumeration<String> headerValues = servletRequest.getHeaders(name);
      for (String value : list(headerValues)) {
        request.setHeader(name, value);
      }
    }

    InputStream stream = null;
    try {
      stream = servletRequest.getInputStream();
      request.setContent(ByteStreams.toByteArray(stream));
    } finally {
      if (stream != null) {
        try {
          stream.close();
        } catch (IOException ignored) {
          // Do nothing.
        }
      }
    }

    return request;
  }

  private void sendResponse(HttpResponse response, HttpServletResponse servletResponse)
      throws IOException {
    servletResponse.setStatus(response.getStatus());
    for (String name : response.getHeaderNames()) {
      for (String value : response.getHeaders(name)) {
        servletResponse.addHeader(name, value);
      }
    }
    OutputStream output = servletResponse.getOutputStream();
    output.write(response.getContent());
    output.flush();
    output.close();
  }

  private class DriverSessionsSupplier implements Supplier<DriverSessions> {
    public DriverSessions get() {
      Object attribute = getServletContext().getAttribute(SESSIONS_KEY);
      if (attribute == null) {
        attribute = new DefaultDriverSessions();
      }
      return (DriverSessions) attribute;
    }
  }

  private static class StaticResourceHandler {
    private static final ImmutableMap<String, MediaType> MIME_TYPES = ImmutableMap.of(
        "css", MediaType.CSS_UTF_8.withoutParameters(),
        "html", MediaType.HTML_UTF_8.withoutParameters(),
        "js", MediaType.JAVASCRIPT_UTF_8.withoutParameters());

    private static final String STATIC_RESOURCE_BASE_PATH = "/static/resource/";
    private static final String HUB_HTML_PATH = STATIC_RESOURCE_BASE_PATH + "hub.html";

    public boolean isStaticResourceRequest(HttpServletRequest request) {
      return "GET".equalsIgnoreCase(request.getMethod())
             && nullToEmpty(request.getPathInfo()).startsWith(STATIC_RESOURCE_BASE_PATH);
    }

    public void redirectToHub(HttpServletRequest request, HttpServletResponse response)
        throws IOException {
      response.sendRedirect(request.getContextPath() + request.getServletPath() + HUB_HTML_PATH);
    }

    public void service(HttpServletRequest request, HttpServletResponse response)
        throws IOException {
      checkArgument(isStaticResourceRequest(request));

      String path = String.format(
          "/%s/%s",
          StaticResourceHandler.class.getPackage().getName().replace(".", "/"),
          request.getPathInfo().substring(STATIC_RESOURCE_BASE_PATH.length()));
      URL url = StaticResourceHandler.class.getResource(path);

      if (url == null) {
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }

      response.setStatus(HttpServletResponse.SC_OK);

      String extension = Files.getFileExtension(path);
      if (MIME_TYPES.containsKey(extension)) {
        response.setContentType(MIME_TYPES.get(extension).toString());
      }

      byte[] data = getResourceData(url);
      response.setContentLength(data.length);

      OutputStream output = response.getOutputStream();
      output.write(data);
      output.flush();
      output.close();
    }

    private byte[] getResourceData(URL url) throws IOException {
      InputStream stream = null;
      try {
        stream = url.openStream();
        return ByteStreams.toByteArray(stream);
      } finally {
        if (stream != null) {
          stream.close();
        }
      }
    }
  }
}
