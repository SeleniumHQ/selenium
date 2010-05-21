/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

package org.openqa.selenium;

import com.google.common.base.Supplier;
import com.thoughtworks.selenium.SeleniumException;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

// In two minds about whether to make this class part of the public API
class SuppliesWebDriver implements Supplier<WebDriver> {
  private final Capabilities capabilities;

  SuppliesWebDriver(Capabilities caps) {
    capabilities = caps;
  }

  public WebDriver get() {
    String browser = capabilities.getBrowserName();
    if (DesiredCapabilities.firefox().getBrowserName().equals(browser)) {
      return new FirefoxDriver();
    } else if (DesiredCapabilities.internetExplorer().getBrowserName().equals(browser)) {
      return new InternetExplorerDriver();
    } else if (DesiredCapabilities.chrome().getBrowserName().equals(browser)) {
      return new ChromeDriver();
    }

    throw new SeleniumException("Unable to determine which driver to use: " + capabilities);
  }
}
