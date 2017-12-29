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

import static org.openqa.selenium.remote.server.WebDriverServlet.ACTIVE_SESSIONS_KEY;
import static org.openqa.selenium.remote.server.WebDriverServlet.NEW_SESSION_PIPELINE_KEY;

import com.beust.jcommander.JCommander;

import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.grid.internal.utils.configuration.StandaloneConfiguration;
import org.openqa.grid.selenium.node.ChromeMutator;
import org.openqa.grid.selenium.node.FirefoxMutator;
import org.openqa.grid.shared.GridNodeServer;
import org.openqa.grid.web.servlet.DisplayHelpServlet;
import org.openqa.grid.web.servlet.beta.ConsoleServlet;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.remote.server.jmx.JMXHelper;
import org.openqa.selenium.remote.server.jmx.ManagedService;
import org.seleniumhq.jetty9.security.ConstraintMapping;
import org.seleniumhq.jetty9.security.ConstraintSecurityHandler;
import org.seleniumhq.jetty9.server.Connector;
import org.seleniumhq.jetty9.server.Handler;
import org.seleniumhq.jetty9.server.HttpConfiguration;
import org.seleniumhq.jetty9.server.HttpConnectionFactory;
import org.seleniumhq.jetty9.server.Server;
import org.seleniumhq.jetty9.server.ServerConnector;
import org.seleniumhq.jetty9.server.handler.ContextHandler;
import org.seleniumhq.jetty9.servlet.ServletContextHandler;
import org.seleniumhq.jetty9.util.security.Constraint;
import org.seleniumhq.jetty9.util.thread.QueuedThreadPool;

import java.net.BindException;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import javax.servlet.Servlet;

/**
 * Provides a server that can launch and manage selenium sessions.
 */
@ManagedService(objectName = "org.seleniumhq.server:type=SeleniumServer")
public class SeleniumServer implements GridNodeServer {

  private final static Logger LOG = Logger.getLogger(SeleniumServer.class.getName());

  private Server server;
  private StandaloneConfiguration configuration;
  private Map<String, Class<? extends Servlet>> extraServlets;

  /**
   * This lock is very important to ensure that SeleniumServer and the underlying Jetty instance
   * shuts down properly. It ensures that ProxyHandler does not add an SslRelay to the Jetty server
   * dynamically (needed for SSL proxying) if the server has been shut down or is in the process of
   * getting shut down.
   */
  private final Object shutdownLock = new Object();
  private static final int MAX_SHUTDOWN_RETRIES = 8;


  public SeleniumServer(StandaloneConfiguration configuration) {
    this.configuration = configuration;

    new JMXHelper().register(this);
  }

  public int getRealPort() {
    if (server.isStarted()) {
      ServerConnector socket = (ServerConnector)server.getConnectors()[0];
      return socket.getPort();
    }
    return configuration.port;
  }


  private void addRcSupport(ServletContextHandler handler) {
    try {
      Class<? extends Servlet> rcServlet = Class.forName(
        "com.thoughtworks.selenium.webdriven.WebDriverBackedSeleniumServlet",
        false,
        getClass().getClassLoader())
        .asSubclass(Servlet.class);
      handler.addServlet(rcServlet, "/selenium-server/driver/");
      LOG.info("Bound legacy RC support");
    } catch (ClassNotFoundException e) {
      // Do nothing.
    }
  }

  private void addExtraServlets(ServletContextHandler handler) {
    if (extraServlets != null && extraServlets.size() > 0) {
      for (String path : extraServlets.keySet()) {
        handler.addServlet(extraServlets.get(path), path);
      }
    }
  }

  public void setConfiguration(StandaloneConfiguration configuration) {
    this.configuration = configuration;
  }

  public void setExtraServlets(Map<String, Class<? extends Servlet>> extraServlets) {
    this.extraServlets = extraServlets;
  }

  public boolean boot() {
    if (configuration.jettyMaxThreads != null && configuration.jettyMaxThreads > 0) {
      server = new Server(new QueuedThreadPool(configuration.jettyMaxThreads));
    } else {
      server = new Server();
    }

    ServletContextHandler handler = new ServletContextHandler(ServletContextHandler.SECURITY);

    if (configuration.browserTimeout != null && configuration.browserTimeout >= 0) {
      handler.setInitParameter(WebDriverServlet.BROWSER_TIMEOUT_PARAMETER,
                               String.valueOf(configuration.browserTimeout));
    }

    long inactiveSessionTimeoutSeconds = configuration.timeout == null ?
                                   Long.MAX_VALUE / 1000 : configuration.timeout;
    if (configuration.timeout != null && configuration.timeout >= 0) {
      handler.setInitParameter(WebDriverServlet.SESSION_TIMEOUT_PARAMETER,
                               String.valueOf(inactiveSessionTimeoutSeconds));
    }

    NewSessionPipeline pipeline = createPipeline(configuration);
    handler.setAttribute(NEW_SESSION_PIPELINE_KEY, pipeline);

    handler.setContextPath("/");
    LOG.info("Using passthrough mode handler");
    handler.addServlet(WebDriverServlet.class, "/wd/hub/*");
    handler.addServlet(WebDriverServlet.class, "/webdriver/*");
    handler.setInitParameter(ConsoleServlet.CONSOLE_PATH_PARAMETER, "/wd/hub");

    handler.setInitParameter(DisplayHelpServlet.HELPER_TYPE_PARAMETER, configuration.role);

    addRcSupport(handler);
    addExtraServlets(handler);

    Constraint constraint = new Constraint();
    constraint.setName("Disable TRACE");
    constraint.setAuthenticate(true);

    ConstraintMapping mapping = new ConstraintMapping();
    mapping.setConstraint(constraint);
    mapping.setMethod("TRACE");
    mapping.setPathSpec("/");

    ConstraintSecurityHandler securityHandler = (ConstraintSecurityHandler) handler.getSecurityHandler();
    securityHandler.addConstraintMapping(mapping);

    server.setHandler(handler);

    HttpConfiguration httpConfig = new HttpConfiguration();
    httpConfig.setSecureScheme("https");

    ServerConnector http = new ServerConnector(server, new HttpConnectionFactory(httpConfig));
    if (configuration.port == null) {
      configuration.port = 4444;
    }
    http.setPort(configuration.port);
    http.setIdleTimeout(500000);

    server.setConnectors(new Connector[]{http});

    try {
      server.start();
    } catch (Exception e) {
      try {
        server.stop();
      } catch (Exception ignore) {
      }
      if (e instanceof BindException) {
        LOG.severe(String.format(
            "Port %s is busy, please choose a free port and specify it using -port option", configuration.port));
        return false;
      } else {
        throw new RuntimeException(e);
      }
    }

    LOG.info(String.format("Selenium Server is up and running on port %s", configuration.port));
    return true;
  }

  private NewSessionPipeline createPipeline(StandaloneConfiguration configuration) {
    NewSessionPipeline.Builder builder = DefaultPipeline.createPipelineWithDefaultFallbacks();

    if (configuration instanceof GridNodeConfiguration) {
      ((GridNodeConfiguration) configuration).capabilities.forEach(
          caps -> {
            builder.addCapabilitiesMutator(new ChromeMutator(caps));
            builder.addCapabilitiesMutator(new FirefoxMutator(caps));
            builder.addCapabilitiesMutator(c -> new ImmutableCapabilities(c.asMap().entrySet().stream()
                .filter(e -> ! e.getKey().startsWith("se:"))
                .filter(e -> e.getValue() != null)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue))));
          }
      );
    }

    return builder.create();
  }

  /**
   * Stops the Jetty server
   */
  public void stop() {
    int numTries = 0;
    Exception shutDownException = null;

    // shut down the jetty server (try try again)
    while (numTries <= MAX_SHUTDOWN_RETRIES) {
      ++numTries;
      try {
        // see docs for the lock object for information on this and why it is IMPORTANT!
        synchronized (shutdownLock) {
          server.stop();
        }

        // If we reached here stop didnt throw an exception.
        // So we assume it was successful.
        break;
      } catch (Exception ex) { // org.openqa.jetty.jetty.Server.stop() throws Exception
        shutDownException = ex;
        // If Exception is thrown we try to stop the jetty server again
      }
    }

    // next, stop all of the browser sessions.
    stopAllBrowsers();

    if (numTries > MAX_SHUTDOWN_RETRIES) { // This is bad!! Jetty didnt shutdown..
      if (null != shutDownException) {
        throw new RuntimeException(shutDownException);
      }
    }
  }

  private void stopAllBrowsers() {
    for (Handler handler : server.getHandlers()) {
      if (!(handler instanceof ServletContextHandler)) {
        continue;
      }

      ContextHandler.Context context = ((ServletContextHandler) handler).getServletContext();
      if (context == null) {
        continue;
      }
      Object value = context.getAttribute(ACTIVE_SESSIONS_KEY);
      if (value instanceof ActiveSessions) {
        ((ActiveSessions) value).getAllSessions().parallelStream()
            .forEach(session -> {
              try {
                session.stop();
              } catch (Exception ignored) {
                // Ignored
              }
            });
      }
    }
  }

  public static void main(String[] argv) {
    StandaloneConfiguration configuration = new StandaloneConfiguration();
    JCommander jCommander = JCommander.newBuilder().addObject(configuration).build();
    jCommander.setProgramName("selenium-3-server");
    jCommander.parse(argv);

    if (configuration.help) {
      StringBuilder message = new StringBuilder();
      jCommander.usage(message);
      System.err.println(message.toString());
      return;
    }

    SeleniumServer server = new SeleniumServer(configuration);
    server.boot();
  }

  public static void usage(String msg) {
    if (msg != null) {
      System.out.println(msg);
    }
    StandaloneConfiguration args = new StandaloneConfiguration();
    JCommander jCommander = new JCommander(args);
    jCommander.usage();
  }
}
