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
import java.security.InvalidParameterException;
import java.util.HashMap;
import java.util.Map;

import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHttpEntityEnclosingRequest;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.selenium.utils.GridConfiguration;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.server.SeleniumServer;

public abstract class SelfRegisteringRemote {

	

	private GridConfiguration gridConfig;
	//private List<DesiredCapabilities> caps = new ArrayList<DesiredCapabilities>();
	private Map<String, Object> config = new HashMap<String, Object>();

	public SelfRegisteringRemote(GridConfiguration config) {
		this.gridConfig = config;
		setMaxConcurrentSession(config.getMaxConcurrentTests());
		setTimeout(config.getNodeTimeoutInSec()*1000, 10000);
	}


	public static SelfRegisteringRemote create(GridConfiguration config) {
		switch (config.getRole()) {
		case REMOTE_CONTROL:
			return new SelfRegisteringSelenium(config);
		case WEBDRIVER:
			return new SelfRegisteringWebDriver(config);
		default:
			throw new RuntimeException("NI");
		}
	}

	
	public abstract URL getRemoteURL();

	SeleniumServer server;
	public void launchRemoteServer() throws Exception{
		server = new SeleniumServer(getGridConfig().getNodeRemoteControlConfiguration());
		server.boot();
	}
	
	public void stopRemoteServer(){
		if (server!=null){
			server.stop();
		}
	}
	
	
	

	
	public void setMaxConcurrentSession(int max) {
		getConfig().put(RegistrationRequest.MAX_SESSION, max);
	}


	public void addCustomBrowser(DesiredCapabilities cap){
		String s = cap.getBrowserName();
		if (s == null || "".equals(s)){
			throw new InvalidParameterException(cap +" does seems to be a valid browser.");
		}
		cap.setPlatform(Platform.getCurrent());
		// TODO freynaud find the version automatically.
		getGridConfig().getCapabilities().add(cap);
	}
	
	
	public abstract void addInternetExplorerSupport();

	public abstract void addSafariSupport();

	public abstract void addFirefoxSupport();
	
	public abstract void addChromeSupport();

	

	public void setTimeout(long timeoutMillis, long cycleMillis) {
		config.put(RegistrationRequest.TIME_OUT, timeoutMillis);
		config.put(RegistrationRequest.CLEAN_UP_CYCLE, cycleMillis);
	}



	public RegistrationRequest getRegistrationRequest() {
		RegistrationRequest request = new RegistrationRequest();

		for (DesiredCapabilities cap : getGridConfig().getCapabilities()) {
			request.addDesiredCapabilitiy(cap.asMap());
		}

		config.put(RegistrationRequest.REMOTE_URL, getRemoteURL());
		request.setConfiguration(config);

		return request;
	}

	public void registerToHub() {
		try {
			BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest("POST",gridConfig.getRegistrationURL().toExternalForm());
			r.setEntity(new StringEntity(getRegistrationRequest().toJSON()));

			DefaultHttpClient client = new DefaultHttpClient();
			HttpHost host = new HttpHost(gridConfig.getRegistrationURL().getHost(), gridConfig.getRegistrationURL().getPort());
			HttpResponse response = client.execute(host, r);
			if (response.getStatusLine().getStatusCode() != 200) {
				throw new RuntimeException("Error sending the registration request.");
			}
		} catch (Exception e) {
			throw new RuntimeException("Error sending the registration request.", e);
		}
	}
	
	public GridConfiguration getGridConfig() {
		return gridConfig;
	}

	

	Map<String, Object> getConfig() {
		return config;
	}

}
