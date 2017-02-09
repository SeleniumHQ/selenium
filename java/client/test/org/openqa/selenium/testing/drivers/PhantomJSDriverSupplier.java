// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.testing.drivers;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.phantomjs.PhantomJSDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.function.Supplier;

public class PhantomJSDriverSupplier implements Supplier<WebDriver> {
  private final Capabilities capabilities;

  public PhantomJSDriverSupplier(Capabilities capabilities) {
    this.capabilities = capabilities;
  }

  public WebDriver get() {
    if (capabilities == null) {
      return null;
    }

    if (!DesiredCapabilities.phantomjs().getBrowserName().equals(capabilities.getBrowserName())) {
      return null;
    }

    return new PhantomJSDriver(capabilities);
  }
}
