/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

public class TestInternetExplorerSupplier implements Supplier<WebDriver> {
  private Capabilities caps;

  public TestInternetExplorerSupplier(Capabilities caps) {
    this.caps = caps;
  }

  public WebDriver get() {
    if (caps == null) {
      return null;
    }

    if (!DesiredCapabilities.internetExplorer().getBrowserName().equals(caps.getBrowserName())) {
      return null;
    }

    return new LocallyBuiltInternetExplorerDriver(caps);
  }
}
