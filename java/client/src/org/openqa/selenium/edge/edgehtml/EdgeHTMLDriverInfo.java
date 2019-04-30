package org.openqa.selenium.edge.edgehtml;

import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.BrowserType;

public class EdgeHTMLDriverInfo extends org.openqa.selenium.edge.EdgeDriverInfo {

  @Override
  public Capabilities getCanonicalCapabilities() {
    return new ImmutableCapabilities(BROWSER_NAME, BrowserType.EDGE);
  }

  @Override
  public boolean isAvailable() {
    try {
      EdgeHTMLDriverService.createDefaultService();
      return true;
    } catch (IllegalStateException | WebDriverException e) {
      return false;
    }
  }

  @Override
  public int getMaximumSimultaneousSessions() {
    return 1;
  }
}
