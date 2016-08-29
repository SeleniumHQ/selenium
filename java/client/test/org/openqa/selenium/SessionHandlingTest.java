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

package org.openqa.selenium;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.SeleniumTestRunner;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import static org.openqa.selenium.testing.Driver.FIREFOX;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Driver.REMOTE;
import static org.openqa.selenium.testing.Driver.SAFARI;

@RunWith(SeleniumTestRunner.class)
@Ignore(value = {REMOTE}, reason = "Not tested")
public class SessionHandlingTest {

  @Test
  public void callingQuitMoreThanOnceOnASessionIsANoOp() {
    WebDriver driver = new WebDriverBuilder().get();

    driver.quit();

    try {
      driver.quit();
    } catch (RuntimeException e) {
      throw new RuntimeException(
          "It should be possible to quit a session more than once, got exception:", e);
    }
  }

  @Test
  @Ignore(value = {PHANTOMJS})
  public void callingQuitAfterClosingTheLastWindowIsANoOp() {
    WebDriver driver = new WebDriverBuilder().get();

    driver.close();

    try {
      driver.quit();
    } catch (RuntimeException e) {
      throw new RuntimeException(
          "It should be possible to quit a session more than once, got exception:", e);
    }
  }

  @Test(expected = NoSuchSessionException.class)
  @Ignore(value = {SAFARI}, reason = "Safari: throws UnreachableBrowserException")
  public void callingAnyOperationAfterQuitShouldThrowAnException() {
    WebDriver driver = new WebDriverBuilder().get();
    driver.quit();
    driver.getCurrentUrl();
  }

  @Test(expected = NoSuchSessionException.class)
  @Ignore(value = {FIREFOX, PHANTOMJS, SAFARI, MARIONETTE}, reason =
      "Firefox: can perform an operation after closing the last window,"
      + "PhantomJS: throws NoSuchWindowException,"
      + "Safari: throws NullPointerException")
  public void callingAnyOperationAfterClosingTheLastWindowShouldThrowAnException() {
    WebDriver driver = new WebDriverBuilder().get();
    driver.close();
    driver.getCurrentUrl();
  }

}
