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
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;

/**
 * Hanlder processing the selenium1 based requests. Each request body has to be
 * read to get the sessionid at least.
 * 
 * 
 */
public class Selenium1RequestHandler extends RequestHandler {

	private static final Logger log = Logger.getLogger(Selenium1RequestHandler.class.getName());

  Selenium1RequestHandler(HttpServletRequest request, HttpServletResponse response, Registry registry) {
		super(request, response, registry);
		if (getRequestBody() == null) {
			throw new InstantiationError("Cannot create a selenium1 request handler from a request without body");
		}
	}

	@Override
	public RequestType extractRequestType() {
		if (getRequestBody().contains("cmd=getNewBrowserSession")) {
			return RequestType.START_SESSION;
		} else if (getRequestBody().contains("cmd=testComplete")) {
			return RequestType.STOP_SESSION;
		} else {
			return RequestType.REGULAR;
		}
	}

	@Override
	public String extractSession() {
		if (getRequestType() == RequestType.START_SESSION) {
			throw new IllegalAccessError("Cannot call that method of a new session request.");
		}
		// for selenium 1, the url is ignored. The session has to be read from
		// the request body.
		String command = getRequestBody();
		String[] pieces = command.split("&");
		for (String piece : pieces) {
			if (piece.startsWith("sessionId=")) {
				return piece.replace("sessionId=", "");
			}
		}
		return null;

	}

	@Override
	public Map<String, Object> extractDesiredCapability() {
		if (getRequestType() != RequestType.START_SESSION) {
			throw new Error("the desired capability is only present in the new session requests.");
		}
		String[] pieces = getRequestBody().split("&");
		for (String piece : pieces) {
			try {
				piece = URLDecoder.decode(piece, "UTF-8");
			} catch (UnsupportedEncodingException e) {
			}
			if (piece.startsWith("1=")) {
				String envt = piece.replace("1=", "");
				Map<String, Object> cap = new HashMap<String, Object>();
				// TODO freynaud : more splitting, like trying to guess the
				// plateform or version ?

				String[] details = envt.split(",");
				if (details.length == 1) {
					cap.put(RegistrationRequest.BROWSER, details[0]);
				} else {
					cap.put(RegistrationRequest.BROWSER, details[0]);
					for (int i = 1; i < details.length; i++) {
						cap.put(details[i].split("=")[0], details[i].split("=")[1]);
					}
				}
				return cap;
			}
		}
		throw new RuntimeException("Error");
	}

	@Override
	public String forwardNewSessionRequest(TestSession session) {
		String responseBody = null;
		try {
			String body = getRequestBody();
			String[] pieces = body.split("&");
			StringBuilder builder = new StringBuilder();
			for (String piece : pieces) {
				if (piece.startsWith("1=")) {
					piece = URLDecoder.decode(piece, "UTF-8");
					piece = piece.split(",")[0];
				}
				builder.append(piece + "&");
			}
			responseBody = session.forward(getRequest(), getResponse(), builder.toString(), true);
		} catch (IOException e) {
			log.warning("Error forwarding the request " + e.getMessage());
			return null;
		}
		if (responseBody != null && responseBody.startsWith("OK,")) {
			String externalKey = responseBody.replace("OK,", "");
			return externalKey;
		}
		return null;
	}

}
