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
package org.openqa.grid.web;

import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.Servlet;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletHolder;
import org.eclipse.jetty.webapp.WebAppContext;
import org.openqa.selenium.internal.Trace; import org.openqa.selenium.internal.TraceFactory;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.web.servlet.ConsoleServlet;
import org.openqa.grid.web.servlet.DriverServlet;
import org.openqa.grid.web.servlet.RegistrationServlet;
import org.openqa.grid.web.servlet.ResourceServlet;

/**
 * 
 * Jetty server. Main entry point for everything about the grid.
 * 
 * Except for unit tests, this should be a singleton.
 * 
 * 
 */
public class Hub {

	private static final Trace log = TraceFactory.getTrace(Hub.class);

	private int port;
	private String host;
	private Server server;
	private Registry registry;
	private Map<String, Servlet> extraServlet = new HashMap<String, Servlet>();
	private static Hub INSTANCE = new Hub(4444, Registry.getInstance());

	public static Hub getInstance() {
		return INSTANCE;
	}

	/**
	 * Starts the hub and the default port. Can register some custom servlet to
	 * manage the remote via a web interface.
	 * 
	 * @param args
	 * @throws Exception
	 */
	// TODO freynaud : have a separate config file with the servlet and their
	// name to use for their path. param isn't convenient.
	public static void main(String[] args) throws Exception {
		Hub hub = Hub.getInstance();
		for (String s : args) {
			Servlet servlet = hub.createServlet(s);
			if (s != null) {
				String path = "/grid/admin/" + servlet.getClass().getSimpleName() + "/*";
				log.info("binding " + servlet.getClass().getCanonicalName() + " to " + path);
				hub.addServlet(path, servlet);
			}
		}
		hub.start();

	}

	private Servlet createServlet(String className) {
		try {
			Class<?> clazz = Class.forName(className);
			return (Servlet) clazz.newInstance();
		} catch (InstantiationException e) {
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			e.printStackTrace();
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
		return null;
	}

	private void addServlet(String key, Servlet s) {
		extraServlet.put(key, s);
	}

	/**
	 * get the registry backing up the hub state.
	 * 
	 * @return
	 */
	public Registry getRegistry() {
		return registry;
	}

	/**
	 * Create a new instance on the given port, with the given registry. Allow
	 * several hub to run on the same machine without interacting with each
	 * other. Useless in a normal use. Convenient for testing
	 * 
	 * @param port
	 * @param registry
	 */
	public static Hub getNewInstanceForTest(int port, Registry registry) {
		return new Hub(port, registry);
	}

	private Hub(int port, Registry registry) {
		InetAddress addr;
		try {
			addr = InetAddress.getLocalHost();
		} catch (UnknownHostException e) {
			throw new InstantiationError("cannot find hub ip");
		}
		host = addr.getHostAddress();
		this.port = port;
		this.registry = registry;
		registry.setHub(this);

	}

	private void initServer() {
		try {

			server = new Server(port);

//			ContextHandlerCollection contexts = new ContextHandlerCollection();

      WebAppContext root = new WebAppContext("Selenium Grid 2", "/");
      root.addServlet(new ServletHolder(new ConsoleServlet(registry)), "/grid/console/*");
			root.addServlet(new ServletHolder(new RegistrationServlet(registry)), "/grid/register/*");
			root.addServlet(new ServletHolder(new DriverServlet(registry)), "/grid/driver/*");
			root.addServlet(new ServletHolder(new DriverServlet(registry)), "/selenium-server/driver/*");
			root.addServlet(new ServletHolder(new ResourceServlet()), "/resources/*");

			for (String path : extraServlet.keySet()) {
				root.addServlet(new ServletHolder(extraServlet.get(path)), path);
			}

			server.setHandler(root);

		} catch (Throwable e) {
			throw new RuntimeException("Error initializing the hub" + e.getMessage(), e);
		}
	}

	public int getPort() {
		return port;
	}

	public String getHost() {
		return host;
	}

	public void start() throws Exception {
		initServer();
		server.start();
	}

	public void stop() throws Exception {
		server.stop();
	}

	public URL getUrl() {
		try {
			return new URL("http://" + getHost() + ":" + getPort());
		} catch (MalformedURLException e) {
			throw new RuntimeException(e.getMessage());
		}
	}

	public URL getRegistrationURL() {
		String uri = "http://" + getHost() + ":" + getPort() + "/grid/register/";
		try {
			return new URL(uri);
		} catch (MalformedURLException e) {
			throw new RuntimeException(e);
		}
	}

}
