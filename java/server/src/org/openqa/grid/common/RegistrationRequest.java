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

package org.openqa.grid.common;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.security.InvalidParameterException;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

/**
 * helper to register to the grid. Using JSON to exchange the object between the
 * node and grid.
 */
public class RegistrationRequest {

	private String id;
	private String name;
	private String description;

	private List<Map<String, Object>> capabilities = Lists.newArrayList();
	private Map<String, Object> configuration = Maps.newHashMap();

	private static final Logger log = Logger.getLogger(RegistrationRequest.class.getName());

	// some special param for capability
	public static final String APP = "applicationName";
	public static final String MAX_INSTANCES = "maxInstances";
	public static final String BROWSER = "browserName";
	public static final String PLATFORM = "platform";
	public static final String VERSION = "version";

	// some special param for config
	public static final String PROXY_CLASS = "proxy";
	public static final String CLEAN_UP_CYCLE = "cleanUpCycle";
	public static final String TIME_OUT = "timeout";
	public static final String REMOTE_URL = "url";
	public static final String MAX_SESSION = "maxSession";
	public static final String AUTO_REGISTER = "register";
	public static final String NODE_POLLING = "nodePolling";

	public static final String MAX_TESTS_BEFORE_CLEAN = "maxTestBeforeClean";
	public static final String CLEAN_SNAPSHOT = "cleanSnapshot";

	public RegistrationRequest() {
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public List<Map<String, Object>> getCapabilities() {
		return capabilities;
	}

	@SuppressWarnings("unchecked")
	public void addDesiredCapabilitiy(Map<String, ?> c) {
		this.capabilities.add((Map<String, Object>) c);
	}

	public void setCapabilities(List<Map<String, Object>> capabilities) {
		this.capabilities = capabilities;
	}

	public Map<String, Object> getConfiguration() {
		return configuration;
	}

	public void setConfiguration(Map<String, Object> configuration) {
		this.configuration = configuration;
	}

	public String toJSON() {
		JSONObject res = getAssociatedJSON();
		return res.toString();
	}

	public JSONObject getAssociatedJSON() {

		JSONObject res = new JSONObject();
		try {
			res.put("class", getClass().getCanonicalName());
			res.put("id", id);
			res.put("name", name);
			res.put("description", description);
			res.put("configuration", configuration);
			res.put("capabilities", capabilities);
		} catch (JSONException e) {
			throw new RuntimeException("Error encoding to JSON " + e.getMessage(), e);
		}

		return res;
	}

	public String getConfigAsString(String param) {
		Object res = configuration.get(param);
		return res == null ? null : res.toString();

	}

	public int getConfigAsInt(String param, int defaultValue) {
		Object o = configuration.get(param);
		if (o == null) {
			return defaultValue;
		}
		if (o instanceof Integer) {
			Integer i = (Integer) o;
			return i;
		}
		try {
			return Integer.parseInt(o.toString());
		} catch (Throwable t) {
			log.warning("Error." + name + " is supposed to be an int. Keeping default of " + defaultValue);
			return defaultValue;
		}

	}

	/**
	 * Create an object from a registration request formatted as a json string.
	 * 
	 * @param json
	 * @return create a request from the JSON request received.
	 */
	@SuppressWarnings("unchecked")
	// JSON lib
	public static RegistrationRequest getNewInstance(String json) {
		RegistrationRequest request = new RegistrationRequest();
		try {
			JSONObject o = new JSONObject(json);

			if (o.has("id"))
				request.setId(o.getString("id"));
			if (o.has("name"))
				request.setName(o.getString("name"));
			if (o.has("description"))
				request.setDescription(o.getString("description"));
			JSONObject config = o.getJSONObject("configuration");

			Map<String, Object> configuration = Maps.newHashMap();
			for (Iterator<String> iterator = config.keys(); iterator.hasNext();) {
				String key = iterator.next();
				configuration.put(key, config.get(key));
			}
			request.setConfiguration(configuration);

			JSONArray capabilities = o.getJSONArray("capabilities");

			for (int i = 0; i < capabilities.length(); i++) {
				JSONObject capability = capabilities.getJSONObject(i);
				Map<String, Object> cap = Maps.newHashMap();
				for (Iterator<String> iterator = capability.keys(); iterator.hasNext();) {
					String key = iterator.next();
					cap.put(key, capability.get(key));
				}
				request.capabilities.add(cap);
			}
			return request;
		} catch (JSONException e) {
			// Check if it was a Selenium Grid 1.0 request.
			return parseGrid1Request(json);
		}
	}

	/**
	 * if a PROXY_CLASS is specified in the request, the proxy created following
	 * this request will be of that type. If nothing is specified, it will use
	 * RemoteProxy
	 * 
	 * @return null if no class was specified.
	 */
	public String getRemoteProxyClass() {
		Object o = getConfiguration().get(PROXY_CLASS);
		return o == null ? null : o.toString();
	}

	private static RegistrationRequest parseGrid1Request(String clientRequest) {
		// Check if it's a Selenium Grid 1.0 node connecting.
		// If so, the string will be of the format:
		// host=localhost&port=5000&environment=linux_firefox_3_6
		Map<String, String> registrationInfo = Maps.newHashMap();

		// Attempt to parse the client request string.
		String parts[] = clientRequest.split("&");
		for (String part : parts) {
			String configItem[] = part.split("=");

			// Do some basic taint checking so we can exit early if it's not
			// really a key=value pair.
			if (configItem.length != 2) {
				throw new InvalidParameterException();
			}

			try {
				registrationInfo.put(URLDecoder.decode(configItem[0], "UTF-8"), URLDecoder.decode(configItem[1], "UTF-8"));
			} catch (UnsupportedEncodingException e) {
				log.warning(String.format("Unable to decode registration request portion: %s", part));
			}
		}

		// Now validate the query string.
		if ((registrationInfo.get("port") != null) && (registrationInfo.get("environment") != null)) {
			RegistrationRequest request = new RegistrationRequest();

			Map<String, Object> configuration = Maps.newHashMap();
			configuration.put("proxy", "org.openqa.grid.selenium.proxy.SeleniumRemoteProxy");
			configuration
					.put("url", String.format("http://%s:%s/selenium-server/driver", registrationInfo.get("host"), registrationInfo.get("port")));
			request.setConfiguration(configuration);

			Map<String, Object> cap = Maps.newHashMap();
			// cap.put("platform", "LINUX");
			cap.put("browserName", registrationInfo.get("environment"));
			cap.put("environment", registrationInfo.get("environment"));
			request.capabilities.add(cap);

			return request;
		} else {
			throw new InvalidParameterException();
		}
	}

}
