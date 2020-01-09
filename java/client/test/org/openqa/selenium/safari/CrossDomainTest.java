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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.testing.Pages;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.JettyAppServer;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;

@NeedsLocalEnvironment(reason = "Uses a local server")
public class CrossDomainTest extends JUnit4TestBase {

  private static AppServer otherServer;
  private static Pages otherPages;

  @AfterClass
  public static void quitDriver() {
    removeDriver();
  }


  @BeforeClass
  public static void startSecondServer() {
    otherServer = new JettyAppServer();
    otherServer.start();

    otherPages = new Pages(otherServer);
  }

  @AfterClass
  public static void stopSecondServer() {
    otherServer.stop();
  }

  @Test
  public void canNavigateBetweenDomains() {
    driver.get(pages.iframePage);
    assertThat(driver.getCurrentUrl()).isEqualTo(pages.iframePage);
    WebElement body1 = driver.findElement(By.tagName("body"));

    driver.get(otherPages.iframePage);
    assertThat(driver.getCurrentUrl()).isEqualTo(otherPages.iframePage);
    driver.findElement(By.tagName("body"));

    assertThatExceptionOfType(StaleElementReferenceException.class)
        .isThrownBy(body1::getTagName);
  }

  @Test
  public void canSwitchToAFrameFromAnotherDomain() {
    setupCrossDomainFrameTest();

    assertThat(getPageUrl()).isEqualTo(otherPages.iframePage);
    driver.switchTo().defaultContent();
    assertThat(getPageUrl()).isEqualTo(pages.iframePage);
  }

  @Test
  public void cannotCrossDomainsWithExecuteScript() {
    setupCrossDomainFrameTest();

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> ((JavascriptExecutor) driver).executeScript(
            "return window.top.document.body.tagName"));

    // Make sure we can recover from the above.
    assertThat(((JavascriptExecutor) driver).executeScript(
        "return window.document.body.tagName.toLowerCase();")).isEqualTo("body");
  }

  private void setupCrossDomainFrameTest() {
    driver.get(pages.iframePage);

    WebElement iframe = driver.findElement(By.tagName("iframe"));
    ((JavascriptExecutor) driver).executeScript(
        "arguments[0].src = arguments[1];", iframe, otherPages.iframePage);

    assertThat(isTop()).isTrue();
    driver.switchTo().frame(iframe);
    assertThat(isTop()).isFalse();
    wait.until(frameLocationToBe(otherPages.iframePage));
  }

  private boolean isTop() {
    return (Boolean) ((JavascriptExecutor) driver).executeScript("return window === window.top");
  }

  private String getPageUrl() {
    return (String) ((JavascriptExecutor) driver).executeScript("return window.location.href");
  }

  private ExpectedCondition<Boolean> frameLocationToBe(final String url) {
    return ignored -> url.equals(getPageUrl());
  }
}
