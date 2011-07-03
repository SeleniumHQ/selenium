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

import static org.openqa.grid.common.RegistrationRequest.AUTO_REGISTER;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;

import javax.servlet.Servlet;

import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHttpEntityEnclosingRequest;
import org.json.JSONObject;
import org.openqa.grid.common.GridDocHelper;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.GridNodeConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.ResourceServlet;
import org.openqa.grid.web.utils.ExtraServletUtil;
import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.jetty.Server;
import org.openqa.jetty.jetty.servlet.ServletHandler;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;

public class GridLauncher {

	private static final Logger log = Logger.getLogger(GridLauncher.class.getName());

	public static void main(String[] args) throws Exception {

		GridRole role = GridRole.find(args);

		switch (role) {
		case NOT_GRID:
			log.info("Launching a standalone server");
			SeleniumServer.main(args);
			break;
		case HUB:
			log.info("Launching a selenium grid server");
			try {
				GridHubConfiguration c = GridHubConfiguration.build(args);
				Hub h = new Hub(c);
				h.start();
			} catch (GridConfigurationException e) {
				e.printStackTrace();
				GridDocHelper.printHelp(e.getMessage());
			}
			break;
		case WEBDRIVER:
		case REMOTE_CONTROL:
			log.info("Launching a selenium grid node");
			try {
				RegistrationRequest c = RegistrationRequest.build(args);
				launchNode(c);
			} catch (GridConfigurationException e) {
				e.printStackTrace();
				GridDocHelper.printHelp(e.getMessage());
			}
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
	public static void launchNode(RegistrationRequest node) throws Exception {
		
		node.validate();

		RemoteControlConfiguration configuration = node.getRemoteControlConfiguration();
		System.setProperty("org.openqa.jetty.http.HttpRequest.maxFormContentSize", "0");

		SeleniumServer server = new SeleniumServer(configuration);
		Server jetty = server.getServer();

		String servletsStr = (String) node.getConfiguration().get(GridNodeConfiguration.SERVLETS);
		if (servletsStr != null) {
			List<String> servlets = Arrays.asList(servletsStr.split(","));
			if (servlets != null) {
				HttpContext extra = new HttpContext();

				extra.setContextPath("/extra");
				ServletHandler handler = new ServletHandler();
				handler.addServlet("/resources/*", ResourceServlet.class.getName());

				for (String s : servlets) {
					Class<? extends Servlet> servletClass = ExtraServletUtil.createServlet(s);
					if (servletClass != null) {
						String path = "/" + servletClass.getSimpleName() + "/*";
						String clazz = servletClass.getCanonicalName();
						handler.addServlet(path, clazz);
						log.info("started extra node servlet visible at : http://xxx:" + node.getConfiguration().get(RegistrationRequest.PORT)
								+ "/extra" + path);
					}
				}
				extra.addHandler(handler);
				jetty.addContext(extra);
			}
		}

		server.boot();

		
		log.info("using the json request : " + node.toJSON());

		Boolean register = (Boolean)node.getConfiguration().get(AUTO_REGISTER);
		
		if (!register) {
			log.info("no registration sent ( " + AUTO_REGISTER + " = false )");
		} else {
			String tmp = "http://" + node.getConfiguration().get(RegistrationRequest.HUB_HOST) + ":" + node.getConfiguration().get(RegistrationRequest.HUB_PORT) + "/grid/register";
			URL registration = new URL(tmp);
			log.info("Registering the node to to hub :" + registration);
			registerToHub(registration, node.toJSON().toString());
		}

	}

	private static URL buildNodeURL(String nodeURL) {
		try {
			URL url = new URL(nodeURL);
			String cleaned = nodeURL.toLowerCase();
			if (hostHasToBeGuessed(url)) {
				NetworkUtils util = new NetworkUtils();
				String guessedHost = util.getIp4NonLoopbackAddressOfThisMachine().getHostAddress();
				String host = url.getHost();

				if ("ip".equalsIgnoreCase(host) || "host".equalsIgnoreCase(host)) {
					cleaned = cleaned.replace("ip", guessedHost);
					cleaned = cleaned.replace("host", guessedHost);
				}

			}
			if (!cleaned.startsWith("http://")) {
				cleaned = "http://" + cleaned;
			}
			if (!cleaned.endsWith("/wd/hub")) {
				cleaned = cleaned + "/wd/hub";
			}
			try {
				URL res = new URL(cleaned);
				return res;
			} catch (MalformedURLException e) {
				throw new RuntimeException("Error cleaning up url " + nodeURL + ", failed after conveting it to " + cleaned);
			}
		} catch (MalformedURLException e1) {
			throw new RuntimeException("url provided :" + nodeURL + " is not correct.");
		}
	}

	private static boolean hostHasToBeGuessed(URL nodeURL) {
		String host = nodeURL.getHost().toLowerCase();
		return ("ip".equals(host) || "host".equals(host));
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
