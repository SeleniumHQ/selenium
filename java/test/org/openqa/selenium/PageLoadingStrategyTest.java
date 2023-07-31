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

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.drivers.Browser;

public class PageLoadingStrategyTest extends JupiterTestBase {

  @Test
  @NoDriverBeforeTest
  @NoDriverAfterTest
  @Ignore(value = CHROME, reason = "Flaky")
  @Ignore(value = EDGE, reason = "Flaky")
  public void testNoneStrategyShouldNotWaitForPageToRefresh() {
    initDriverWithLoadStrategy("none");

    String slowPage = appServer.whereIs("sleep?time=5");

    driver.get(slowPage);
    // We discard the element, but want a check to make sure the page is loaded
    wait.until(presenceOfElementLocated(By.tagName("body")));

    long start = System.currentTimeMillis();
    driver.navigate().refresh();
    long end = System.currentTimeMillis();

    long duration = end - start;
    // The slow loading resource on that page takes 6 seconds to return,
    // but with 'none' page loading strategy 'refresh' operation should not wait.
    assertThat(duration).as("Page loading duration").isLessThan(1000);
  }

  @Test
  @NoDriverBeforeTest
  @NoDriverAfterTest
  public void testEagerStrategyShouldNotWaitForResources() {
    initDriverWithLoadStrategy("eager");

    String slowPage = appServer.whereIs("slowLoadingResourcePage.html");

    long start = System.currentTimeMillis();
    driver.get(slowPage);
    // We discard the element, but want a check to make sure the GET actually
    // completed.
    wait.until(presenceOfElementLocated(By.id("peas")));
    long end = System.currentTimeMillis();

    // The slow loading resource on that page takes 6 seconds to return. If we
    // waited for it, our load time should be over 6 seconds.
    long duration = end - start;
    assertThat(duration).as("Page loading duration").isLessThan(5 * 1000);
  }

  @Test
  @NoDriverBeforeTest
  @NoDriverAfterTest
  public void testEagerStrategyShouldNotWaitForResourcesOnRefresh() {
    initDriverWithLoadStrategy("eager");

    String slowPage = appServer.whereIs("slowLoadingResourcePage.html");

    driver.get(slowPage);
    // We discard the element, but want a check to make sure the GET actually completed.
    wait.until(presenceOfElementLocated(By.id("peas")));

    long start = System.currentTimeMillis();
    driver.navigate().refresh();
    // We discard the element, but want a check to make sure the refresh actually completed.
    wait.until(presenceOfElementLocated(By.id("peas")));
    long end = System.currentTimeMillis();

    // The slow loading resource on that page takes 6 seconds to return. If we
    // waited for it, our load time should be over 6 seconds.
    long duration = end - start;
    assertThat(duration).as("Page loading duration").isLessThan(5 * 1000);
  }

  @Test
  @NoDriverBeforeTest
  @NoDriverAfterTest
  public void testEagerStrategyShouldWaitForDocumentToBeLoaded() {
    initDriverWithLoadStrategy("eager");

    String slowPage = appServer.whereIs("sleep?time=3");

    driver.get(slowPage);

    // We discard the element, but want a check to make sure the GET actually completed.
    wait.until(presenceOfElementLocated(By.tagName("body")));
  }

  @Test
  void testNormalStrategyShouldWaitForDocumentToBeLoaded() {
    driver.get(pages.simpleTestPage);
    assertThat(driver.getTitle()).isEqualTo("Hello WebDriver");
  }

  @Test
  @NoDriverBeforeTest
  @NoDriverAfterTest
  public void testNoneStrategyShouldNotWaitForPageToLoad() {
    initDriverWithLoadStrategy("none");

    String slowPage = appServer.whereIs("sleep?time=5");

    long start = System.currentTimeMillis();
    driver.get(slowPage);
    long end = System.currentTimeMillis();

    long duration = end - start;
    // The slow loading resource on that page takes 6 seconds to return,
    // but with 'none' page loading strategy 'get' operation should not wait.
    assertThat(duration).as("Page loading duration").isLessThan(1000);
  }

  private void initDriverWithLoadStrategy(String strategy) {
    Capabilities caps =
        Browser.detect()
            .getCapabilities()
            .merge(new ImmutableCapabilities(CapabilityType.PAGE_LOAD_STRATEGY, strategy));
    createNewDriver(caps);
  }
}
