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

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.openqa.grid.internal.Registry;
import org.openqa.grid.web.servlet.handler.RequestHandler;

/**
 * entry point for all communication request sent by the clients to the remotes
 * managed by the grid.
 * 
 * 
 */
public class DriverServlet extends HttpServlet {

	private static final long serialVersionUID = -1693540182205547227L;
	private Registry registry;

	public DriverServlet() {
		throw new IllegalAccessError("use  DriverServlet(Registry registry)");
	}

	public DriverServlet(Registry registry) {
		this.registry = registry;
	}

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		process(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		process(request, response);
	}

	@Override
	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		process(request, response);
	}

	protected void process(HttpServletRequest request, HttpServletResponse response) throws IOException {
		RequestHandler req = RequestHandler.createHandler(request, response, registry);
		req.process();
	}

}
