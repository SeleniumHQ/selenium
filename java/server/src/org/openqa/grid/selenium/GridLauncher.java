/*
Copyright 2007-2011 WebDriver committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
package org.openqa.grid.selenium;

import org.openqa.grid.selenium.utils.GridConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.server.SeleniumServer;

public class GridLauncher {

	public static void main(String[] args) throws Exception {

		GridConfiguration config = GridConfiguration.parse(args);

		switch (config.getRole()) {
		case NOT_GRID:
			SeleniumServer.main(args);
			break;
		case HUB:
			Hub h = Hub.getInstance();
			h.registerServlets(config.getServlets());
			h.setPort(config.getPort());
			h.start();
			break;
		case WEBDRIVER:
		case REMOTE_CONTROL:
			launchNode(config);
			break;
		default:
			throw new RuntimeException("NI");
		}
	}

	/**
	 * launches a grid component ( either hub, remote control node or webdriver
	 * node ).
	 * 
	 * @param config
	 * @throws Exception
	 */
	public static void launchNode(GridConfiguration config) throws Exception {

		SelfRegisteringRemote remote = SelfRegisteringRemote.create(config);

		// loading the browsers specified command line if any, otherwise try 5 firefox, IE and chrome
		if (config.getCapabilities().size()==0){
			remote.addFirefoxSupport();
			remote.addFirefoxSupport();
			remote.addFirefoxSupport();
			remote.addFirefoxSupport();
			remote.addFirefoxSupport();
			remote.addInternetExplorerSupport();
			remote.addChromeSupport();
		}
		
		remote.launchRemoteServer();
		remote.registerToHub();
	}

}
