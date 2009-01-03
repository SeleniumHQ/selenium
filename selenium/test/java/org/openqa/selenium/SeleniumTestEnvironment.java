package org.openqa.selenium;

import junit.framework.Assert;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.nio.SelectChannelConnector;
import org.mortbay.jetty.webapp.WebAppContext;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;

import java.io.File;

public class SeleniumTestEnvironment implements TestEnvironment {
  private final Server server = new Server();

  public SeleniumTestEnvironment() {
    SelectChannelConnector connector = new SelectChannelConnector();
    connector.setPort(4444);
    server.addConnector(connector);

    File base = findSeleniumWebdir();

    WebAppContext app = new WebAppContext();
    app.setContextPath("/tests");
    app.setWar(base.getAbsolutePath());
    server.addHandler(app);

    try {
      server.start();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  private File findSeleniumWebdir() {
    String[] places = new String[]{
        "selenium/src/web/tests",
        "src/web/tests",
    };

    for (String place : places) {
      File root = new File(place);
      if (root.exists()) {
        return root;
      }
    }

    Assert.fail("Cannot find root of selenium web app");
    return null;
  }

  public AppServer getAppServer() {
    return null;
  }

  public void stop() {
    try {
      server.stop();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public static void main(String[] args) {
    new SeleniumTestEnvironment();
  }
}
