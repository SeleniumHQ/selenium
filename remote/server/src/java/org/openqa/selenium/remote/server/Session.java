package org.openqa.selenium.remote.server;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.Capabilities;
import org.openqa.selenium.remote.Context;
import org.openqa.selenium.remote.DesiredCapabilities;

public class Session {

  private final WebDriver driver;
  private KnownElements knownElements = new KnownElements();
  private Capabilities capabilities;

  public Session(WebDriver driver, Capabilities capabilities, boolean rendered) {
    this.driver = driver;
    DesiredCapabilities desiredCapabilities =
        new DesiredCapabilities(capabilities.getBrowserName(), capabilities.getVersion(),
                                capabilities.getOperatingSystem());
    desiredCapabilities.setJavascriptEnabled(rendered);
    this.capabilities = desiredCapabilities;
  }

  public WebDriver getDriver(Context context) {
    return driver;
  }

  public KnownElements getKnownElements() {
    return knownElements;
  }

  public Capabilities getCapabilities() {
    return capabilities;
  }
}
