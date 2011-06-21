package org.openqa.grid.internal.utils;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.openqa.grid.internal.listeners.Prioritizer;
import org.yaml.snakeyaml.Yaml;

public class GridHubConfiguration {

	

	private static final Logger log = Logger.getLogger(GridHubConfiguration.class.getName());

	/**
	 * The hub needs to know its hostname in order to write the proper Location
	 * header for the request being forwarded. Usually this can be guessed
	 * correctly, but in case it cannot it can be passed via this config param.
	 */
	private String host = null;

	/**
	 * port for the hub.
	 */
	private int port = 4444;

	/**
	 * how often in ms each proxy will detect that a session has timed out. All
	 * new proxy registering will have that value if they don't specifically
	 * mention the parameter.
	 */
	private int cleanupCycle = 5 * 1000;

	/**
	 * how long can a session be idle before being considered timed out. Working
	 * together with cleanup cycle. Worst case scenario, a session can be idle
	 * for timout + cleanup cycle before the timeout is detected
	 */
	private int timeout = 300 * 1000;

	/**
	 * how long a new session request can stay in the queue without being
	 * assigned before being rejected. -1 = forever.
	 */
	private int newSessionWaitTimeout = -1;

	/**
	 * list of extra serlvets this hub will display. Allows to present custom
	 * view of the hub for monitoring and management purpose
	 */
	private List<String> servlets = new ArrayList<String>();

	/**
	 * name <-> browser mapping from grid1
	 */
	private Map<String, String> grid1Mapping = new HashMap<String, String>();

	/**
	 * to specify the order in which the new session request will be handled.
	 */
	private Prioritizer prioritizer = null;

	/**
	 * to specify how new request and nodes will be matched.
	 */
	private CapabilityMatcher matcher = new DefaultCapabilityMatcher();

	/**
	 * true by default.If true, the hub will throw exception as soon as a
	 * request not supported by the grid is received. If set to false, the
	 * request will be queued, hoping that a node will be registered at some
	 * point, supporting that capability.
	 */
	private boolean throwOnCapabilityNotPresent = true;

	/**
	 * how often the hub check that the node is alive.
	 */
	private int nodePolling = 180 * 1000;

	/**
	 * 
	 * @param resource
	 *            /grid_configuration.yml for instance
	 * @return
	 */
	public static GridHubConfiguration loadFromGridYml(String resource) {

		GridHubConfiguration res = new GridHubConfiguration();

		InputStream in = Thread.currentThread().getContextClassLoader().getResourceAsStream(resource);

		if (in == null) {
			try {
				in = new FileInputStream(resource);
			} catch (FileNotFoundException e) {
				// ignore
			}
		}
		if (in == null) {
			throw new InvalidParameterException(resource + " is not a valid resource.");
		}
		

		Yaml yaml = new Yaml();
		Map<String, Object> config = (Map<String, Object>) yaml.load(in);
		Map<String, Object> hub = (Map<String, Object>) config.get("hub");
		List<Map<String, String>> environments = (List<Map<String, String>>) hub.get("environments");

		// Store a copy of the environment names => browser strings
		for (Map<String, String> environment : environments) {
			res.getGrid1Mapping().put(environment.get("name"), environment.get("browser"));
		}

		// Now pull out each of the grid config values.
		Integer poll = (Integer) hub.get("remoteControlPollingIntervalInSeconds");
		if (poll != null) {
			res.nodePolling = poll.intValue() * 1000;
			res.cleanupCycle = poll.intValue() * 1000;	
		}

		Integer timeout = (Integer) hub.get("sessionMaxIdleTimeInSeconds");
		if (timeout != null) {
			res.timeout = timeout.intValue() * 1000;
		}
		
		Integer port = (Integer) hub.get("port");
		if (port != null) {
			res.port = port.intValue();
		}
		

		Integer newSessionWait = (Integer) hub.get("newSessionMaxWaitTimeInSeconds");
		if (newSessionWait != null) {
			res.newSessionWaitTimeout = newSessionWait.intValue() * 1000;
		}
		
		return res;
	}
	
	
	
	
	public String getHost() {
		return host;
	}

	public int getPort() {
		return port;
	}

	public int getCleanupCycle() {
		return cleanupCycle;
	}

	public int getTimeout() {
		return timeout;
	}

	public int getNewSessionWaitTimeout() {
		return newSessionWaitTimeout;
	}

	public List<String> getServlets() {
		return servlets;
	}

	public Map<String, String> getGrid1Mapping() {
		return grid1Mapping;
	}

	public Prioritizer getPrioritizer() {
		return prioritizer;
	}

	public CapabilityMatcher getMatcher() {
		return matcher;
	}

	public boolean isThrowOnCapabilityNotPresent() {
		return throwOnCapabilityNotPresent;
	}
	
	public void setHost(String host) {
		this.host = host;
	}

	public void setPort(int port) {
		this.port = port;
	}

	public void setCleanupCycle(int cleanupCycle) {
		this.cleanupCycle = cleanupCycle;
	}

	public void setTimeout(int timeout) {
		this.timeout = timeout;
	}

	public void setNewSessionWaitTimeout(int newSessionWaitTimeout) {
		this.newSessionWaitTimeout = newSessionWaitTimeout;
	}

	public void setServlets(List<String> servlets) {
		this.servlets = servlets;
	}

	public void setPrioritizer(Prioritizer prioritizer) {
		this.prioritizer = prioritizer;
	}

	public void setMatcher(CapabilityMatcher matcher) {
		this.matcher = matcher;
	}

	public void setThrowOnCapabilityNotPresent(boolean throwOnCapabilityNotPresent) {
		this.throwOnCapabilityNotPresent = throwOnCapabilityNotPresent;
	}

	public void setNodePolling(int nodePolling) {
		this.nodePolling = nodePolling;
	}

	public int getNodePolling() {
		return nodePolling;
	}

	

}
