package org.openqa.selenium.remote;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestSuite;
import junit.framework.TestCase;

import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.Jetty6AppServer;
import org.openqa.selenium.remote.server.DriverServlet;

import java.io.File;
import java.net.URL;

public class RemoteWebDriverTestSuite extends TestCase {
  public static Test suite() throws Exception {
    Test rawSuite =
        new TestSuiteBuilder()
            .addSourceDir("common")
            .addSourceDir("../common")
            .addSourceDir("remote/client")
            .keepDriverInstance()
            .includeJavascriptTests()
            .usingDriver(RemoteWebDriverForTest.class)
            .exclude("firefox")
            .exclude("remote")
            .create();

    TestSuite toReturn = new TestSuite();
    toReturn.addTest(new RemoteDriverServerStarter(rawSuite));
    return toReturn;
  }

  public static class RemoteWebDriverForTest extends RemoteWebDriver {
    public RemoteWebDriverForTest() throws Exception {
      super(new URL("http://localhost:7055/hub"), DesiredCapabilities.firefox());
    }
  }

  public static class RemoteDriverServerStarter extends TestSetup {
    private AppServer appServer;

    public RemoteDriverServerStarter(Test test) {
      super(test);
    }

    @Override
    protected void setUp() throws Exception {
      appServer = new Jetty6AppServer() {
        protected File findRootOfWebApp() {
          File common = super.findRootOfWebApp();
          File file = new File(common, "../../../remote/server/src/web");
          System.out.println(
              String.format("file exists %s and is: %s", file.exists(), file.getAbsolutePath()));
          return file;
        }
      };
      appServer.listenOn(7055);
      appServer.addServlet("remote webdriver", "/hub/*", DriverServlet.class);
      appServer.start();

      super.setUp();
    }

    @Override
    protected void tearDown() throws Exception {
      appServer.stop();

      super.tearDown();
    }
  }

}
