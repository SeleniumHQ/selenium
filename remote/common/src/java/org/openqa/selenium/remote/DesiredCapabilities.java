package org.openqa.selenium.remote;

import org.openqa.selenium.Platform;
import org.openqa.selenium.internal.OperatingSystem;

import java.util.Map;

public class DesiredCapabilities implements Capabilities {

  private String browserName;
  private String version;
  private Platform platform;
  private boolean javascriptEnabled;

  public DesiredCapabilities(String browser, String version, OperatingSystem operatingSystem) {
    this.browserName = browser;
    this.version = version;
    this.platform = operatingSystem.getPlatform();
  }

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
      platform = OperatingSystem.valueOf((String) rawMap.get("operatingSystem")).getPlatform();
    } else {
      platform = Platform.valueOf((String) rawMap.get("platform"));
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

  /**
   * @deprecated Use {@link #setPlatform(org.openqa.selenium.Platform)} instead
   * @param operatingSystem
   */
  @Deprecated
  public void setOperatingSystem(OperatingSystem operatingSystem) {
    this.platform = operatingSystem.getPlatform();
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
    return new DesiredCapabilities("firefox", "", OperatingSystem.ANY);
  }

  public static DesiredCapabilities internetExplorer() {
    return new DesiredCapabilities("internet explorer", "", OperatingSystem.WINDOWS);
  }

  public static DesiredCapabilities htmlUnit() {
    return new DesiredCapabilities("htmlunit", "", OperatingSystem.ANY);
  }

  public static DesiredCapabilities safari() {
    return new DesiredCapabilities("safari", "", OperatingSystem.MAC);
  }

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

  public int hashCode() {
    int result;
    result = (browserName != null ? browserName.hashCode() : 0);
    result = 31 * result + (version != null ? version.hashCode() : 0);
    result = 31 * result + (platform != null ? platform.hashCode() : 0);
    result = 31 * result + (javascriptEnabled ? 1 : 0);
    return result;
  }
}
