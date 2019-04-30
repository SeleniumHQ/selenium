package org.openqa.selenium.edge;

import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.CapabilityType;

public class EdgeOptions extends ChromeOptions {

  private boolean edgeHTML;

  public EdgeOptions() {
    setCapability(CapabilityType.BROWSER_NAME, BrowserType.EDGE);
    this.edgeHTML = true; // use EdgeHTML by default for now
  }

  public EdgeOptions(boolean edgeHTML) {
    setCapability(CapabilityType.BROWSER_NAME, BrowserType.EDGE);
    this.edgeHTML = edgeHTML; // use EdgeHTML by default for now
  }

  public boolean isEdgeHTML() {
    return edgeHTML;
  }
}
