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
import static org.hamcrest.Matchers.not;
import static org.hamcrest.core.Is.is;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;
import static org.openqa.selenium.TestWaiter.waitFor;

import java.util.concurrent.Callable;

public class VisibilityTest extends AbstractDriverTestCase {

  @JavascriptEnabled
  public void testShouldAllowTheUserToTellIfAnElementIsDisplayedOrNot() {
    driver.get(pages.javascriptPage);

    assertThat(driver.findElement(By.id("displayed")).isDisplayed(),
               is(true));
    assertThat(driver.findElement(By.id("none")).isDisplayed(), is(false));
    assertThat(driver.findElement(By.id("suppressedParagraph")).isDisplayed(), is(false));
    assertThat(driver.findElement(By.id("hidden")).isDisplayed(), is(false));
  }

  @JavascriptEnabled
  public void testVisibilityShouldTakeIntoAccountParentVisibility() {
    driver.get(pages.javascriptPage);

    WebElement childDiv = driver.findElement(By.id("hiddenchild"));
    WebElement hiddenLink = driver.findElement(By.id("hiddenlink"));

    assertFalse(childDiv.isDisplayed());
    assertFalse(hiddenLink.isDisplayed());
  }

  @JavascriptEnabled
  public void testShouldCountElementsAsVisibleIfStylePropertyHasBeenSet() {
    driver.get(pages.javascriptPage);

    WebElement shown = driver.findElement(By.id("visibleSubElement"));

    assertTrue(shown.isDisplayed());
  }

  @JavascriptEnabled
  public void testShouldModifyTheVisibilityOfAnElementDynamically() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("hideMe"));

    assertTrue(element.isDisplayed());

    element.click();

    waitFor(elementNotToDisplayed(element));

    assertFalse(element.isDisplayed());
  }

  @JavascriptEnabled
  public void testHiddenInputElementsAreNeverVisible() {
    driver.get(pages.javascriptPage);

    WebElement shown = driver.findElement(By.name("hidden"));

    assertFalse(shown.isDisplayed());
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  public void testShouldNotBeAbleToClickOnAnElementThatIsNotDisplayed() {
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("unclickable"));

    try {
      element.click();
      fail("You should not be able to click on an invisible element");
    } catch (ElementNotVisibleException e) {
      // This is expected
    }
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  public void testShouldNotBeAbleToTypeAnElementThatIsNotDisplayed() {
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("unclickable"));

    try {
      element.sendKeys("You don't see me");
      fail("You should not be able to send keyboard input to an invisible element");
    } catch (ElementNotVisibleException e) {
      // This is expected
    }

    assertThat(element.getAttribute("value"), is(not("You don't see me")));
  }

  @JavascriptEnabled
  @Ignore({IE, SELENESE})
  public void testZeroSizedDivIsShownIfDescendantHasSize() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("zero"));
    Dimension size = element.getSize();

    assertEquals("Should have 0 width", 0, size.width);
    assertEquals("Should have 0 height", 0, size.height);
    assertTrue(element.isDisplayed());
  }

  private Callable<Boolean> elementNotToDisplayed(final WebElement element) {
    return new Callable<Boolean>() {

      public Boolean call() throws Exception {
        return !element.isDisplayed();
      }
    };
  }
}
