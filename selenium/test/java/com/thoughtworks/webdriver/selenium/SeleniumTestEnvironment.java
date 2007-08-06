package com.thoughtworks.webdriver.selenium;

import java.io.File;

import com.thoughtworks.webdriver.environment.TestEnvironment;
import com.thoughtworks.webdriver.environment.webserver.AppServer;
import com.thoughtworks.webdriver.environment.webserver.Jetty5AppServer;

public class SeleniumTestEnvironment implements TestEnvironment {
	private AppServer appServer;

	public SeleniumTestEnvironment() {
		appServer = new Jetty5AppServer();

		appServer.addAdditionalWebApplication("/selenium-server", new File("src/web").getAbsolutePath());
		appServer.start();
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
