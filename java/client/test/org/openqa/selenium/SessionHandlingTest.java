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

import static org.hamcrest.Matchers.instanceOf;
import static org.junit.Assert.assertThat;
import static org.openqa.selenium.testing.Driver.FIREFOX;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Driver.SAFARI;
import static org.openqa.selenium.testing.TestUtilities.catchThrowable;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SeleniumTestRunner;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

@RunWith(SeleniumTestRunner.class)
public class SessionHandlingTest {

  @Test
  public void callingQuitMoreThanOnceOnASessionIsANoOp() {
    WebDriver driver = new WebDriverBuilder().get();

    driver.quit();
    sleepTight(3000);
    driver.quit();
  }

  @Test
  @Ignore(value = FIREFOX, issue = "https://github.com/SeleniumHQ/selenium/issues/3792")
  @Ignore(PHANTOMJS)
  @Ignore(value = MARIONETTE, reason = "https://github.com/mozilla/geckodriver/issues/689")
  public void callingQuitAfterClosingTheLastWindowIsANoOp() {
    WebDriver driver = new WebDriverBuilder().get();

    driver.close();
    sleepTight(3000);
    driver.quit();
  }

  @Test
  @Ignore(value = FIREFOX, issue = "3792")
  @Ignore(value = PHANTOMJS, reason = "throws NoSuchWindowException")
  @Ignore(value = SAFARI, reason = "throws NullPointerException")
  @Ignore(value = MARIONETTE, reason = "https://github.com/mozilla/geckodriver/issues/689")
  public void callingAnyOperationAfterClosingTheLastWindowShouldThrowAnException() {
    WebDriver driver = new WebDriverBuilder().get();

    driver.close();
    sleepTight(3000);
    Throwable t = catchThrowable(driver::getCurrentUrl);
    assertThat(t, instanceOf(NoSuchSessionException.class));
  }

  @Test
  @Ignore(value = SAFARI, reason = "Safari: throws UnreachableBrowserException")
  public void callingAnyOperationAfterQuitShouldThrowAnException() {
    WebDriver driver = new WebDriverBuilder().get();

    driver.quit();
    sleepTight(3000);
    Throwable t = catchThrowable(driver::getCurrentUrl);
    assertThat(t, instanceOf(NoSuchSessionException.class));
  }

  private void sleepTight(long duration) {
    try {
      Thread.sleep(duration);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }

}
