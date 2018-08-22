package org.openqa.selenium.chrome;

import com.google.auto.service.AutoService;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.CapabilityType;

import java.util.Optional;

@AutoService(WebDriverInfo.class)
public class ChromeDriverInfo implements WebDriverInfo {

  @Override
  public String getDisplayName() {
    return "Chrome";
  }

  @Override
  public Capabilities getCanonicalCapabilities() {
    return new ImmutableCapabilities(CapabilityType.BROWSER_NAME, BrowserType.CHROME);
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    return BrowserType.CHROME.equals(capabilities.getBrowserName()) ||
           capabilities.getCapability("chromeOptions") != null ||
           capabilities.getCapability("goog:chromeOptions") != null;
  }

  @Override
  public boolean isAvailable() {
    try {
      ChromeDriverService.createDefaultService();
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
    if (!isAvailable() || !isSupporting(capabilities)) {
      return Optional.empty();
    }

    WebDriver driver = new ChromeDriver(capabilities);

    return Optional.of(driver);
  }
}
