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

import static org.openqa.selenium.remote.CapabilityType.PLATFORM;

import java.net.URL;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.selenium.utils.GridConfiguration;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.server.RemoteControlConfiguration;

public class SelfRegisteringSelenium extends SelfRegisteringRemote {

	private static final String REMOTE_PATH = "/selenium-server/driver";
	RemoteControlConfiguration config = null;

	public SelfRegisteringSelenium(GridConfiguration config) {
		super(config);
	}

	@Override
	public URL getRemoteURL() {
		String url = "http://" + getGridConfig().getHost() + ":" + getGridConfig().getNodeRemoteControlConfiguration().getPort() + REMOTE_PATH;
		try {
			return new URL(url);
		} catch (Throwable e) {
			throw new RuntimeException("URL for the node doesn't seem correct: " + url + " , " + e.getMessage());
		}

	}
	
	public void addChromeSupport() {
		DesiredCapabilities chrome = new DesiredCapabilities("*googlechrome", "", Platform.getCurrent());
		getGridConfig().getCapabilities().add(chrome);
	}
	

	@Override
	public RegistrationRequest getRegistrationRequest() {
		RegistrationRequest request = super.getRegistrationRequest();
		request.getConfiguration().put(RegistrationRequest.PROXY_CLASS, "org.openqa.grid.selenium.proxy.SeleniumRemoteProxy");
		return request;
	}

	@Override
	public void addFirefoxSupport() {
		DesiredCapabilities ff = new DesiredCapabilities();
		ff.setBrowserName("*firefox");
		ff.setCapability(PLATFORM, Platform.getCurrent());
		getGridConfig().getCapabilities().add(ff);
	}

	@Override
	public void addInternetExplorerSupport() {
		if (Platform.getCurrent().is(Platform.WINDOWS)) {
			DesiredCapabilities ie = new DesiredCapabilities();
			ie.setBrowserName("*iexplore");
			getGridConfig().getCapabilities().add(ie);
		}
	}

	@Override
	public void addSafariSupport() {
		DesiredCapabilities safari = new DesiredCapabilities();
		safari.setBrowserName("*safari");
		getGridConfig().getCapabilities().add(safari);

	}
}
