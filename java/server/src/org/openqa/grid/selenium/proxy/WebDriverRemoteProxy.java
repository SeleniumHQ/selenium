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

package org.openqa.grid.selenium.proxy;

import java.util.Map;
import java.util.logging.Logger;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.listeners.TestSessionListener;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.CapabilityType;

public class WebDriverRemoteProxy extends WebRemoteProxy implements TestSessionListener {
	private static final Logger log = Logger.getLogger(WebDriverRemoteProxy.class.getName());

	public WebDriverRemoteProxy(RegistrationRequest request,Registry registry) {
		super(request,registry);
	}

	@Override
	public void beforeRelease(TestSession session) {
		// release the resources remotly.
		if (session.getExternalKey() == null) {
			throw new IllegalStateException("No internal key yet. Did the app start properlty?");
		}
		System.err.println("timing out " + session);
		boolean ok = session.sendDeleteSessionRequest();
		if (!ok) {
			log.warning("Error releasing the resources on timeout for session " + session);
		}
	}

	public void beforeSession(TestSession session) {
		Map<String, Object> cap = session.getRequestedCapabilities();
		if ("firefox".equals(cap.get(CapabilityType.BROWSER_NAME))) {
			if (session.getSlot().getCapabilities().get(FirefoxDriver.BINARY) != null && cap.get(FirefoxDriver.BINARY) == null) {
				session.getRequestedCapabilities().put(FirefoxDriver.BINARY, session.getSlot().getCapabilities().get(FirefoxDriver.BINARY));
			}
		}
	}

	public void afterSession(TestSession session) {
		// ignore

	}

}
