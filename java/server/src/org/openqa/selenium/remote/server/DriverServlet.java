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

import static com.google.common.net.MediaType.JSON_UTF_8;
import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.nio.charset.StandardCharsets.UTF_8;
import static java.util.concurrent.TimeUnit.MILLISECONDS;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.net.HttpHeaders;
import com.google.common.net.MediaType;

import org.openqa.selenium.Platform;
import org.openqa.selenium.logging.LoggingHandler;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.log.LoggingManager;
import org.openqa.selenium.remote.server.log.PerSessionLogHandler;
import org.openqa.selenium.remote.server.xdrpc.CrossDomainRpc;
import org.openqa.selenium.remote.server.xdrpc.CrossDomainRpcLoader;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.function.Supplier;
import java.util.logging.Handler;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;

public class DriverServlet extends HttpServlet {
  public static final String SESSIONS_KEY = DriverServlet.class.getName() + ".sessions";
  public static final String SESSION_TIMEOUT_PARAMETER = "webdriver.server.session.timeout";
  public static final String BROWSER_TIMEOUT_PARAMETER = "webdriver.server.browser.timeout";

  private static final String CROSS_DOMAIN_RPC_PATH = "/xdrpc";

  private final StaticResourceHandler staticResourceHandler = new StaticResourceHandler();

  private final ExecutorService executor = Executors.newCachedThreadPool();
  private final Supplier<DriverSessions> sessionsSupplier;
  private final ErrorCodes errorCodes = new ErrorCodes();

  private JsonHttpCommandHandler commandHandler;
  private long individualCommandTimeoutMs;
  private long inactiveSessionTimeoutMs;


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

    inactiveSessionTimeoutMs = getValueToUseInMs(SESSION_TIMEOUT_PARAMETER, 1800);
    individualCommandTimeoutMs = getValueToUseInMs(BROWSER_TIMEOUT_PARAMETER, 0);

    // Alright. It's nonsense that the individualCommandTimeout isn't a sensible value.
    if (individualCommandTimeoutMs == 0) {
      individualCommandTimeoutMs = Math.min(inactiveSessionTimeoutMs, Long.MAX_VALUE);
    }
  }

  @VisibleForTesting
  long getInactiveSessionTimeout() {
    return inactiveSessionTimeoutMs;
  }

  @VisibleForTesting
  long getIndividualCommandTimeoutMs() {
    return individualCommandTimeoutMs;
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

    servletRequest.setAttribute(HttpHeaders.CONTENT_TYPE, MediaType.JSON_UTF_8.toString());
    HttpServletRequestWrapper wrapper = new HttpServletRequestWrapper(servletRequest) {
      @Override
      public String getMethod() {
        return rpc.getMethod();
      }

      @Override
      public String getPathInfo() {
        return rpc.getPath();
      }

      @Override
      public ServletInputStream getInputStream() throws IOException {
        return new InputStreamWrappingServletInputStream(
            new ByteArrayInputStream(rpc.getContent()));
      }
    };

    handleRequest(wrapper, servletResponse);
  }

  protected void handleRequest(
      HttpServletRequest servletRequest, HttpServletResponse servletResponse)
      throws ServletException, IOException {
    // Attempt to determine the session ID, should it exist. We'll need this to kill it later if
    // something goes awry. This is a bit of a hack, but it works for every command in the official
    // server.
    String sessionId = "unknown";
    String info = servletRequest.getPathInfo();
    Matcher matcher = Pattern.compile("^.*/session/([^/]+)").matcher(info == null ? "" : info);
    if (matcher.find()) {
      sessionId = matcher.group(1);
    }

    // Execute the command on a background thread so we can cancel it if necessary
    Future<?> future = executor.submit(() -> {
      String originalThreadName = Thread.currentThread().getName();
      Thread.currentThread().setName("Selenium Server handling " + servletRequest.getPathInfo());
      try {
        commandHandler.handleRequest(
            new ServletRequestWrappingHttpRequest(servletRequest),
            new ServletResponseWrappingHttpResponse(servletResponse));
      } catch (IOException e) {
        servletResponse.reset();
        throw new RuntimeException(e);
      } catch (Throwable e) {
        writeThrowable(servletResponse, e);
      } finally {
        Thread.currentThread().setName(originalThreadName);
      }
    });
    try {
      future.get(getIndividualCommandTimeoutMs(), MILLISECONDS);
    } catch (InterruptedException e) {
      writeThrowable(servletResponse, e);
    } catch (ExecutionException e) {
      writeThrowable(servletResponse, Throwables.getRootCause(e));
    } catch (TimeoutException e) {
      writeThrowable(
          servletResponse,
          new org.openqa.selenium.TimeoutException(
              "Command timed out in client when executing: " + servletRequest.getPathInfo()));
      sessionsSupplier.get().deleteSession(new SessionId(sessionId));
    }
  }

  private void writeThrowable(HttpServletResponse resp, Throwable e) {
    int errorCode = errorCodes.toStatusCode(e);
    String error = errorCodes.toState(errorCode);
    ImmutableMap<String, Object> value = ImmutableMap.of(
        "status", errorCode,
        "value", ImmutableMap.of(
            "error", error,
            "message", e.getMessage() == null ? "" : e.getMessage(),
            "stacktrace", Throwables.getStackTraceAsString(e),
            "stackTrace", Stream.of(e.getStackTrace())
                .map(element -> ImmutableMap.of(
                    "fileName", element.getFileName(),
                    "className", element.getClassName(),
                    "methodName", element.getMethodName(),
                    "lineNumber", element.getLineNumber()))
                .collect(ImmutableList.toImmutableList())));

    byte[] bytes = new BeanToJsonConverter().convert(value).getBytes(UTF_8);

    try {
      resp.setStatus(HTTP_INTERNAL_ERROR);

      resp.setHeader("Content-Type", JSON_UTF_8.toString());
      resp.setHeader("Content-Length", String.valueOf(bytes.length));

      resp.getOutputStream().write(bytes);
    } catch (RuntimeException | IOException e2) {
      // Swallow. We've done all we can
      log("Unable to send response", e2);
    }
  }

  private class DriverSessionsSupplier implements Supplier<DriverSessions> {
    public DriverSessions get() {
      Object attribute = getServletContext().getAttribute(SESSIONS_KEY);
      if (attribute == null) {
        attribute = new DefaultDriverSessions(
            new DefaultDriverFactory(Platform.getCurrent()),
            getInactiveSessionTimeout());
      }
      return (DriverSessions) attribute;
    }
  }
}
