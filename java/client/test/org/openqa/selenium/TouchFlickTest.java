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

import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

import org.openqa.selenium.interactions.Action;
import org.openqa.selenium.interactions.touch.TouchActions;

/**
 * Tests the basic flick operations.
 */
public class TouchFlickTest extends AbstractDriverTestCase {

  private TouchActions getBuilder(WebDriver driver) {
    return new TouchActions(driver);
  }

  @Ignore(value = {CHROME, FIREFOX, HTMLUNIT, IE, IPHONE, SELENESE}, reason = "TouchScreen "
    + "operations not supported")
  public void testCanFlickHorizontally() {
    driver.get(pages.touchLongContentPage);
    WebElement toFlick = driver.findElement(By.id("imagestart"));
    Action flick = getBuilder(driver).flick(toFlick, -150, 0, 0).build();
    flick.perform();
  }

  @Ignore(value = {CHROME, FIREFOX, HTMLUNIT, IE, IPHONE, SELENESE}, reason = "TouchScreen "
    + "operations not supported")
  public void testCanFlickVertically() {
    driver.get(pages.touchLongContentPage);
    driver.navigate().refresh();
    WebElement toFlick = driver.findElement(By.id("imagestart"));
    Action flick = getBuilder(driver).flick(toFlick, 0, -150, 0).build();
    flick.perform();
  }

  @Ignore(value = {CHROME, FIREFOX, HTMLUNIT, IE, IPHONE, SELENESE}, reason = "TouchScreen "
                    + "operations not supported")
  public void testCanFlickFast() {
    driver.get(pages.touchLongContentPage);
    driver.navigate().refresh();

    Action flick = getBuilder(driver).flick(0, 4000).build();
    flick.perform();
  }       
}
