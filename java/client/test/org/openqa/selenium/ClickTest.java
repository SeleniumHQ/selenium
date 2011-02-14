/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

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

import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

public class ClickTest extends AbstractDriverTestCase {
  @Override
  protected void setUp() throws Exception {
    super.setUp();

    driver.get(appServer.whereIs("clicks.html"));
  }

  @Ignore(SELENESE)
  public void testCanClickOnALinkAndFollowIt() {
    driver.findElement(By.id("normal")).click();

    assertEquals("XHTML Test Page", driver.getTitle());
  }

  @JavascriptEnabled
  public void testCanClickOnAnAnchorAndNotReloadThePage() {
    ((JavascriptExecutor) driver).executeScript("document.latch = true");

    driver.findElement(By.id("anchor")).click();

    Boolean samePage = (Boolean) ((JavascriptExecutor) driver)
        .executeScript("return document.latch");

    assertEquals("Latch was reset", Boolean.TRUE, samePage);
  }

  @Ignore(value = IPHONE, reason = "Frame switching is unsupported")
  public void testCanClickOnALinkThatUpdatesAnotherFrame() {
    driver.switchTo().frame("source");

    driver.findElement(By.id("otherframe")).click();
    driver.switchTo().defaultContent().switchTo().frame("target");

    assertTrue("Target did not reload",
        driver.getPageSource().contains("Hello WebDriver"));
  }
  
  @JavascriptEnabled
  @Ignore(value = {IPHONE, SELENESE},
      reason = "iPhone: Frame switching is unsupported")
  public void testElementsFoundByJsCanLoadUpdatesInAnotherFrame() {
    driver.switchTo().frame("source");

    WebElement toClick = (WebElement) ((JavascriptExecutor) driver).executeScript(
        "return document.getElementById('otherframe');"
    );
    toClick.click();
    driver.switchTo().defaultContent().switchTo().frame("target");

    assertTrue("Target did not reload",
        driver.getPageSource().contains("Hello WebDriver"));
  }

  @JavascriptEnabled
  @Ignore(value = {IPHONE, SELENESE},
      reason = "iPhone: Frame switching is unsupported")
  public void testJsLoactedElementsCanUpdateFramesIfFoundSomehowElse() {
    driver.switchTo().frame("source");

    // Prime the cache of elements
    driver.findElement(By.id("otherframe"));

    // This _should_ return the same element
    WebElement toClick = (WebElement) ((JavascriptExecutor) driver).executeScript(
        "return document.getElementById('otherframe');"
    );
    toClick.click();
    driver.switchTo().defaultContent().switchTo().frame("target");

    assertTrue("Target did not reload",
        driver.getPageSource().contains("Hello WebDriver"));
  }
}
