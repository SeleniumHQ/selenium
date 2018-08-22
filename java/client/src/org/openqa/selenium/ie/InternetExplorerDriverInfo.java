package org.openqa.selenium.ie;

import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

import com.google.auto.service.AutoService;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.remote.BrowserType;

import java.util.Optional;

@AutoService(WebDriverInfo.class)
public class InternetExplorerDriverInfo implements WebDriverInfo {

  @Override
  public String getDisplayName() {
    return "Internet Explorer";
  }

  @Override
  public Capabilities getCanonicalCapabilities() {
    return new ImmutableCapabilities(BROWSER_NAME, BrowserType.IE);
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    return BrowserType.IE.equals(capabilities.getBrowserName()) ||
           capabilities.getCapability("se:ieOptions") != null;
  }

  @Override
  public boolean isAvailable() {
    try {
      InternetExplorerDriverService.createDefaultService();
      return true;
    } catch (IllegalStateException | WebDriverException e) {
      return false;
    }
  }

  @Override
  public int getMaximumSimultaneousSessions() {
    return 1;
  }

  @Override
  public Optional<WebDriver> createDriver(Capabilities capabilities)
      throws SessionNotCreatedException {
    if (!isAvailable()) {
      return Optional.empty();
    }

    return Optional.of(new InternetExplorerDriver(capabilities));
  }
}
