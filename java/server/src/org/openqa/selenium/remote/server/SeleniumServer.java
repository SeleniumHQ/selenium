package org.openqa.selenium.remote.server;

import com.beust.jcommander.JCommander;

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
public class SeleniumServer {

  private final int port;
  private int threadCount;
  private Server server;

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

  public void start() {
    if (threadCount > 0) {
      server = new Server(new QueuedThreadPool(threadCount));
    } else {
      server = new Server();
    }

    ServletContextHandler handler = new ServletContextHandler();

    DefaultDriverSessions webdriverSessions = new DefaultDriverSessions();
    handler.setAttribute(DriverServlet.SESSIONS_KEY, webdriverSessions);
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
    server.start();
  }

}
