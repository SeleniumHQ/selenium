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
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.support.ui.ExpectedConditions.stalenessOf;
import static org.openqa.selenium.testing.TestUtilities.catchThrowable;

import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;

public class StaleElementReferenceTest extends JUnit4TestBase {

  @Test
  public void testOldPage() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));
    driver.get(pages.xhtmlTestPage);
    Throwable t = catchThrowable(elem::click);
    assertThat(t, instanceOf(StaleElementReferenceException.class));
  }

  @Test
  public void testShouldNotCrashWhenCallingGetSizeOnAnObsoleteElement() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));
    driver.get(pages.xhtmlTestPage);
    Throwable t = catchThrowable(elem::getSize);
    assertThat(t, instanceOf(StaleElementReferenceException.class));
  }

  @Test
  public void testShouldNotCrashWhenQueryingTheAttributeOfAStaleElement() {
    driver.get(pages.xhtmlTestPage);
    WebElement heading = driver.findElement(By.xpath("//h1"));
    driver.get(pages.simpleTestPage);
    Throwable t = catchThrowable(() -> heading.getAttribute("class"));
    assertThat(t, instanceOf(StaleElementReferenceException.class));
  }

  @Test
  public void testRemovingAnElementDynamicallyFromTheDomShouldCauseAStaleRefException() {
    driver.get(pages.javascriptPage);

    WebElement toBeDeleted = driver.findElement(By.id("deleted"));
    assertTrue(toBeDeleted.isDisplayed());

    driver.findElement(By.id("delete")).click();

    boolean wasStale = wait.until(stalenessOf(toBeDeleted));
    assertTrue("Element should be stale at this point", wasStale);
  }
}
