/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.remote;

import java.io.Serializable;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.openqa.selenium.remote.Capabilities;
import org.openqa.selenium.Platform;

import static org.openqa.selenium.browserlaunchers.CapabilityType.BROWSER_NAME;
import static org.openqa.selenium.browserlaunchers.CapabilityType.PLATFORM;
import static org.openqa.selenium.browserlaunchers.CapabilityType.SUPPORTS_JAVASCRIPT;
import static org.openqa.selenium.browserlaunchers.CapabilityType.VERSION;

public class DesiredCapabilities implements Capabilities, Serializable {
  private final Map<String, Object> capabilities = new HashMap<String, Object>();

  public DesiredCapabilities(String browser, String version, Platform platform) {
    setCapability(BROWSER_NAME, browser);
    setCapability(VERSION, version);
    setCapability(PLATFORM, platform);
  }

  public DesiredCapabilities() {
    // no-arg constructor
  }

  public DesiredCapabilities(Map<String, ?> rawMap) {
    capabilities.putAll(rawMap);
    Object value = capabilities.get(PLATFORM);
    if (value instanceof String) {
      capabilities.put(PLATFORM, Platform.valueOf((String) value));
    }
  }

  public String getBrowserName() {
    return (String) capabilities.get(BROWSER_NAME);
  }

  public void setBrowserName(String browserName) {
    setCapability(BROWSER_NAME, browserName);
  }

  public String getVersion() {
    return (String) capabilities.get(VERSION);
  }

  public void setVersion(String version) {
    setCapability(VERSION, version);
  }

  public Platform getPlatform() {
    if (capabilities.containsKey(PLATFORM)) {
      Object raw = capabilities.get(PLATFORM);
      if (raw instanceof String) {
        return Platform.valueOf((String) raw);
      } else if (raw instanceof Platform) {
        return (Platform) raw;
      }
    }
    return null;
  }

  public void setPlatform(Platform platform) {
    setCapability(PLATFORM, platform);
  }

  public boolean isJavascriptEnabled() {
    if (capabilities.containsKey(SUPPORTS_JAVASCRIPT)) {
      Object raw = capabilities.get(SUPPORTS_JAVASCRIPT);
      if (raw instanceof String) {
        return Boolean.parseBoolean((String) raw);
      } else if (raw instanceof Boolean) {
        return ((Boolean) raw).booleanValue();
      }
    }
    return true;
  }

  public void setJavascriptEnabled(boolean javascriptEnabled) {
    setCapability(SUPPORTS_JAVASCRIPT, javascriptEnabled);
  }

  public Object getCapability(String capabilityName) {
    return capabilities.get(capabilityName);
  }

  public boolean is(String capabilityName) {
    Object cap = getCapability(capabilityName);
    if (cap == null) {
      return false;
    }
    return cap instanceof Boolean ? (Boolean) cap : Boolean.parseBoolean(String.valueOf(cap));
  }

  public void setCapability(String capabilityName, boolean value) {
    capabilities.put(capabilityName, value);
  }

  public void setCapability(String capabilityName, String value) {
    capabilities.put(capabilityName, value);
  }

  public void setCapability(String capabilityName, Platform value) {
    capabilities.put(capabilityName, value);
  }

  public Map<String, ?> asMap() {
    return Collections.unmodifiableMap(capabilities);
  }

  public void setCapability(String key, Object value) {
    capabilities.put(key, value);
  }

  public static DesiredCapabilities firefox() {
    return new DesiredCapabilities("firefox", "", Platform.ANY);
  }

  public static DesiredCapabilities internetExplorer() {
    return new DesiredCapabilities("internet explorer", "", Platform.WINDOWS);
  }

  public static DesiredCapabilities htmlUnit() {
    return new DesiredCapabilities("htmlunit", "", Platform.ANY);
  }

  public static DesiredCapabilities iphone() {
    return new DesiredCapabilities("iphone", "", Platform.MAC);
  }
  
  public static DesiredCapabilities chrome() {
    return new DesiredCapabilities("chrome", "", Platform.ANY);
  }

  @Override
  public String toString() {
    return String.format("Capabilities [%s]", capabilities);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof DesiredCapabilities)) {
      return false;
    }

    DesiredCapabilities that = (DesiredCapabilities) o;

    return capabilities.equals(that.capabilities);
  }

  @Override
  public int hashCode() {
    return capabilities.hashCode();
  }
}
