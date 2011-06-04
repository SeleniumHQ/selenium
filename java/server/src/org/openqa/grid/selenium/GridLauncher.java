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

import java.net.URL;
import java.util.logging.Logger;

import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHttpEntityEnclosingRequest;
import org.json.JSONObject;
import org.openqa.grid.selenium.utils.GridConfiguration;
import org.openqa.grid.selenium.utils.GridRole;
import org.openqa.grid.selenium.utils.WebDriverJSONConfigurationUtils;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;

public class GridLauncher {

	private static final Logger log = Logger.getLogger(GridLauncher.class.getName());

	public static void main(String[] args) throws Exception {

		GridConfiguration config = GridConfiguration.parse(args);

		switch (config.getRole()) {
		case NOT_GRID:
			log.info("Launching a standalone server");
			SeleniumServer.main(args);
			break;
		case HUB:
			log.info("Launching a selenium grid server");
			Hub h = Hub.getInstance();
			h.registerServlets(config.getServlets());
			h.setPort(config.getPort());
			h.start();
			break;
		case WEBDRIVER:
		case REMOTE_CONTROL:
			log.info("Launching a selenium grid node");
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

		// should become the default case eventually.
		if (config.getRole() == GridRole.WEBDRIVER && (config.getFile() != null || config.getCapabilities().size() == 0)) {

			String resource = config.getFile();
			if (resource == null) {
				resource = "defaults/WebDriverDefaultNode.json";
			}
			JSONObject request = WebDriverJSONConfigurationUtils.parseRegistrationRequest(resource);
			int port = request.getJSONObject("configuration").getInt("port");
			RemoteControlConfiguration c = new RemoteControlConfiguration();
			c.setPort(port);
			SeleniumServer server = new SeleniumServer(c);
			server.boot();
			log.info("Registering the node to to hub :" + config.getRegistrationURL());
			log.info("using the json request : " + request);
			registerToHub(config.getRegistrationURL(), request.toString());

		} else {
			SelfRegisteringRemote remote = SelfRegisteringRemote.create(config);

			// loading the browsers specified command line if any, otherwise try
			// 5 firefox, IE and chrome
			if (config.getCapabilities().size() == 0) {
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

	private static void registerToHub(URL registrationURL, String json) {
		try {
			BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest("POST", registrationURL.toExternalForm());
			r.setEntity(new StringEntity(json));

			DefaultHttpClient client = new DefaultHttpClient();
			HttpHost host = new HttpHost(registrationURL.getHost(), registrationURL.getPort());
			HttpResponse response = client.execute(host, r);
			if (response.getStatusLine().getStatusCode() != 200) {
				throw new RuntimeException("Error sending the registration request.");
			}
		} catch (Exception e) {
			throw new RuntimeException("Error sending the registration request.", e);
		}
	}

}
