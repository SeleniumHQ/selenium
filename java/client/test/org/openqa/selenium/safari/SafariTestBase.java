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

package org.openqa.selenium.safari;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.JUnit4TestBase;

import org.junit.Before;

public class SafariTestBase extends JUnit4TestBase {

  private static WebDriver staticDriver = null;

  @Before
  @Override
  public void createDriver() {
    driver = actuallyCreateDriver(DesiredCapabilities.safari());
    wait = new WebDriverWait(driver, 30);
    shortWait = new WebDriverWait(driver, 5);
  }

  public static WebDriver actuallyCreateDriver(Capabilities capabilities) {
    if (staticDriver == null) {
      staticDriver = new SafariDriver(capabilities);
    }
    return staticDriver;
  }

  public static void quitDriver() {
    if (staticDriver != null) {
      staticDriver.quit();
      staticDriver = null;
    }
  }
}
