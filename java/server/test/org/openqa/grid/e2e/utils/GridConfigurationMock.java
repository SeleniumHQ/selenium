package org.openqa.grid.e2e.utils;

import java.net.URL;

import org.openqa.grid.selenium.utils.GridConfiguration;
import org.openqa.grid.selenium.utils.GridRole;
import org.openqa.selenium.net.PortProber;

public class GridConfigurationMock {

	
	public static GridConfiguration webdriverConfig(URL registrationURL){
		GridConfiguration config = new GridConfiguration();
		config.setRegistrationURL(registrationURL);
		config.setRole(GridRole.WEBDRIVER);
		config.setPort(PortProber.findFreePort());
		return config;
	}
	
	public static GridConfiguration seleniumConfig(URL registrationURL){
		GridConfiguration config = new GridConfiguration();
		config.setRegistrationURL(registrationURL);
		config.setRole(GridRole.REMOTE_CONTROL);
		config.setPort(PortProber.findFreePort());
		return config;
	}
}
