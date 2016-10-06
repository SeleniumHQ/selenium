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

import com.beust.jcommander.JCommander;

import org.openqa.grid.internal.utils.configuration.StandaloneConfiguration;
import org.openqa.grid.shared.GridNodeServer;
import org.openqa.grid.web.servlet.DisplayHelpServlet;
import org.openqa.grid.web.servlet.beta.ConsoleServlet;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.handler.DeleteSession;
import org.seleniumhq.jetty9.server.Connector;
import org.seleniumhq.jetty9.server.HttpConfiguration;
import org.seleniumhq.jetty9.server.HttpConnectionFactory;
import org.seleniumhq.jetty9.server.Server;
import org.seleniumhq.jetty9.server.ServerConnector;
import org.seleniumhq.jetty9.servlet.ServletContextHandler;
import org.seleniumhq.jetty9.util.thread.QueuedThreadPool;

import java.util.Map;

import javax.servlet.Servlet;

/**
 * Provides a server that can launch and manage selenium sessions.
 */
public class SeleniumServer implements GridNodeServer {

  private Server server;
  private DefaultDriverSessions driverSessions;
  private StandaloneConfiguration configuration;
  private Map<String, Class<? extends Servlet>> extraServlets;

  private Thread shutDownHook;
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

  public void boot() {
    if (configuration.jettyMaxThreads != null && configuration.jettyMaxThreads > 0) {
      server = new Server(new QueuedThreadPool(configuration.jettyMaxThreads));
    } else {
      server = new Server();
    }

    ServletContextHandler handler = new ServletContextHandler();

    driverSessions = new DefaultDriverSessions();
    handler.setAttribute(DriverServlet.SESSIONS_KEY, driverSessions);
    handler.setContextPath("/");
    handler.addServlet(DriverServlet.class, "/wd/hub/*");
    handler.setInitParameter(ConsoleServlet.CONSOLE_PATH_PARAMETER, "/wd/hub");

    handler.setInitParameter(DisplayHelpServlet.HELPER_TYPE_PARAMETER, configuration.role);

    if (configuration.browserTimeout != null) {
      handler.setInitParameter(DriverServlet.BROWSER_TIMEOUT_PARAMETER,
                               String.valueOf(configuration.browserTimeout));
    }
    if (configuration.timeout != null) {
      handler.setInitParameter(DriverServlet.SESSION_TIMEOUT_PARAMETER,
                               String.valueOf(configuration.timeout));
    }

    addRcSupport(handler);
    addExtraServlets(handler);

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
      throw new RuntimeException(e);
    }
  }

  private class ShutDownHook implements Runnable {
    private final SeleniumServer selenium;

    ShutDownHook(SeleniumServer selenium) {
      this.selenium = selenium;
    }

    public void run() {
      selenium.stop();
    }
  }

  /**
   * Stops the Jetty server
   */
  public void stop() {
    int numTries = 0;
    Exception shutDownException = null;

    // this may be called by a shutdown hook, or it may be called at any time
    // in case it was called as an ordinary method, try to clean up the shutdown
    // hook
    try {
      if (shutDownHook != null) {
        Runtime.getRuntime().removeShutdownHook(shutDownHook);
      }
    } catch (IllegalStateException ignored) {
    } // thrown if we're shutting down; that's OK

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
    for (SessionId sessionId : driverSessions.getSessions()) {
      Session session = driverSessions.get(sessionId);
      DeleteSession deleteSession = new DeleteSession(session);
      try {
        deleteSession.call();
        driverSessions.deleteSession(sessionId);
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    }
  }

  public static void main(String[] argv) {
    StandaloneConfiguration configuration = new StandaloneConfiguration();
    JCommander jCommander = new JCommander(configuration, argv);
    jCommander.setProgramName("selenium-3-server");

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
