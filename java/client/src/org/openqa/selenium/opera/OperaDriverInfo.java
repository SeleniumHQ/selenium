package org.openqa.selenium.opera;

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
public class OperaDriverInfo implements WebDriverInfo {

  @Override
  public String getDisplayName() {
    return "Opera";
  }

  @Override
  public Capabilities getCanonicalCapabilities() {
    return new ImmutableCapabilities(BROWSER_NAME, BrowserType.OPERA_BLINK);
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    return BrowserType.OPERA_BLINK.equals(capabilities.getBrowserName()) ||
           BrowserType.OPERA.equals(capabilities.getBrowserName());
  }

  @Override
  public boolean isAvailable() {
    try {
      OperaDriverService.createDefaultService();
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

    return Optional.of(new OperaDriver(capabilities));
  }
}
