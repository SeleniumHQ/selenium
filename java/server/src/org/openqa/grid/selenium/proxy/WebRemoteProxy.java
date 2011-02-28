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

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.listeners.CommandListener;
import org.openqa.grid.internal.listeners.TimeoutListener;
import org.openqa.grid.internal.utils.HtmlRenderer;
import org.openqa.grid.selenium.utils.WebProxyHtmlRenderer;


public abstract class WebRemoteProxy extends RemoteProxy implements  TimeoutListener, CommandListener {

	public WebRemoteProxy(RegistrationRequest request) {
		super(request);
	}

	public abstract void beforeRelease(TestSession session);

	public void afterCommand(TestSession session, HttpServletRequest request, HttpServletResponse response) {
		session.put("lastCommand", request.getMethod() + " - " + request.getPathInfo() + " executing ...");
	}

	public void beforeCommand(TestSession session, HttpServletRequest request, HttpServletResponse response) {
		session.put("lastCommand", request.getMethod() + " - " + request.getPathInfo() + " executed.");
	}

	
	private final HtmlRenderer renderer = new WebProxyHtmlRenderer(this);

	@Override
	public HtmlRenderer getHtmlRender() {
		return renderer;
	}

}
