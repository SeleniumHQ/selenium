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
import java.net.URL;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.selenium.utils.NetworkUtil;
import org.openqa.jetty.http.SocketListener;
import org.openqa.jetty.jetty.Server;
import org.openqa.jetty.jetty.servlet.WebApplicationContext;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.server.DriverServlet;

public class SelfRegisteringWebDriver extends SelfRegisteringRemote {

	private static String REMOTE_PATH = "/wd";

	public SelfRegisteringWebDriver(int port, URL registration) {
		super(port, registration);
	}

	@Override
	public URL getRemoteURL() {
		try {
			// TODO freynaud DUP of some existing selenium class 
			String ip = NetworkUtil.getIPv4Address();
			URL res = new URL("http://" + ip + ":" + getPort() + REMOTE_PATH);
			return res;
		} catch (Throwable e) {
			return null;
		}
	}

	@Override
	public RegistrationRequest getRegistrationRequest() {
		RegistrationRequest res = super.getRegistrationRequest();
		res.getConfiguration().put(RegistrationRequest.PROXY_CLASS, "org.openqa.grid.selenium.proxy.WebDriverRemoteProxy");
		return res;
	}

	@Override
	public void launchRemoteServer() throws Exception {
		Server server = new Server();
    SocketListener listener = new SocketListener();
    listener.setPort(getRemoteURL().getPort());
    server.addListener(listener);

    WebApplicationContext context = server.addWebApplication("", ".");
    context.addServlet(getRemoteURL().getPath() + "/*", DriverServlet.class.getName());
		server.start();
	}

	@Override
	public void setMaxConcurrentSession(int max) {
		getConfig().put(RegistrationRequest.MAX_SESSION, max);
	}

	@Override
	public void addFirefoxSupport(File profile) {
		DesiredCapabilities ff = DesiredCapabilities.firefox();
		if (profile != null) {
			ff.setCapability(FirefoxDriver.PROFILE, new FirefoxProfile(profile));
		}
		getCaps().add(ff);
	}

	@Override
	public void addInternetExplorerSupport() {
		getCaps().add(DesiredCapabilities.internetExplorer());

	}

	@Override
	public void addSafariSupport() {
		throw new Error("no safari for webdriver");

	}

}
