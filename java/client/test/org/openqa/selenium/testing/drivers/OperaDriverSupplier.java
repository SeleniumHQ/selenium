// Copyright 2011 Google Inc. All Rights Reserved.

package org.openqa.selenium.testing.drivers;

import com.google.common.base.Supplier;

import com.opera.core.systems.OperaDriver;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

/**
 * @author simonstewart@google.com (Simon Stewart)
 */
public class OperaDriverSupplier implements Supplier<WebDriver> {

  private Capabilities caps;

  public OperaDriverSupplier(Capabilities caps) {
    this.caps = caps;
  }

  public WebDriver get() {
    if (caps == null) {
      return null;
    }

    if (!DesiredCapabilities.opera().getBrowserName().equals(caps.getBrowserName())) {
      return null;
    }

    // It's okay to avoid reflection here because the opera driver is a third
    // party dependency.
    OperaDriver driver = new OperaDriver(caps);
    driver.setPref("User Prefs", "Ignore Unrequested Popups", "0");
    return driver;
  }
}
