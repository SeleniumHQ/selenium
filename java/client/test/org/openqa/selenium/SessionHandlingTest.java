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
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.SeleniumTestRunner;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.REMOTE;

@RunWith(SeleniumTestRunner.class)
public class SessionHandlingTest {

  @Test
  @Ignore({CHROME, IE, OPERA, OPERA_MOBILE, REMOTE})
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

}