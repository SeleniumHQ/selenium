/*
Copyright 2007-2011 WebDriver committers
Copyright 2007-2011 Google Inc.

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

import org.openqa.selenium.interactions.Action;
import org.openqa.selenium.interactions.touch.TouchActions;

import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.OPERA;
import static org.openqa.selenium.Ignore.Driver.SELENESE;
import static org.openqa.selenium.TestWaiter.waitFor;

/**
 * Tests the basic double tap operations
 */
public class TouchDoubleTapTest extends AbstractDriverTestCase {

  private TouchActions getBuilder(WebDriver driver) {
    return new TouchActions(driver);
  }

  @JavascriptEnabled
  @Ignore(value = {CHROME, FIREFOX, HTMLUNIT, IE, IPHONE, OPERA, SELENESE}, reason = "TouchScreen "
                  + "operations not supported")
  private void doubleTapOnElement(String elementId) {
    WebElement toDoubleTap = driver.findElement(By.id(elementId));
    Action doubleTap = getBuilder(driver).doubleTap(toDoubleTap).build();
    doubleTap.perform();
  }

  public void testCanDoubleTapOnALinkAndFollowIt() {
    driver.get(pages.clicksPage);

    doubleTapOnElement("normal");    
  }

}
