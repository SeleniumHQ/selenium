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

import static org.openqa.selenium.net.Urls.urlEncode;

import com.google.common.base.Joiner;
import com.google.common.collect.ImmutableMap;

import com.thoughtworks.selenium.Selenium;

import java.util.Map;

public class GetActiveElement implements SeleneseFunction<Map<String, String>> {

  private static final String SCRIPT = Joiner.on('\n').join(
      "(function() {",
      "  var doc = selenium.browserbot.getDocument();",
      "  var el = doc.activeElement || doc.body;",
      "  el = core.firefox.unwrap(el);",
      "  return bot.inject.cache.addElement(el);",
      "})()");

  public Map<String, String> apply(Selenium selenium, Map<String, ?> args) {
    String key = selenium.getEval(SCRIPT);
    String locator = "stored=" + urlEncode(key);
    return ImmutableMap.of("ELEMENT", locator);
  }
}
