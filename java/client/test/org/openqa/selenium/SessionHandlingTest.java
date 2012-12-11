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

package org.openqa.selenium;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.remote.SessionNotFoundException;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.SeleniumTestRunner;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Ignore.Driver.REMOTE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

@RunWith(SeleniumTestRunner.class)
@Ignore(value = {ANDROID, IPHONE, OPERA_MOBILE, REMOTE, SAFARI, SELENESE},
    reason = "Not tested")
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
  @Ignore(value = {CHROME, PHANTOMJS})
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

  @Test(expected = SessionNotFoundException.class)
  @Ignore(value = {OPERA, HTMLUNIT}, reason =
        "Opera: throws Opera-specific exception, HtmlUnit: NPE")
  public void callingAnyOperationAfterQuitShouldThrowAnException() {
    WebDriver driver = new WebDriverBuilder().get();
    driver.quit();
    driver.getCurrentUrl();
  }

  @Test(expected = SessionNotFoundException.class)
  @Ignore(value = {FIREFOX, CHROME, OPERA, HTMLUNIT, PHANTOMJS}, reason =
      "Chrome: throws generic WebDriverException,"
      + "Firefox, HtmlUnit: can perform an operation after closing the last window,"
      + "Opera: throws Opera-specific exception,"
      + "PhantomJS: throws NoSuchWindowException")
  public void callingAnyOperationAfterClosingTheLastWindowShouldThrowAnException() {
    WebDriver driver = new WebDriverBuilder().get();
    driver.close();
    driver.getCurrentUrl();
  }

}