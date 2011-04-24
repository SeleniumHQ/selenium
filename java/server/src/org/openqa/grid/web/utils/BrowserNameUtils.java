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

package org.openqa.grid.web.utils;

import com.google.common.collect.Maps;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.Platform;

import java.util.Map;

/**
 * Utilities for dealing with browser names.
 */
public class BrowserNameUtils {
    public static String lookupGrid1Environment(String browserString) {
        String translatedBrowserString = Hub.getGrid1Mapping().get(browserString);

        return (translatedBrowserString == null) ? browserString : translatedBrowserString;
    }

    public static Map<String, Object> parseGrid2Environment(String environment) {
        Map<String, Object> ret = Maps.newHashMap();

        String[] details = environment.split(" ");
        if (details.length == 1) {
            // simple browser string
            ret.put(RegistrationRequest.BROWSER, details[0]);
        } else {
            // more complex. Only case handled so far = X on Y
            // where X is the browser string, Y the OS
            ret.put(RegistrationRequest.BROWSER, details[0]);
            if (details.length==3){
                ret.put(RegistrationRequest.PLATFORM, Platform.extractFromSysProperty(details[2]));
            }
        }

        return ret;
    }

    public static String consoleIconName(String browserString) {
        String ret = browserString;

        // Take care of any Grid 1.0 named environment translation.
        if (browserString.charAt(0) != '*') {
            browserString = lookupGrid1Environment(browserString);
        }

        // Map browser environments to icon names.
        if (browserString.contains("iexplore") || browserString.equals("*iehta")) {
			ret = "internet explorer";
		} else if (browserString.contains("firefox")) {
			ret = "firefox";
		} else if (browserString.startsWith("*safari")) {
			ret = "safari";
		} else if (browserString.startsWith("*googlechrome")) {
            ret = "chrome";
        }

        return ret;
    }
}
