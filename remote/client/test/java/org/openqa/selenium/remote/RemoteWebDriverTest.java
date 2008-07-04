package org.openqa.selenium.remote;

import junit.framework.TestCase;

import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.Jetty6AppServer;
import org.openqa.selenium.remote.server.DriverServlet;

import java.io.File;

public class RemoteWebDriverTest extends TestCase {

  public void xtestShouldBeAbleToCreateANewSession() throws Exception {
    AppServer servletServer = new Jetty6AppServer() {
      protected File findRootOfWebApp() {
        File common = super.findRootOfWebApp();
        return new File(common, "../../../remote/server/src/web");
      }
    };
    servletServer.listenOn(7055);
    servletServer.addServlet("remote webdriver", "/hub/*", DriverServlet.class);
    servletServer.start();

    Jetty6AppServer mainServer = new Jetty6AppServer();
    mainServer.listenOn(3000);
    mainServer.start();

    RemoteWebDriver driver = new RemoteWebDriver(DesiredCapabilities.htmlUnit());
    driver.get("http://localhost:3000/xhtmlTest.html");
    System.out.println("title = " + driver.getTitle());
    System.out.println("url = " + driver.getCurrentUrl());
  }

  public static void main(String[] args) {
    AppServer servletServer = new Jetty6AppServer() {
      protected File findRootOfWebApp() {
        File common = super.findRootOfWebApp();
        return new File(common, "../../../remote/server/src/web");
      }
    };
    servletServer.listenOn(7055);
    servletServer.addServlet("remote webdriver", "/hub/*", DriverServlet.class);
    servletServer.start();
  }

}
