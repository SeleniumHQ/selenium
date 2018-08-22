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

@Deprecated
@AutoService(WebDriverInfo.class)
public class XpiDriverInfo implements WebDriverInfo {

  @Override
  public String getDisplayName() {
    return "Firefox (legacy driver)";
  }

  @Override
  public Capabilities getCanonicalCapabilities() {
    return new ImmutableCapabilities(BROWSER_NAME, BrowserType.FIREFOX, MARIONETTE, true);
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    return capabilities.is(MARIONETTE);
  }

  @Override
  public boolean isAvailable() {
    try {
      // This will search $PATH looking for the binary. It's not perfect, since the user may be
      // setting the path to the binary with a capability, but this will work in almost all common
      // cases.
      new FirefoxBinary();
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

    if (!capabilities.is(MARIONETTE)) {
      return Optional.empty();
    }

    return Optional.of(new FirefoxDriver(capabilities));
  }
}
