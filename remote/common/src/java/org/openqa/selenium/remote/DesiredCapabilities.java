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

import org.openqa.selenium.Platform;

import java.util.Map;

public class DesiredCapabilities implements Capabilities {

  private String browserName;
  private String version;
  private Platform platform;
  private boolean javascriptEnabled;

  public DesiredCapabilities(String browser, String version, Platform platform) {
    this.browserName = browser;
    this.version = version;
    this.platform = platform;
  }

  public DesiredCapabilities() {
    // no-arg constructor
  }

  public DesiredCapabilities(Map<String, Object> rawMap) {
    browserName = (String) rawMap.get("browserName");
    version = (String) rawMap.get("version");
    javascriptEnabled = (Boolean) rawMap.get("javascriptEnabled");
    if (rawMap.containsKey("operatingSystem")) {
      Object os = rawMap.get("operatingSystem");
      if (os instanceof String) {
        platform = Platform.valueOf((String) os);
      } else if (os instanceof Platform) {
        platform = (Platform) os;
      }
    }
    if (rawMap.containsKey("platform")) {
      Object raw = rawMap.get("platform");
      if (raw instanceof String)
        platform = Platform.valueOf((String) raw);
      else if (raw instanceof Platform)
        platform = (Platform) raw;
    }
  }

  public String getBrowserName() {
    return browserName;
  }

  public void setBrowserName(String browserName) {
    this.browserName = browserName;
  }

  public String getVersion() {
    return version;
  }

  public void setVersion(String version) {
    this.version = version;
  }

  public Platform getPlatform() {
    return platform;
  }

  public void setPlatform(Platform platform) {
    this.platform = platform;
  }

  public boolean isJavascriptEnabled() {
    return javascriptEnabled;
  }

  public void setJavascriptEnabled(boolean javascriptEnabled) {
    this.javascriptEnabled = javascriptEnabled;
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
    return String
        .format(
            "Capabilities [browserName=%s, javascriptEnabled=%s, platform=%s, version=%s]",
            browserName, javascriptEnabled, platform, version);
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

    if (javascriptEnabled != that.javascriptEnabled) {
      return false;
    }
    if (browserName != null ? !browserName.equals(that.browserName) : that.browserName != null) {
      return false;
    }
    if (!platform.is(that.platform)) {
      return false;
    }
    if (version != null ? !version.equals(that.version) : that.version != null) {
      return false;
    }

    return true;
  }

  @Override
  public int hashCode() {
    int result;
    result = (browserName != null ? browserName.hashCode() : 0);
    result = 31 * result + (version != null ? version.hashCode() : 0);
    result = 31 * result + (platform != null ? platform.hashCode() : 0);
    result = 31 * result + (javascriptEnabled ? 1 : 0);
    return result;
  }
}
