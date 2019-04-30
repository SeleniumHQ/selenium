package org.openqa.selenium.edge;

import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.remote.BrowserType;

import java.util.Optional;

public abstract class EdgeDriverInfo implements WebDriverInfo {

  @Override
  public String getDisplayName() {
    return "Edge";
  }

  @Override
  public Capabilities getCanonicalCapabilities() {
    return new ImmutableCapabilities(BROWSER_NAME, BrowserType.EDGE);
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    return BrowserType.EDGE.equals(capabilities.getBrowserName()) ||
           capabilities.getCapability("edgeOptions") != null;
  }

  @Override
  public abstract boolean isAvailable();

  @Override
  public int getMaximumSimultaneousSessions() {
    return Runtime.getRuntime().availableProcessors() + 1;
  }

  @Override
  public Optional<WebDriver> createDriver(Capabilities capabilities)
      throws SessionNotCreatedException {
    if (!isAvailable() || !isSupporting(capabilities)) {
      return Optional.empty();
    }

    return Optional.of(new EdgeDriver(capabilities));
  }
}
