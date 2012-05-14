/*
Copyright 2007-2011 Selenium committers

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

import java.io.IOException;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.openqa.selenium.logging.LoggingHandler;
import org.openqa.selenium.remote.SessionTerminatedException;
import org.openqa.selenium.remote.server.rest.RestishHandler;
import org.openqa.selenium.remote.server.rest.ResultConfig;
import org.openqa.selenium.remote.server.xdrpc.CrossDomainRpc;
import org.openqa.selenium.remote.server.xdrpc.CrossDomainRpcLoader;
import org.openqa.selenium.remote.server.xdrpc.HttpServletRequestProxy;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Supplier;

public class DriverServlet extends HttpServlet {
  public static final String SESSIONS_KEY = DriverServlet.class.getName() + ".sessions";

  private static final String CROSS_DOMAIN_RPC_PATH = "/xdrpc";

  private final Supplier<DriverSessions> sessionsSupplier;

  private SessionCleaner sessionCleaner;
  private JsonHttpRemoteConfig mappings;

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

    Logger logger = getLogger();
    logger.addHandler(LoggingHandler.getInstance());

    DriverSessions driverSessions = sessionsSupplier.get();
    mappings = new JsonHttpRemoteConfig(driverSessions, logger);

    long sessionTimeOutInMs = getValueToUseInMs("webdriver.server.session.timeout", 1800);
    long browserTimeoutInMs = getValueToUseInMs("webdriver.server.browser.timeout", 0);

    if (sessionTimeOutInMs > 0 || browserTimeoutInMs > 0) {
      createSessionCleaner(logger, driverSessions, sessionTimeOutInMs, browserTimeoutInMs);
    }
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

  /**
   * @deprecated Use {@link JsonHttpRemoteConfig} instead.
   */
  @Deprecated
  protected ResultConfig addNewGetMapping(String path, Class<? extends RestishHandler> implementationClass) {
    return mappings.addNewGetMapping(path, implementationClass);
  }

  /**
   * @deprecated Use {@link JsonHttpRemoteConfig} instead.
   */
  @Deprecated
  protected ResultConfig addNewPostMapping(String path, Class<? extends RestishHandler> implementationClass) {
    return mappings.addNewPostMapping(path, implementationClass);
  }

  /**
   * @deprecated Use {@link JsonHttpRemoteConfig} instead.
   */
  @Deprecated
  protected ResultConfig addNewDeleteMapping(String path,
      Class<? extends RestishHandler> implementationClass) {
    return mappings.addNewDeleteMapping(path, implementationClass);
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
    handleRequest(request, response);
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

  private void handleCrossDomainRpc(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    CrossDomainRpc rpc;

    try {
      rpc = new CrossDomainRpcLoader().loadRpc(request);
    } catch (IllegalArgumentException e) {
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      response.getOutputStream().println(e.getMessage());
      response.getOutputStream().flush();
      return;
    }

    request = HttpServletRequestProxy.createProxy(request, rpc,
        CROSS_DOMAIN_RPC_PATH, MimeType.CROSS_DOMAIN_RPC);
    handleRequest(request, response);
  }

  protected void handleRequest(HttpServletRequest request, HttpServletResponse response)
      throws ServletException {
    try {
      HttpRequest req = new JeeServletHttpRequest(request);
      HttpResponse res = new JeeServletHttpResponse(response);

      mappings.handleRequest(req, res);
    } catch (SessionTerminatedException e){
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
    } catch (Exception e) {
      log("Fatal, unhandled exception: " + request.getPathInfo() + ": " + e);
      throw new ServletException(e);
    }
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
}
