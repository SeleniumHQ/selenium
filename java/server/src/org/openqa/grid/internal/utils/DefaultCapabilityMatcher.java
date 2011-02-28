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

import org.openqa.selenium.internal.Trace; import org.openqa.selenium.internal.TraceFactory;
import org.openqa.grid.internal.GridException;

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

	private static final Trace log = TraceFactory.getTrace(DefaultCapabilityMatcher.class);

	private final List<String> web = new ArrayList<String>();
	private final List<String> win32 = new ArrayList<String>();

	// criterias.add("platform");
	// criterias.add("version");

	public DefaultCapabilityMatcher() {
		web.add(BROWSER);
		win32.add(APP);
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
			log.warn(msg);
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
	 * @param map2
	 * @return TODO
	 */
	private boolean matchesAtLeastKeys(List<String> keys, Map<String, Object> map1, Map<String, Object> map2) {
		for (String key : keys) {
			if (!map1.containsKey(key)) {
				return false;
			}
			if (!map1.get(key).equals(map2.get(key))) {
				return false;
			}
		}
		return true;
	}

}
