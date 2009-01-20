/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.SAFARI;

public class VisibilityTest extends AbstractDriverTestCase {

  @JavascriptEnabled
  @Ignore(SAFARI)
  public void testShouldAllowTheUserToTellIfAnElementIsDisplayedOrNot() {
    driver.get(javascriptPage);

    assertThat(((RenderedWebElement) driver.findElement(By.id("displayed"))).isDisplayed(),
               is(true));
    assertThat(((RenderedWebElement) driver.findElement(By.id("none"))).isDisplayed(), is(false));
    assertThat(((RenderedWebElement) driver.findElement(By.id("suppressedParagraph"))).isDisplayed(), is(false));
    assertThat(((RenderedWebElement) driver.findElement(By.id("hidden"))).isDisplayed(), is(false));
  }

  @JavascriptEnabled
  @Ignore(SAFARI)
  public void testVisibilityShouldTakeIntoAccountParentVisibility() {
    driver.get(javascriptPage);

    RenderedWebElement childDiv = (RenderedWebElement) driver.findElement(By.id("hiddenchild"));
    RenderedWebElement hiddenLink = (RenderedWebElement) driver.findElement(By.id("hiddenlink"));

    assertFalse(childDiv.isDisplayed());
    assertFalse(hiddenLink.isDisplayed());
  }

  @JavascriptEnabled
  @Ignore({SAFARI, IE, HTMLUNIT})
  public void testShouldCountElementsAsVisibleIfStylePropertyHasBeenSet() {
    driver.get(javascriptPage);

    RenderedWebElement shown = (RenderedWebElement) driver.findElement(By.id("visibleSubElement"));

    assertTrue(shown.isDisplayed());
  }

  @JavascriptEnabled
  @Ignore({SAFARI, IE})
  public void testHiddenInputElementsAreNeverVisible() {
    driver.get(javascriptPage);

    RenderedWebElement shown = (RenderedWebElement) driver.findElement(By.name("hidden"));

    assertFalse(shown.isDisplayed());
  }

  @JavascriptEnabled
  @Ignore
  public void testShouldNotAllowAnElementWithZeroHeightToBeCountedAsDisplayed() {
    driver.get(javascriptPage);

    RenderedWebElement zeroHeight = (RenderedWebElement) driver.findElement(By.id("zeroheight"));

    assertFalse(zeroHeight.isDisplayed());
  }

  @JavascriptEnabled
  @Ignore
  public void testShouldNotAllowAnElementWithZeroWidthToBeCountedAsDisplayed() {
    driver.get(javascriptPage);

    RenderedWebElement zeroWidth = (RenderedWebElement) driver.findElement(By.id("zerowidth"));

    assertFalse(zeroWidth.isDisplayed());
  }


}
