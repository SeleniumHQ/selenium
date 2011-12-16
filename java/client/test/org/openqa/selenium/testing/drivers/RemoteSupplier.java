// Copyright 2011 Google Inc. All Rights Reserved.

package org.openqa.selenium.testing.drivers;

import com.google.common.base.Supplier;
import com.google.common.base.Throwables;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.LocalFileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.MalformedURLException;
import java.net.URL;

/**
 * @author simonstewart@google.com (Simon Stewart)
 */
public class RemoteSupplier implements Supplier<WebDriver> {

  private Capabilities caps;

  public RemoteSupplier(Capabilities caps) {
    this.caps = caps;
  }

  public WebDriver get() {
    if (caps == null || !Boolean.getBoolean("selenium.browser.remote")) {
      return null;
    }

    try {
      // TODO(simon): Find a better way to determine where the server is.
      RemoteWebDriver driver = new RemoteWebDriver(
          new URL("http://localhost:6000/common/hub"), caps);
      driver.setFileDetector(new LocalFileDetector());
      return driver;
    } catch (MalformedURLException e) {
      throw Throwables.propagate(e);
    }
  }
}
