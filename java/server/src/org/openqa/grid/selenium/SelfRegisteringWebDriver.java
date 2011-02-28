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

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.nio.SelectChannelConnector;
import org.eclipse.jetty.webapp.WebAppContext;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.selenium.utils.NetworkUtil;
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
		WebAppContext context = new WebAppContext();
		context.setWar(".");
		context.setContextPath("");
		server.setHandler(context);
		context.addServlet(DriverServlet.class, getRemoteURL().getPath() + "/*");
		SelectChannelConnector connector = new SelectChannelConnector();
		connector.setPort(getRemoteURL().getPort());
		server.addConnector(connector);
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
