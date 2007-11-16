package com.thoughtworks.webdriver.selenium;

import java.io.File;

import com.thoughtworks.webdriver.environment.TestEnvironment;
import com.thoughtworks.webdriver.environment.webserver.AppServer;
import com.thoughtworks.webdriver.environment.webserver.Jetty5AppServer;

import junit.framework.Assert;

public class SeleniumTestEnvironment implements TestEnvironment {
	private AppServer appServer;

	public SeleniumTestEnvironment() {
		appServer = new Jetty5AppServer();

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
