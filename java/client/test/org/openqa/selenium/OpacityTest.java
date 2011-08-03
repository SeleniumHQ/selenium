/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

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

import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.OPERA;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

import java.util.List;

public class OpacityTest extends AbstractDriverTestCase {

  /**
   * @see <a href="http://code.google.com/p/selenium/issues/detail?id=1610">
   *   http://code.google.com/p/selenium/issues/detail?id=1610</a>
   */
  @JavascriptEnabled
  @Ignore({IE, SELENESE, OPERA})
  public void testShouldBeAbleToClickOnElementsWithOpacityZero() {
    driver.get(pages.clickJacker);

    WebElement element = driver.findElement(By.id("clickJacker"));
    assertEquals("Precondition failed: clickJacker should be transparent",
        "0", element.getCssValue("opacity"));
    element.click();
    assertEquals("1", element.getCssValue("opacity"));
  }

  /**
   * @see <a href="http://code.google.com/p/selenium/issues/detail?id=1941">
   *   http://code.google.com/p/selenium/issues/detail?id=1941</a>
   */
  @JavascriptEnabled
  @Ignore({HTMLUNIT, IE, SELENESE, OPERA})
  public void testShouldBeAbleToSelectOptionsFromAnInvisibleSelect() {
    driver.get(pages.formPage);

    WebElement select = driver.findElement(By.id("invisi_select"));

    List<WebElement> options = select.findElements(By.tagName("option"));
    WebElement apples = options.get(0);
    WebElement oranges = options.get(1);

    assertFalse("Select should not be displayed", select.isDisplayed());
    assertFalse("Apples should not be displayed", apples.isDisplayed());
    assertFalse("Oranges should not be displayed", oranges.isDisplayed());

    assertTrue("Apples should be selected", apples.isSelected());
    assertFalse("Oranges shoudl be selected", oranges.isSelected());

    oranges.click();
    assertFalse("Apples should not be selected", apples.isSelected());
    assertTrue("Oranges should be selected", oranges.isSelected());
  }
}
