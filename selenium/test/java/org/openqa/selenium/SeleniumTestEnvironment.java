package org.openqa.selenium;

import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.Jetty6AppServer;
import junit.framework.Assert;

import java.io.File;

public class SeleniumTestEnvironment implements TestEnvironment {
	private AppServer appServer;

	public SeleniumTestEnvironment() {
		appServer = new Jetty6AppServer();

                File base = findSeleniumWebdir();

                appServer.addAdditionalWebApplication("/selenium-server", base.getAbsolutePath());
		appServer.start();
	}

    private File findSeleniumWebdir() {
      String[] places = new String[] {
         "selenium/src/web",
         "src/web",
      };

      File root = null;
      for (String place : places) {
          root = new File(place);
          if (root.exists())
            return root;
      }

      Assert.fail("Cannot find root of selenium web app");
      return null;
    }

  public AppServer getAppServer() {
		return appServer;
	}
	
	public void stop() {
		appServer.stop();
	}
	
	public static void main(String[] args) {
		new SeleniumTestEnvironment();
	}
}
