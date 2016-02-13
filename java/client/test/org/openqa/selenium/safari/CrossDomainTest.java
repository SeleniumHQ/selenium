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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Pages;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
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
    JUnit4TestBase.removeDriver();
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
    assertEquals(pages.iframePage, driver.getCurrentUrl());
    WebElement body1 = driver.findElement(By.tagName("body"));

    driver.get(otherPages.iframePage);
    assertEquals(otherPages.iframePage, driver.getCurrentUrl());
    driver.findElement(By.tagName("body"));

    try {
      body1.getTagName();
      fail();
    } catch (StaleElementReferenceException expected) {
    }
  }

  @Test
  public void canSwitchToAFrameFromAnotherDomain() {
    setupCrossDomainFrameTest();

    assertEquals(otherPages.iframePage, getPageUrl());
    driver.switchTo().defaultContent();
    assertEquals(pages.iframePage, getPageUrl());
  }

  @Test
  public void cannotCrossDomainsWithExecuteScript() {
    setupCrossDomainFrameTest();

    try {
      ((JavascriptExecutor) driver).executeScript(
          "return window.top.document.body.tagName");
      fail();
    } catch (WebDriverException expected) {
    }

    // Make sure we can recover from the above.
    assertEquals("body", ((JavascriptExecutor) driver).executeScript(
        "return window.document.body.tagName.toLowerCase();"));
  }

  private void setupCrossDomainFrameTest() {
    driver.get(pages.iframePage);

    WebElement iframe = driver.findElement(By.tagName("iframe"));
    ((JavascriptExecutor) driver).executeScript(
        "arguments[0].src = arguments[1];", iframe, otherPages.iframePage);

    assertTrue(isTop());
    driver.switchTo().frame(iframe);
    assertFalse(isTop());
    wait.until(frameLocationToBe(otherPages.iframePage));
  }

  private boolean isTop() {
    return (Boolean) ((JavascriptExecutor) driver).executeScript("return window === window.top");
  }

  private String getPageUrl() {
    return (String) ((JavascriptExecutor) driver).executeScript("return window.location.href");
  }

  private ExpectedCondition<Boolean> frameLocationToBe(final String url) {
    return new ExpectedCondition<Boolean>() {
      public Boolean apply(WebDriver ignored) {
        return url.equals(getPageUrl());
      }
    };
  }
}
