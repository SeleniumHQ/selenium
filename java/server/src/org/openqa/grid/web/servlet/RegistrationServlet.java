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

package org.openqa.grid.web.servlet;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.openqa.selenium.internal.Trace; import org.openqa.selenium.internal.TraceFactory;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;

/**
 * entry point for the registration API the grid provides. The
 * {@link RegistrationRequest} sent to http://hub:port/grid/register will be
 * used to create a RemoteProxy and add it to the grid.
 * 
 * 
 */
public class RegistrationServlet extends HttpServlet {

	private static final long serialVersionUID = -8670670577712086527L;
	private static final Trace log = TraceFactory.getTrace(RegistrationServlet.class);
	private Registry registry;

	public RegistrationServlet() {
		throw new IllegalAccessError("use the constructor that set the registry.");
	}

	public RegistrationServlet(Registry registry) {
		this.registry = registry;
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		process(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		process(request, response);
	}

	protected void process(HttpServletRequest request, HttpServletResponse response) throws IOException {
		BufferedReader rd = new BufferedReader(new InputStreamReader(request.getInputStream()));
		StringBuffer registrationRequest = new StringBuffer();
		String line;
		while ((line = rd.readLine()) != null) {
			registrationRequest.append(line);
		}
		rd.close();
		log.debug("getting the following registration request  : " + registrationRequest.toString());

		RegistrationRequest server = RegistrationRequest.getNewInstance(registrationRequest.toString());
		final RemoteProxy proxy = RemoteProxy.getNewInstance(server);
		reply(response, "ok");

		new Thread(new Runnable() {
			public void run() {
				registry.add(proxy);
				log.debug("proxy added " + proxy.getRemoteURL());
			}
		}).start();
	}

	protected void reply(HttpServletResponse response, String content) throws IOException {
		response.setContentType("text/html");
		response.setCharacterEncoding("UTF-8");
		response.setStatus(200);
		response.getWriter().print(content);

	}
}
