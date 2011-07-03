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

package org.openqa.grid.internal.utils;

import java.net.MalformedURLException;
import java.net.URL;
import java.security.InvalidParameterException;
import java.util.Map;

import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHttpEntityEnclosingRequest;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.server.SeleniumServer;

public class SelfRegisteringRemote {

	private RegistrationRequest nodeConfig;

	public SelfRegisteringRemote(RegistrationRequest config) {
		this.nodeConfig = config;
	}

	public URL getRemoteURL() {
		String base = "http://" + nodeConfig.getConfiguration().get(RegistrationRequest.HOST) + ":"
				+ nodeConfig.getConfiguration().get(RegistrationRequest.PORT);
		String url = null;
		switch (nodeConfig.getRole()) {
		case REMOTE_CONTROL:
			url = base + "/selenium-server/driver";
			break;
		case WEBDRIVER:
			url = base + "/wd/hub";
			break;
		default:
			throw new GridConfigurationException("Cannot launch a node with role " + nodeConfig.getRole());
		}
		try {
			return new URL(url);
		} catch (MalformedURLException e) {
			throw new GridConfigurationException("error building the node url " + e.getMessage(), e);
		}
	}

	private SeleniumServer server;

	public void launchRemoteServer() throws Exception {
		server = new SeleniumServer(nodeConfig.getRemoteControlConfiguration());
		server.boot();
		nodeConfig.getConfiguration().put(RegistrationRequest.REMOTE_URL, getRemoteURL());
	}

	public void stopRemoteServer() {
		if (server != null) {
			server.stop();
		}
	}

	public void deleteAllBrowsers() {
		nodeConfig.getCapabilities().clear();
	}
	public void addBrowser(DesiredCapabilities cap, int instances) {
		String s = cap.getBrowserName();
		if (s == null || "".equals(s)) {
			throw new InvalidParameterException(cap + " does seems to be a valid browser.");
		}
		cap.setPlatform(Platform.getCurrent());
		cap.setCapability(RegistrationRequest.MAX_INSTANCES, instances);
		nodeConfig.getCapabilities().add(cap);
	}

	public void registerToHub() {
		try {
			String url = "http://" + nodeConfig.getConfiguration().get(RegistrationRequest.HUB_HOST) + ":"
					+ nodeConfig.getConfiguration().get(RegistrationRequest.HUB_PORT) + "/grid/register";
			BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest("POST", url);
			r.setEntity(new StringEntity(nodeConfig.toJSON()));

			System.out.println(nodeConfig.toJSON());
			DefaultHttpClient client = new DefaultHttpClient();
			HttpHost host = new HttpHost((String) nodeConfig.getConfiguration().get(RegistrationRequest.HUB_HOST), (Integer) nodeConfig
					.getConfiguration().get(RegistrationRequest.HUB_PORT));
			HttpResponse response = client.execute(host, r);
			if (response.getStatusLine().getStatusCode() != 200) {
				throw new RuntimeException("Error sending the registration request.");
			}
		} catch (Exception e) {
			throw new RuntimeException("Error sending the registration request.", e);
		}
	}

	public void setTimeout(int timeout, int cycle) {
		nodeConfig.getConfiguration().put(RegistrationRequest.TIME_OUT, timeout);
		nodeConfig.getConfiguration().put(RegistrationRequest.CLEAN_UP_CYCLE, cycle);
	}

	public void setMaxConcurrent(int max) {
		nodeConfig.getConfiguration().put(RegistrationRequest.MAX_SESSION, max);
	}

	public Map<String, Object> getConfiguration() {
		return nodeConfig.getConfiguration();
	}

}