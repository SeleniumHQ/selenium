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

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHttpEntityEnclosingRequest;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.selenium.utils.SeleniumProtocol;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.server.RemoteControlConfiguration;

public abstract class SelfRegisteringRemote {

	private URL registration;
	private int port = 5555;

	private List<DesiredCapabilities> caps = new ArrayList<DesiredCapabilities>();
	private Map<String, Object> config = new HashMap<String, Object>();

	public SelfRegisteringRemote(int port, URL registration) {
		this.port = port;
		this.registration = registration;
	}

	/**
	 * Create a selenium1 RC from the configuration specified.
	 * 
	 * @param conf
	 * @param hub
	 * @return
	 */
	public static SelfRegisteringRemote create(RemoteControlConfiguration conf, URL registration) {
		return new SelfRegisteringSelenium(conf, registration);
	}

	public static SelfRegisteringRemote create(SeleniumProtocol type, int port, URL registration) {
		switch (type) {
		case Selenium:
			return new SelfRegisteringSelenium(port, registration);
		case WebDriver:
			return new SelfRegisteringWebDriver(port, registration);
		default:
			throw new RuntimeException("NI");
		}
	}

	public abstract URL getRemoteURL();

	public abstract void launchRemoteServer() throws Exception;

	public abstract void setMaxConcurrentSession(int max);

	public abstract void addInternetExplorerSupport();

	public abstract void addSafariSupport();

	public abstract void addFirefoxSupport(File profileDir);

	public void addChromeSupport() {
		caps.add(DesiredCapabilities.chrome());
	}

	public void setTimeout(long timeoutMillis, long cycleMillis) {
		config.put(RegistrationRequest.TIME_OUT, timeoutMillis);
		config.put(RegistrationRequest.CLEAN_UP_CYCLE, cycleMillis);
	}

	public int getPort() {
		return port;
	}

	public RegistrationRequest getRegistrationRequest() {
		RegistrationRequest res = new RegistrationRequest();
		for (DesiredCapabilities cap : caps) {
			res.addDesiredCapabilitiy(cap.asMap());
		}
		config.put(RegistrationRequest.REMOTE_URL, getRemoteURL());
		res.setConfiguration(config);
		return res;
	}

	public void registerToHub() {
		try {
			BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest("POST", registration.toExternalForm());
			r.setEntity(new StringEntity(getRegistrationRequest().toJSON()));

			DefaultHttpClient client = new DefaultHttpClient();
			HttpHost host = new HttpHost(registration.getHost(), registration.getPort());
			HttpResponse response = client.execute(host, r);
			if (response.getStatusLine().getStatusCode() != 200) {
				throw new RuntimeException("Error sending the registration request.");
			}
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		} catch (ClientProtocolException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	List<DesiredCapabilities> getCaps() {
		return caps;
	}

	Map<String, Object> getConfig() {
		return config;
	}

}
