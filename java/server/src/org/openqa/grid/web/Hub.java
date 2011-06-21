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

import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.Servlet;

import org.openqa.grid.internal.Registry;
import org.openqa.grid.web.servlet.ConsoleServlet;
import org.openqa.grid.web.servlet.DisplayHelpServlet;
import org.openqa.grid.web.servlet.DriverServlet;
import org.openqa.grid.web.servlet.Grid1HeartbeatServlet;
import org.openqa.grid.web.servlet.ProxyStatusServlet;
import org.openqa.grid.web.servlet.RegistrationServlet;
import org.openqa.grid.web.servlet.ResourceServlet;
import org.openqa.grid.web.servlet.TestSessionStatusServlet;
import org.openqa.grid.web.utils.ExtraServletUtil;
import org.openqa.jetty.http.SocketListener;
import org.openqa.jetty.jetty.Server;
import org.openqa.jetty.jetty.servlet.WebApplicationContext;
import org.openqa.selenium.net.NetworkUtils;
import org.yaml.snakeyaml.Yaml;

import com.google.common.collect.Maps;

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
    private static Map<String, Integer> grid1Config = Maps.newHashMap();
	private static Map<String, String> grid1Mapping = Maps.newHashMap();
	private static Hub INSTANCE = new Hub(4444, Registry.getInstance());
	private NetworkUtils utils = new NetworkUtils();

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
	/*
	 * public static void main(String[] args) throws Exception { Hub hub =
	 * Hub.getInstance(); for (String s : args) { Class<? extends Servlet>
	 * servletClass = ExtraServletUtil.createServlet(s); if (s != null) { String
	 * path = "/grid/admin/" + servletClass.getSimpleName() + "/*";
	 * log.info("binding " + servletClass.getCanonicalName() + " to " + path);
	 * hub.addServlet(path, servletClass); } } hub.start();
	 * 
	 * }
	 */

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
		host = utils.getIp4NonLoopbackAddressOfThisMachine().getHostAddress();
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
			
			root.addServlet("/*",DisplayHelpServlet.class.getName());
			
			root.addServlet("/grid/console/*", ConsoleServlet.class.getName());
			root.addServlet("/grid/register/*", RegistrationServlet.class.getName());
			// TODO remove at some point. Here for backward compatibility of
			// tests etc.
			root.addServlet("/grid/driver/*", DriverServlet.class.getName());
			root.addServlet("/wd/hub/*", DriverServlet.class.getName());
			root.addServlet("/selenium-server/driver/*", DriverServlet.class.getName());
			root.addServlet("/grid/resources/*", ResourceServlet.class.getName());

			root.addServlet("/grid/api/proxy/*", ProxyStatusServlet.class.getName());
			root.addServlet("/grid/api/testsession/*", TestSessionStatusServlet.class.getName());

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
		return Collections.unmodifiableMap(Hub.grid1Mapping);
	}

    public static Map<String, Integer> getGrid1Config() {
        return Collections.unmodifiableMap(Hub.grid1Config);
    }

	protected void loadGrid1Config() {
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

            // Now pull out each of the grid config values.
            Integer cleanupCycle = hub.get("remoteControlPollingIntervalInSeconds") == null ? 180 : (Integer) hub.get("remoteControlPollingIntervalInSeconds");
            grid1Config.put("cleanupCycle", cleanupCycle * 1000);

            
            Integer timeout = hub.get("sessionMaxIdleTimeInSeconds") == null ? 300 : (Integer) hub.get("sessionMaxIdleTimeInSeconds");
            grid1Config.put("timeout", timeout * 1000);

            if ( hub.get("newSessionMaxWaitTimeInSeconds")!=null){
            	grid1Config.put("newSessionWaitTimeout", ((Integer) hub.get("newSessionMaxWaitTimeInSeconds")) * 1000);	
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
	public void registerServlets(List<String> servlets) {
		if (servlets == null)
			return;
		for (String s : servlets) {
			Class<? extends Servlet> servletClass = ExtraServletUtil.createServlet(s);
			if (s != null) {
				String path = "/grid/admin/" + servletClass.getSimpleName() + "/*";
				log.info("binding " + servletClass.getCanonicalName() + " to " + path);
				addServlet(path, servletClass);
			}
		}
	}

	public void setPort(int port) {
		this.port = port;
	}

}
