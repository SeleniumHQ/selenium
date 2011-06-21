package org.openqa.grid.internal;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.openqa.grid.common.RegistrationRequest;


public class RemoteProxyFactory {

	/**
	 * Create a simple proxy with 1 capability : {"applicationName=appName"} and
	 * the configuration {"url=url"}
	 * 
	 * @param appName
	 * @param url
	 * @param registry
	 * @return
	 */
	public static RemoteProxy getNewBasicRemoteProxy(String appName, String url,Registry registry) {

		RegistrationRequest req = new RegistrationRequest();

		Map<String, Object> capability = new HashMap<String, Object>();
		capability.put("applicationName", appName);
		req.addDesiredCapabilitiy(capability);

		Map<String, Object> config = new HashMap<String, Object>();
		config.put("url", url);
		req.setConfiguration(config);
		return new RemoteProxy(req,registry);

	}

	/**
	 * Create a simple proxy with the 1 capability specified as parameter and
	 * the configuration {"url=url"}
	 * 
	 * @param cap
	 * @param url
	 * @param registry
	 * @return
	 */
	public static RemoteProxy getNewBasicRemoteProxy(Map<String, Object> cap, String url,Registry registry) {

		RegistrationRequest req = new RegistrationRequest();

		req.addDesiredCapabilitiy(cap);

		Map<String, Object> config = new HashMap<String, Object>();
		config.put("url", url);
		req.setConfiguration(config);
		return new RemoteProxy(req,registry);

	}

	/**
	 * Create a simple proxy with the the list of capabilities specified as
	 * parameter and the configuration {"url=url"}
	 * 
	 * @param caps
	 * @param url
	 * @param registry
	 * @return
	 */
	public static RemoteProxy getNewBasicRemoteProxy(List<Map<String, Object>> caps, String url,Registry registry) {

		RegistrationRequest req = new RegistrationRequest();

		req.setCapabilities(caps);

		Map<String, Object> config = new HashMap<String, Object>();
		config.put("url", url);
		req.setConfiguration(config);
		return new RemoteProxy(req,registry);

	}

}
