package org.openqa.selenium.safari;

import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

import com.google.auto.service.AutoService;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebDriverInfo;

import java.util.Optional;

@AutoService(WebDriverInfo.class)
public class SafariTechPreviewDriverInfo implements WebDriverInfo {

  @Override
  public String getDisplayName() {
    return "Safari Technology Preview";
  }

  @Override
  public Capabilities getCanonicalCapabilities() {
    return new ImmutableCapabilities(BROWSER_NAME, SafariOptions.SAFARI_TECH_PREVIEW);
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    if (SafariOptions.SAFARI_TECH_PREVIEW.equals(capabilities.getBrowserName())) {
      return true;
    }

    return capabilities.asMap().keySet().parallelStream()
        .map(key -> key.startsWith("safari.") || key.startsWith("safari:"))
        .reduce(Boolean::logicalOr)
        .orElse(false);
  }

  @Override
  public boolean isAvailable() {
    try {
      SafariDriverService.createDefaultService(getCanonicalCapabilities());
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

    return Optional.of(new SafariDriver(capabilities));
  }
}
