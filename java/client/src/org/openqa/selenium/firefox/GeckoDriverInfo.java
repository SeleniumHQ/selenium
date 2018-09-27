package org.openqa.selenium.firefox;

import static org.openqa.selenium.firefox.FirefoxDriver.MARIONETTE;
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
public class GeckoDriverInfo implements WebDriverInfo {

  @Override
  public String getDisplayName() {
    return "Firefox";
  }

  @Override
  public Capabilities getCanonicalCapabilities() {
    return new ImmutableCapabilities(BROWSER_NAME, BrowserType.FIREFOX);
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    if (capabilities.is(MARIONETTE)) {
      return false;
    }

    if (BrowserType.FIREFOX.equals(capabilities.getBrowserName())) {
      return true;
    }

    return capabilities.asMap().keySet().stream()
        .map(key -> key.startsWith("moz:"))
        .reduce(Boolean::logicalOr)
        .orElse(false);
  }

  @Override
  public boolean isAvailable() {
    try {
      GeckoDriverService.createDefaultService();
      return true;
    } catch (IllegalStateException | WebDriverException e) {
      return false;
    }
  }

  @Override
  public int getMaximumSimultaneousSessions() {
    return Runtime.getRuntime().availableProcessors() + 1;
  }

  @Override
  public Optional<WebDriver> createDriver(Capabilities capabilities)
      throws SessionNotCreatedException {
    if (!isAvailable()) {
      return Optional.empty();
    }

    if (capabilities.is(MARIONETTE)) {
      return Optional.empty();
    }

    return Optional.of(new FirefoxDriver(capabilities));
  }
}
