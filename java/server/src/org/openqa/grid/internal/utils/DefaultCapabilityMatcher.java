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

package org.openqa.grid.internal.utils;

import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.BROWSER;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.openqa.grid.internal.GridException;
import org.openqa.selenium.Platform;

/**
 * Default (naive) implementation of the capability matcher.
 * 
 * At the moment, the default only looks for the value of the key BROWSER
 * (first)and APP. If the value corresponding to those keys are equals on the
 * requested capabilities and the current capabilities, then the matcher returns
 * true.
 * 
 */
public class DefaultCapabilityMatcher implements CapabilityMatcher {

	private static final Logger log = Logger.getLogger(DefaultCapabilityMatcher.class.getName());

	private final List<String> web = new ArrayList<String>();
	private final List<String> win32 = new ArrayList<String>();

	public DefaultCapabilityMatcher() {
		web.add(BROWSER);
		web.add("platform");
		web.add("version");

		win32.add(APP);
		win32.add("platform");
		win32.add("version");

	}

	// TODO freynaud for selenium1, find a way to also check the firefox
	// profile.
	public boolean matches(Map<String, Object> currentCapability, Map<String, Object> requestedCapability) {
		if (currentCapability == null || requestedCapability == null) {
			return false;
		}

		if (isSelenium(requestedCapability)) {
			return matchesAtLeastKeys(web, currentCapability, requestedCapability);
		} else if (isWin32(requestedCapability)) {
			return matchesAtLeastKeys(win32, currentCapability, requestedCapability);
		} else {
			String msg = "DefaultCapabilityMatcher cannot work with capability " + requestedCapability;
			log.warning(msg);
			throw new GridException(msg);
		}

	}

	private boolean isSelenium(Map<String, Object> cap) {
		return cap.get(BROWSER) != null && cap.get(APP) == null;
	}

	private boolean isWin32(Map<String, Object> cap) {
		return cap.get(BROWSER) == null && cap.get(APP) != null;
	}

	/**
	 * Check that the 2 maps have the same values for the list of keys
	 * specified.
	 * 
	 * @param keys
	 * @param map1
	 * @param requestedCapability
	 * @return TODO
	 */
	private boolean matchesAtLeastKeys(List<String> keys, Map<String, Object> map1, Map<String, Object> requestedCapability) {
		for (String key : requestedCapability.keySet()) {
			if (keys.contains(key)) {
				String value = null;
				if (requestedCapability.get(key)!=null){
					value = requestedCapability.get(key).toString();
				}
				
				
				if (!("ANY".equalsIgnoreCase(value) || "".equalsIgnoreCase(value))) {
					if (requestedCapability.get(key) instanceof Platform) {
						// TODO freynaud get plateform from String. Calling
						// extract
						// is not safe as it may call system properties of the
						// grid
						// when the client is needed instead. Create a platform
						// parser to convert selenium1 legacy envt.
						Platform p1 = Platform.extractFromSysProperty(map1.get(key).toString());
						if (!((Platform) requestedCapability.get(key)).is(p1)) {
							return false;
						}
					} else if (map1.get(key) == null) {
						Object v =  requestedCapability.get(key);
						return v == null;
					} else if (!map1.get(key).equals(requestedCapability.get(key))){
						return false;
					}
				}
			}
		}
		return true;
		/*
		 * for (String key : keys) { if (!map1.containsKey(key)) { return false;
		 * } if (!map1.get(key).equals(requestedCapability.get(key))) { return
		 * false; } } return true;
		 */
	}

}
