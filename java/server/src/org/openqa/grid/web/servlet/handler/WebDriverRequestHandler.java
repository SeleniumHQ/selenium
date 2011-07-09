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
package org.openqa.grid.web.servlet.handler;

import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.grid.internal.GridException;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;
import org.openqa.jetty.jetty.servlet.ServletHttpResponse;

public class WebDriverRequestHandler extends RequestHandler {

	private static final Logger log = Logger.getLogger(WebDriverRequestHandler.class.getName());

	protected WebDriverRequestHandler(HttpServletRequest request, HttpServletResponse response, Registry registry) {
		super(request, response, registry);
	}

	

	@Override
	public RequestType extractRequestType() {

		if ("/session".equals(getRequest().getPathInfo())) {
			return RequestType.START_SESSION;
		} else if (getRequest().getMethod().equalsIgnoreCase("DELETE")) {
			String externalKey = extractSession(getRequest().getPathInfo());
			if (getRequest().getPathInfo().endsWith("/session/" + externalKey)) {
				return RequestType.STOP_SESSION;
			}
		}
		return RequestType.REGULAR;
	}

	@Override
	public String extractSession() {
		if (getRequestType() == RequestType.START_SESSION) {
			throw new IllegalAccessError("Cannot call that method of a new session request.");
		}
		String path = getRequest().getPathInfo();
		return extractSession(path);
	}

	/**
	 * extract the session xxx from http://host:port/a/b/c/session/xxx/...
	 * 
	 * @param path
	 *            The path to the session
	 * @return the session key provided by the remote., or null if the url
	 *         didn't contain a session id
	 */
	private String extractSession(String path) {
		int sessionIndex = path.indexOf("/session/");
		if (sessionIndex != -1) {
			sessionIndex += "/session/".length();
			int nextSlash = path.indexOf("/", sessionIndex);
			String session;
			if (nextSlash != -1) {
				session = path.substring(sessionIndex, nextSlash);
			} else {
				session = path.substring(sessionIndex, path.length());
			}
			// log.debug("session found : " + session);
			if ("".equals(session)) {
				return null;
			}
			return session;
		}
		// log.debug("session not found in location " + loc);
		return null;
	}

	// TODO freynaud parsing is so so.
	@SuppressWarnings("unchecked")
	// JSON iterator.
	@Override
	public Map<String, Object> extractDesiredCapability() {
		String json = getRequestBody();
		Map<String, Object> desiredCapability = new HashMap<String, Object>();
		try {
			JSONObject map = new JSONObject(json);
			JSONObject dc = map.getJSONObject("desiredCapabilities");
			for (Iterator iterator = dc.keys(); iterator.hasNext();) {
				String key = (String) iterator.next();
				Object value = dc.get(key);
				if (value == JSONObject.NULL) {
					value = null;
				}
				desiredCapability.put(key, value);
			}
		} catch (JSONException e) {
			throw new GridException("Cannot extract a capabilities from the request " + json);
		}
		return desiredCapability;
	}

	@Override
	public String forwardNewSessionRequest(TestSession session) {
		try {
			// here, don't forward the requestBody directly, but read the
			// desiredCapabilities from the session instead.
			// That allow the TestSessionListener.before modification of the
			// capability map to be propagated.
			JSONObject c = new JSONObject();
			c.put("desiredCapabilities", session.getRequestedCapabilities());
			String content = c.toString();
			session.forward(getRequest(), getResponse(), content, false);
		} catch (IOException e) {
			log.warning("Error forwarding the request " + e.getMessage());
			return null;
		} catch (JSONException e) {
			log.warning("Error with the request " + e.getMessage());
			return null;
		}

		if (getResponse().containsHeader("Location")) {
			String location = ((ServletHttpResponse) getResponse()).getHttpResponse().getField("Location");
			return extractSession(location);
		} else {
			log.warning("Error, header should contain Location");
			return null;
		}

	}
}
