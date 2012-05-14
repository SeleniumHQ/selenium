/*
Copyright 2007-2009 Selenium committers

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

import com.thoughtworks.selenium.BrowserConfigurationOptions;
import com.thoughtworks.selenium.Selenium;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.CapabilityType;

import java.util.HashMap;
import java.util.Map;

public class NewSession implements SeleneseFunction<Map<String, Object>> {
  public Map<String, Object> apply(Selenium selenium, Map<String, ?> args) {
    Capabilities capabilities = (Capabilities) args.get("desiredCapabilities");

    selenium.start(getBrowserConfigurationOptions(capabilities));

    // Emulate behaviour of webdriver
    selenium.useXpathLibrary("native");
    selenium.allowNativeXpath("true");

    Map<String, Object> seenCapabilities = new HashMap<String, Object>();
    seenCapabilities.put(CapabilityType.BROWSER_NAME, capabilities.getBrowserName());
    seenCapabilities.put(CapabilityType.VERSION, capabilities.getVersion());
    seenCapabilities.put(CapabilityType.PLATFORM, Platform.getCurrent().toString());
    seenCapabilities.put(CapabilityType.SUPPORTS_JAVASCRIPT, true);
    seenCapabilities.put(CapabilityType.TAKES_SCREENSHOT, true);
    return seenCapabilities;
  }

  private String getBrowserConfigurationOptions(Capabilities capabilities) {
    BrowserConfigurationOptions options = new BrowserConfigurationOptions();
    for (Map.Entry<String, ?> capability : capabilities.asMap().entrySet()) {
      options.set(capability.getKey(), String.valueOf(capability.getValue()));
    }
    return options.serialize();
  }
}
