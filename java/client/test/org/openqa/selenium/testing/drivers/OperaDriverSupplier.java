/*
Copyright 2012 WebDriver committers

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

    // It's okay to avoid reflection here because the OperaDriver is a third party dependency
    OperaDriver driver = new OperaDriver(caps);
    driver.preferences().set("User Prefs", "Ignore Unrequested Popups", false);
    return driver;
  }

}
