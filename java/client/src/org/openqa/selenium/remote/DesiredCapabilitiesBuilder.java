package org.openqa.selenium.remote;

import org.openqa.selenium.Platform;

public class DesiredCapabilitiesBuilder {

  private final DesiredCapabilities desiredCapabilities = new DesiredCapabilities();

  public DesiredCapabilitiesBuilder capability(String capabilityName, String value) {
    desiredCapabilities.setCapability(capabilityName, value);
    return this;
  }

  public DesiredCapabilitiesBuilder browser(String browser) {
    return capability(CapabilityType.BROWSER_NAME, browser);
  }

  public DesiredCapabilitiesBuilder version(String version) {
    return capability(CapabilityType.VERSION, version);
  }

  public DesiredCapabilitiesBuilder platform(Platform platform) {
    desiredCapabilities.setPlatform(platform);
    return this;
  }

  public DesiredCapabilitiesBuilder javascriptEnabled(boolean javascriptEnabled) {
    desiredCapabilities.setJavascriptEnabled(javascriptEnabled);
    return this;
  }

  public DesiredCapabilities build() {
    return desiredCapabilities;
  }
}
