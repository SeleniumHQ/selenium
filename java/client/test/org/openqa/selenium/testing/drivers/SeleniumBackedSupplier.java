/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.testing.drivers;

import com.google.common.base.Supplier;
import com.google.common.base.Throwables;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.v1.SeleneseBackedWebDriver;

import static org.junit.Assert.fail;

public class SeleniumBackedSupplier implements Supplier<WebDriver> {

  private final Capabilities capabilities;
  private final OutOfProcessSeleniumServer oops = new OutOfProcessSeleniumServer();

  public SeleniumBackedSupplier(Capabilities capabilities) {
    this.capabilities = capabilities;
  }

  public WebDriver get() {
    if (!isSeleniumBacked()) {
      return null;
    }

    oops.start();
    Capabilities serverCapabilities = oops.describe();
    DesiredCapabilities toUse = new DesiredCapabilities(serverCapabilities, capabilities);
    toUse.setBrowserName(determineBrowserName());

    try {
      return new SeleneseBackedWebDriver(toUse);
    } catch (Exception e) {
      throw Throwables.propagate(e);
    }
  }

  private String determineBrowserName() {
    String property = System.getProperty("selenium.browser");
    if (property == null) {
      return "*chrome";  // Default to firefox
    }

    if (property.startsWith("*")) {
      return property;
    }

    Browser browser = Browser.valueOf(property);
    switch (browser) {
      case chrome:
        return "*googlechrome";

      case ie:
      return "*iexplore";

      case ff:
        return "*firefox";

      case safari:
        return "*safari";

      default:
        fail("Attempt to use an unsupported browser: " + property);
    }

    return null; // we never get here.
  }

  private boolean isSeleniumBacked() {
    return Boolean.getBoolean("selenium.browser.selenium");
  }
}
