package com.googlecode.webdriver.selenium;

import com.googlecode.webdriver.environment.TestEnvironment;
import com.googlecode.webdriver.environment.webserver.AppServer;
import com.googlecode.webdriver.environment.webserver.Jetty6AppServer;
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
