package org.openqa.selenium.remote;

import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

import com.google.auto.service.AutoService;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.devtools.HasDevTools;

import java.util.Optional;

@AutoService(WebDriverInfo.class)
public class FakeWebDriverInfo implements WebDriverInfo {

  @Override
  public String getDisplayName() {
    return "selenium-test";
  }

  @Override
  public Capabilities getCanonicalCapabilities() {
    return new ImmutableCapabilities(BROWSER_NAME, "selenium-test");
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    return true;
  }

  @Override
  public boolean isSupportingCdp() {
    return true;
  }

  @Override
  public boolean isAvailable() {
    return true;
  }

  @Override
  public int getMaximumSimultaneousSessions() {
    return Runtime.getRuntime().availableProcessors();
  }

  @Override
  public Optional<WebDriver> createDriver(Capabilities capabilities)
    throws SessionNotCreatedException {

    return Optional.of(new FakeWebDriver());
  }

  public static class FakeWebDriver extends RemoteWebDriver {

    @Override
    protected void startSession(Capabilities capabilities) {
      // no-op
    }

    @Override
    public void quit() {
      // no-op
    }
  }
}