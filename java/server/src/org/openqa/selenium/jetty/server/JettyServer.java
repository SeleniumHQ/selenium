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

package org.openqa.selenium.jetty.server;

import org.eclipse.jetty.security.ConstraintMapping;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.HttpConfiguration;
import org.eclipse.jetty.server.HttpConnectionFactory;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.servlet.FilterHolder;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.eclipse.jetty.servlets.CrossOriginFilter;
import org.eclipse.jetty.util.log.JavaUtilLog;
import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.security.Constraint;
import org.eclipse.jetty.util.thread.QueuedThreadPool;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.grid.server.AddWebDriverSpecHeaders;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.server.WrapExceptions;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.HttpHandler;

import javax.servlet.DispatcherType;
import java.io.UncheckedIOException;
import java.net.BindException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.EnumSet;
import java.util.Objects;
import java.util.logging.Logger;

import static java.util.concurrent.TimeUnit.SECONDS;

public class JettyServer implements Server<JettyServer> {

  private static final Logger LOG = Logger.getLogger(JettyServer.class.getName());
  private static final int MAX_SHUTDOWN_RETRIES = 8;

  private final org.eclipse.jetty.server.Server server;
  private final ServletContextHandler servletContextHandler;
  private final URL url;
  private final HttpHandler handler;

  public JettyServer(BaseServerOptions options, HttpHandler handler) {
    this.handler = Objects.requireNonNull(handler, "Handler to use must be set.");
    int port = options.getPort() == 0 ? PortProber.findFreePort() : options.getPort();

    String host = options.getHostname().orElseGet(() -> {
      try {
        return new NetworkUtils().getNonLoopbackAddressOfThisMachine();
      } catch (WebDriverException ignored) {
        return "localhost";
      }
    });

    try {
      this.url = new URL("http", host, port, "");
    } catch (MalformedURLException e) {
      throw new UncheckedIOException(e);
    }

    Log.setLog(new JavaUtilLog());
    this.server = new org.eclipse.jetty.server.Server(
        new QueuedThreadPool(options.getMaxServerThreads()));

    this.servletContextHandler = new ServletContextHandler(ServletContextHandler.SECURITY);
    ConstraintSecurityHandler
        securityHandler =
        (ConstraintSecurityHandler) servletContextHandler.getSecurityHandler();

    Constraint disableTrace = new Constraint();
    disableTrace.setName("Disable TRACE");
    disableTrace.setAuthenticate(true);
    ConstraintMapping disableTraceMapping = new ConstraintMapping();
    disableTraceMapping.setConstraint(disableTrace);
    disableTraceMapping.setMethod("TRACE");
    disableTraceMapping.setPathSpec("/");
    securityHandler.addConstraintMapping(disableTraceMapping);

    Constraint enableOther = new Constraint();
    enableOther.setName("Enable everything but TRACE");
    ConstraintMapping enableOtherMapping = new ConstraintMapping();
    enableOtherMapping.setConstraint(enableOther);
    enableOtherMapping.setMethodOmissions(new String[]{"TRACE"});
    enableOtherMapping.setPathSpec("/");
    securityHandler.addConstraintMapping(enableOtherMapping);

    // Allow CORS: Whether the Selenium server should allow web browser connections from any host
    if (options.getAllowCORS()) {
      FilterHolder
          filterHolder = servletContextHandler.addFilter(CrossOriginFilter.class, "/*", EnumSet
          .of(DispatcherType.REQUEST));
      filterHolder.setInitParameter("allowedMethods", "GET,POST,PUT,DELETE,HEAD");

      // Warning user
      LOG.warning("You have enabled CORS requests from any host. "
                  + "Be careful not to visit sites which could maliciously "
                  + "try to start Selenium sessions on your machine");
    }

    server.setHandler(servletContextHandler);

    HttpConfiguration httpConfig = new HttpConfiguration();
    httpConfig.setSecureScheme("https");

    ServerConnector http = new ServerConnector(server, new HttpConnectionFactory(httpConfig));
    options.getHostname().ifPresent(http::setHost);
    http.setPort(getUrl().getPort());

    http.setIdleTimeout(500000);

    server.setConnectors(new Connector[]{http});
  }

  @Override
  public boolean isStarted() {
    return server.isStarted();
  }

  @Override
  public JettyServer start() {
    try {
      // If there are no routes, we've done something terribly wrong.
      if (handler == null) {
        throw new IllegalStateException("There must be at least one route specified");
      }

      servletContextHandler.addServlet(
        new ServletHolder(new HttpHandlerServlet(handler.with(new WrapExceptions().andThen(new AddWebDriverSpecHeaders())))),
        "/*");

      server.start();

      PortProber.waitForPortUp(getUrl().getPort(), 10, SECONDS);

      return this;
    } catch (Exception e) {
      try {
        stop();
      } catch (Exception ignore) {
      }
      if (e instanceof BindException) {
        LOG.severe(String.format(
            "Port %s is busy, please choose a free port and specify it using -port option",
            getUrl().getPort()));
      }
      if (e instanceof RuntimeException) {
        throw (RuntimeException) e;
      }
      throw new RuntimeException(e);
    }
  }

  @Override
  public void stop() {
    int numTries = 0;
    Exception shutDownException = null;

    // shut down the jetty server (try try again)
    while (numTries <= MAX_SHUTDOWN_RETRIES) {
      numTries++;
      try {
        server.stop();

        // If we reached here stop didn't throw an exception, so we can assume success.
        return;
      } catch (Exception ex) { // org.openqa.jetty.jetty.Server.stop() throws Exception
        shutDownException = ex;
        // If Exception is thrown we try to stop the jetty server again
      }
    }

    // This is bad!! Jetty didn't shutdown.
    throw new RuntimeException(shutDownException);
  }

  @Override
  public URL getUrl() {
    return url;
  }
}
