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

import com.google.common.collect.Maps;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.web.servlet.*;
import org.openqa.jetty.http.SocketListener;
import org.openqa.jetty.jetty.Server;
import org.openqa.jetty.jetty.servlet.WebApplicationContext;
import org.yaml.snakeyaml.Yaml;

import javax.servlet.Servlet;
import java.io.InputStream;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

/**
 * 
 * Jetty server. Main entry point for everything about the grid.
 * 
 * Except for unit tests, this should be a singleton.
 * 
 * 
 */
public class Hub {

	private static final Logger log = Logger.getLogger(Hub.class.getName());

	private int port;
	private String host;
	private Server server;
	private Registry registry;
	private Map<String, Class<? extends Servlet>> extraServlet = Maps.newHashMap();
	private static Map<String, String> grid1Mapping = Maps.newHashMap();
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
			Class<? extends Servlet> servletClass = hub.createServlet(s);
			if (s != null) {
				String path = "/grid/admin/" + servletClass.getSimpleName() + "/*";
				log.info("binding " + servletClass.getCanonicalName() + " to " + path);
				hub.addServlet(path, servletClass);
			}
		}
		hub.start();

	}

	private Class<? extends Servlet> createServlet(String className) {
		try {
			return Class.forName(className).asSubclass(Servlet.class);
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
		return null;
	}

	private void addServlet(String key, Class<? extends Servlet> s) {
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

		// Load up the old Selenium Grid 1.0 configuration if it exists.
		loadGrid1Config();
	}

	private void initServer() {
		try {
			server = new Server();
			SocketListener socketListener = new SocketListener();
			socketListener.setMaxIdleTimeMs(60000);
			socketListener.setPort(port);
			server.addListener(socketListener);

			WebApplicationContext root = server.addWebApplication("", ".");
			root.setAttribute(Registry.KEY, registry);

			root.addServlet("/grid/console/*", ConsoleServlet.class.getName());
			root.addServlet("/grid/register/*", RegistrationServlet.class.getName());
			root.addServlet("/grid/driver/*", DriverServlet.class.getName());
			root.addServlet("/selenium-server/driver/*", DriverServlet.class.getName());
			root.addServlet("/grid/resources/*", ResourceServlet.class.getName());

			// Selenium Grid 1.0 compatibility routes for older nodes trying to
			// work with the newer hub.
			root.addServlet("/registration-manager/register/*", RegistrationServlet.class.getName());
			root.addServlet("/heartbeat", Grid1HeartbeatServlet.class.getName());

			// Load any additional servlets provided by the user.
			for (Map.Entry<String, Class<? extends Servlet>> entry : extraServlet.entrySet()) {
				root.addServlet(entry.getKey(), entry.getValue().getName());
			}
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

	public static Map<String, String> getGrid1Mapping() {
		return Hub.grid1Mapping;
	}

	private void loadGrid1Config() {
		InputStream input = Class.class.getResourceAsStream("/grid_configuration.yml");

		if (input != null) {
			log.info("Loading Grid 1.0 configuration file.");

			Yaml yaml = new Yaml();
			Map<String, Object> config = (Map<String, Object>) yaml.load(input);
			Map<String, Object> hub = (Map<String, Object>) config.get("hub");
			List<Map<String, String>> environments = (List<Map<String, String>>) hub.get("environments");

			// Store a copy of the environment names => browser strings
			for (Map<String, String> environment : environments) {
				grid1Mapping.put(environment.get("name"), environment.get("browser"));
			}
		} else {
			log.info("Did not find a Grid 1.0 configuration file.  Skipping Grid 1.0 setup.");
		}
	}

	/**
	 * Configure the hub based on the parameter passed at launch.
	 * 
	 * @param args
	 */
	public void configure(String[] args) {
		for (String s : args) {
			Class<? extends Servlet> servletClass = createServlet(s);
			if (s != null) {
				String path = "/grid/admin/" + servletClass.getSimpleName() + "/*";
				log.info("binding " + servletClass.getCanonicalName() + " to " + path);
				addServlet(path, servletClass);
			}
		}
	}

}
