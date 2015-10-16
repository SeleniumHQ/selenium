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

import org.openqa.grid.shared.IServer;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.handler.DeleteSession;
import org.seleniumhq.jetty9.server.Connector;
import org.seleniumhq.jetty9.server.HttpConfiguration;
import org.seleniumhq.jetty9.server.HttpConnectionFactory;
import org.seleniumhq.jetty9.server.Server;
import org.seleniumhq.jetty9.server.ServerConnector;
import org.seleniumhq.jetty9.servlet.ServletContextHandler;
import org.seleniumhq.jetty9.util.thread.QueuedThreadPool;

import javax.servlet.Servlet;

/**
 * Provides a server that can launch and manage selenium sessions.
 */
public class SeleniumServer implements IServer {

  private final int port;
  private int threadCount;
  private Server server;
  private DefaultDriverSessions driverSessions;

  private Thread shutDownHook;
  /**
   * This lock is very important to ensure that SeleniumServer and the underlying Jetty instance
   * shuts down properly. It ensures that ProxyHandler does not add an SslRelay to the Jetty server
   * dynamically (needed for SSL proxying) if the server has been shut down or is in the process of
   * getting shut down.
   */
  private final Object shutdownLock = new Object();
  private static final int MAX_SHUTDOWN_RETRIES = 8;


  public SeleniumServer(int port) {
    this.port = port;
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

  private void setThreadCount(int threadCount) {
    this.threadCount = threadCount;
  }

  public void boot() {
    if (threadCount > 0) {
      server = new Server(new QueuedThreadPool(threadCount));
    } else {
      server = new Server();
    }

    ServletContextHandler handler = new ServletContextHandler();

    driverSessions = new DefaultDriverSessions();
    handler.setAttribute(DriverServlet.SESSIONS_KEY, driverSessions);
    handler.setContextPath("/");
    handler.addServlet(DriverServlet.class, "/wd/hub/*");
    addRcSupport(handler);

    server.setHandler(handler);

    HttpConfiguration httpConfig = new HttpConfiguration();
    httpConfig.setSecureScheme("https");

    ServerConnector http = new ServerConnector(server, new HttpConnectionFactory(httpConfig));
    http.setPort(port);
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
    CommandLineArgs args = new CommandLineArgs();
    JCommander jCommander = new JCommander(args, argv);
    jCommander.setProgramName("selenium-3-server");

    if (args.help) {
      StringBuilder message = new StringBuilder();
      jCommander.usage(message);
      System.err.println(message.toString());
      return;
    }

    SeleniumServer server = new SeleniumServer(args.port);
    server.setThreadCount(args.jettyThreads);
    server.boot();
  }

  public static void usage(String msg) {
    if (msg != null) {
      System.out.println(msg);
    }
    CommandLineArgs args = new CommandLineArgs();
    JCommander jCommander = new JCommander(args);
    jCommander.usage();
  }
}
