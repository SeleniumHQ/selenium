/*
Copyright 2007-2009 Selenium committers

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
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;

import static org.junit.Assert.fail;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

public class StaleElementReferenceTest extends JUnit4TestBase {

  @Test
  public void testOldPage() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));
    driver.get(pages.xhtmlTestPage);
    try {
      elem.click();
      fail();
    } catch (StaleElementReferenceException e) {
      // do nothing. this is what we expected.
    }
  }

  @JavascriptEnabled
  @Test
  public void testShouldNotCrashWhenCallingGetSizeOnAnObsoleteElement() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));
    driver.get(pages.xhtmlTestPage);
    try {
      elem.getSize();
      fail();
    } catch (StaleElementReferenceException e) {
      // do nothing. this is what we expected.
    }
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  @Test
  public void testShouldNotCrashWhenQueryingTheAttributeOfAStaleElement() {
    driver.get(pages.xhtmlTestPage);
    WebElement heading = driver.findElement(By.xpath("//h1"));
    driver.get(pages.simpleTestPage);
    try {
      heading.getAttribute("class");
      fail();
    } catch (StaleElementReferenceException e) {
      // do nothing. this is what we expected.
    }
  }
}
