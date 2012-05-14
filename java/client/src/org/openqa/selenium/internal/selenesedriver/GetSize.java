/*
Copyright 2011 Selenium committers

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

package org.openqa.selenium.internal.selenesedriver;

import static com.google.common.base.Joiner.on;

import com.google.common.collect.ImmutableMap;

import com.thoughtworks.selenium.Selenium;

import org.openqa.selenium.WebDriverException;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;

public class GetSize extends ElementFunction<Map<String, Integer>> {

  public Map<String, Integer> apply(Selenium selenium, Map<String, ?> args) {
    String locator = getLocator(args);

    String value = selenium.getEval(on("\n").join(
        "(function() {",
        "  var element = selenium.browserbot.findElement('LOCATOR');",
        "  var size = goog.style.getSize(element);",
        "  return '{\"width\":' + size.width + ',\"height\":' + size.height + '}';",
        "})();").replace("LOCATOR", locator));

    try {
      JSONObject json = new JSONObject(value);
      return ImmutableMap.of("width", json.getInt("width"), "height", json.getInt("height"));
    } catch (JSONException e) {
      throw new WebDriverException(e);
    }
  }
}
