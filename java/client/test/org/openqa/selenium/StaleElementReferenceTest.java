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
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.support.ui.ExpectedConditions.stalenessOf;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NotYetImplemented;

public class StaleElementReferenceTest extends JUnit4TestBase {

  @Test
  public void testOldPage() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(StaleElementReferenceException.class).isThrownBy(elem::click);
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldNotCrashWhenCallingGetSizeOnAnObsoleteElement() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(StaleElementReferenceException.class).isThrownBy(elem::getSize);
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldNotCrashWhenQueryingTheAttributeOfAStaleElement() {
    driver.get(pages.xhtmlTestPage);
    WebElement heading = driver.findElement(By.xpath("//h1"));
    driver.get(pages.simpleTestPage);
    assertThatExceptionOfType(StaleElementReferenceException.class)
        .isThrownBy(() -> heading.getAttribute("class"));
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testRemovingAnElementDynamicallyFromTheDomShouldCauseAStaleRefException() {
    driver.get(pages.javascriptPage);

    WebElement toBeDeleted = driver.findElement(By.id("deleted"));
    assertThat(toBeDeleted.isDisplayed()).isTrue();

    driver.findElement(By.id("delete")).click();

    boolean wasStale = wait.until(stalenessOf(toBeDeleted));
    assertThat(wasStale).isTrue();
  }
}
