package org.openqa.grid.web.servlet.beta;

import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSlot;
import org.openqa.grid.web.utils.BrowserNameUtils;
import org.openqa.selenium.remote.DesiredCapabilities;


/**
 * the browser on the console will be organized per browserName and version only.
 */
public class MiniCapability {
  private String browser;
  private String version;
  private DesiredCapabilities capabilities;
  private RemoteProxy proxy;

  public MiniCapability(TestSlot slot) {
    DesiredCapabilities cap = new DesiredCapabilities(slot.getCapabilities());
    browser = cap.getBrowserName();
    version = cap.getVersion();
    capabilities = cap;
    this.proxy = slot.getProxy();

  }

  public String getVersion() {
    return version;
  }

  public String getIcon() {
    return BrowserNameUtils.getConsoleIconPath(new DesiredCapabilities(capabilities),
        proxy.getRegistry());
  }

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + ((browser == null) ? 0 : browser.hashCode());
    result = prime * result + ((version == null) ? 0 : version.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj) return true;
    if (obj == null) return false;
    if (getClass() != obj.getClass()) return false;
    MiniCapability other = (MiniCapability) obj;
    if (browser == null) {
      if (other.browser != null) return false;
    } else if (!browser.equals(other.browser)) return false;
    if (version == null) {
      if (other.version != null) return false;
    } else if (!version.equals(other.version)) return false;
    return true;
  }



}
