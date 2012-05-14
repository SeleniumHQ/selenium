/*
Copyright 2010 Selenium committers
Portions copyright 2011 Software Freedom Conservancy

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

package org.openqa.selenium.browserlaunchers;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

// Deliberately set to package level visibility
class Maps {
  /**
   * Run the specified pattern on each line of the data to extract a dictionary
   */
  public static Map<String, String> parseDictionary(String data, Pattern pattern, boolean reverse) {
    Map<String, String> map = new HashMap<String, String>();
    for (String line : data.split("\n")) {
      Matcher m = pattern.matcher(line);
      if (!m.find()) {
        continue;
      }
      String name, value;
      if (reverse) {
        name = m.group(2);
        value = m.group(1);
      } else {
        name = m.group(1);
        value = m.group(2);
      }
      map.put(name, value);
    }
    return map;
  }
}
