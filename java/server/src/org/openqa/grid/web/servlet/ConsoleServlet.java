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

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.common.io.ByteStreams;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.web.servlet.handler.RequestHandler;

/**
 * Front end to monitor what is currently happening on the proxies. The display
 * is defined by HtmlRenderer returned by the RemoteProxy.getHtmlRenderer()
 * method.
 * 
 * 
 */
public class ConsoleServlet extends HttpServlet {

	private static final long serialVersionUID = 8484071790930378855L;
	private Registry registry;

	public ConsoleServlet() {
		throw new IllegalAccessError("use the contructor that set the registry.");
	}

	public ConsoleServlet(Registry registry) {
		this.registry = registry;

	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		process(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		process(request, response);
	}

	protected void process(HttpServletRequest request, HttpServletResponse response) throws IOException {
		response.setContentType("text/html");
		response.setCharacterEncoding("UTF-8");
		response.setStatus(200);

		StringBuilder builder = new StringBuilder();

		builder.append("<html>");
		builder.append("<head>");

		builder.append("<title>Grid overview</title>");

		builder.append("<style>");
		builder.append(".busy {");
		builder.append(" opacity : 0.4;");
		builder.append("filter: alpha(opacity=40);");
		builder.append("}");
		builder.append("</style>");
		builder.append("</head>");
		builder.append("<body>");
		builder.append("<H1>Grid 2.0 Hub</H1>");

		for (RemoteProxy proxy : registry.getAllProxies()) {
			builder.append(proxy.getHtmlRender().renderSummary());
		}

		List<RequestHandler> l = registry.getNewSessionRequests();

		builder.append(l.size() + " requests waiting for a slot to be free.");

		builder.append("<ul>");
		for (RequestHandler req : l) {
			builder.append("<li>" + req.getDesiredCapabilities() + "</li>");
		}
		builder.append("</ul>");

		builder.append("</body>");
		builder.append("</html>");

		InputStream in = new ByteArrayInputStream(builder.toString().getBytes("UTF-8"));
		try {
			ByteStreams.copy(in, response.getOutputStream());
		} finally {
			in.close();
			response.getOutputStream().close();
		}
	}
}
