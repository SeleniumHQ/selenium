/*
Copyright 2008-2010 WebDriver committers
Copyright 2008-2010 Google Inc.

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

package org.openqa.selenium.server;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import com.thoughtworks.selenium.SeleniumException;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.DoNotUseProxyPac;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.JsonToBeanConverter;

import static org.openqa.selenium.browserlaunchers.CapabilityType.ForSeleniumServer.AVOIDING_PROXY;
import static org.openqa.selenium.browserlaunchers.CapabilityType.ForSeleniumServer.ENSURING_CLEAN_SESSION;
import static org.openqa.selenium.browserlaunchers.CapabilityType.ForSeleniumServer.ONLY_PROXYING_SELENIUM_TRAFFIC;
import static org.openqa.selenium.browserlaunchers.CapabilityType.ForSeleniumServer.PROXYING_EVERYTHING;
import static org.openqa.selenium.browserlaunchers.CapabilityType.ForSeleniumServer.PROXY_PAC;

public class BrowserConfigurationOptions {

  private Map<String, String> options = new HashMap<String, String>();
  private boolean hasOptions = false;

  public BrowserConfigurationOptions(String browserConfiguration) {
    setProxyRequired(true);
    //"name=value;name=value"
    String[] optionsPairList = browserConfiguration.split(";");
    for (int i = 0; i < optionsPairList.length; i++) {
      String[] option = optionsPairList[i].split("=", 2);
      if (2 == option.length) {
        String optionsName = option[0].trim();
        String optionValue = option[1].trim();
        options.put(optionsName, optionValue);
        hasOptions = true;
      }
    }
  }

  public BrowserConfigurationOptions() {
    setProxyRequired(true);
  }

  public String serialize() {
    //"profile:XXXXXXXXXX"
    StringBuilder sb = new StringBuilder();
    boolean first = true;
    for (String key : options.keySet()) {
      if (first) {
        first = false;
      } else {
        sb.append(';');
      }
      sb.append(key).append(':').append(options.get(key));
    }
    return sb.toString();
  }

  public String getProfile() {
    return options.get("profile");
  }

  public boolean hasOptions() {
    return hasOptions;
  }

  public boolean isSingleWindow() {
    return is("singleWindow");
  }

  public void setSingleWindow(Boolean singleWindow) {
    options.put("singleWindow", singleWindow.toString());
    hasOptions = true;
  }

  public String getExecutablePath() {
    return options.get("executablePath");
  }

  public void setExecutablePath(String executablePath) {
    options.put("executablePath", executablePath);
    hasOptions = true;
  }

  public boolean isTimeoutSet() {
    String value = options.get("timeoutInSeconds");
    if (value == null) {
      return false;
    } else {
      return true;
    }
  }

  public boolean isCommandLineFlagsSet() {
    String value = options.get("commandLineFlags");
    if (value == null) {
      return false;
    } else {
      return true;
    }
  }

  public String getCommandLineFlags() {
    return options.get("commandLineFlags");
  }

  public int getTimeoutInSeconds() {
    String value = options.get("timeoutInSeconds");
    if (value == null) {
      return RemoteControlConfiguration.DEFAULT_TIMEOUT_IN_SECONDS;
    }
    return Integer.parseInt(value);
  }

  public boolean isAvoidingProxy() {
    return is(AVOIDING_PROXY);
  }

  public void setAvoidProxy(boolean avoidProxy) {
    set(AVOIDING_PROXY, avoidProxy);
  }

  public void setOnlyProxySeleniumTraffic(boolean onlyProxySeleniumTraffic) {
    set(ONLY_PROXYING_SELENIUM_TRAFFIC, onlyProxySeleniumTraffic);
  }

  public boolean isOnlyProxyingSeleniumTraffic() {
    return is(ONLY_PROXYING_SELENIUM_TRAFFIC);
  }

  public void setProxyEverything(boolean proxyEverything) {
    set(PROXYING_EVERYTHING, proxyEverything);
  }

  public boolean isProxyingEverything() {
    return is(PROXYING_EVERYTHING);
  }

  public void setProxyRequired(boolean proxyRequired) {
    set("proxyRequired", proxyRequired);
  }

  public boolean isProxyRequired() {
    return is("proxyRequired") || getProxyConfig() != null;
  }

  public DoNotUseProxyPac getProxyConfig() {
    String raw = get(PROXY_PAC);
    if (raw == null) {
      return null;
    }

    try {
      return new JsonToBeanConverter().convert(DoNotUseProxyPac.class, raw);
    } catch (Exception e) {
      throw new SeleniumException("Unable to retrieve proxy configuration", e);
    }
  }

  public boolean isEnsuringCleanSession() {
    return is(ENSURING_CLEAN_SESSION);
  }

  public boolean is(String key) {
    String value = options.get(key);
    if (value == null) {
      return false;
    }
    return Boolean.parseBoolean(value);
  }

  public String get(String key) {
    return options.get(key);
  }

  public File getFile(String key) {
    String value = options.get(key);
    if (value == null) {
      return null;
    }
    return new File(value);
  }

  public void set(String key, Object value) {
    if (value == null) {
      options.put(key, null);
    } else {
      options.put(key, value.toString());
    }
  }

  /**
   * Setting safely implies not overriding existing values, and not allowing
   * null to be set.
   *
   * @param key   The key to set
   * @param value The value to set it to.
   */
  public void setSafely(String key, Object value) {
    if (value == null) {
      return;
    }

    if (!options.containsKey(key)) {
      set(key, value);
    }
  }

  /**
   * Returns the serialization of this object, as defined by the serialize()
   * method.
   */
  @Override
  public String toString() {
    return serialize();
  }

  public Capabilities asCapabilities() {
    DesiredCapabilities caps = new DesiredCapabilities();
    for (Map.Entry<String, String> entry : options.entrySet()) {
      caps.setCapability(entry.getKey(), entry.getValue());
    }
    return caps;
  }
}
