/*
Copyright 2007-2012 Selenium committers
Portions copyright 2011-2012 Software Freedom Conservancy

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

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;
import static org.openqa.selenium.testing.TestUtilities.isFirefox30;
import static org.openqa.selenium.testing.TestUtilities.isNativeEventsEnabled;

@Ignore(value = {HTMLUNIT, IE, OPERA, SELENESE, OPERA_MOBILE},
        reason = "HtmlUnit: SVG interaction is only implemented in rendered browsers")
public class SvgElementTest extends JUnit4TestBase {

  @Before
  public void checkSupportsCssSelectors() {
    assumeTrue(driver instanceof FindsByCssSelector);
  }

  @Test
  public void testShouldClickOnGraphVisualElements() {
    driver.get(pages.svgPage);
    WebElement svg = driver.findElement(By.cssSelector("svg"));

    if (isFirefox30(driver) && isNativeEventsEnabled(driver)) {
      System.out.println("Not testing SVG elements with Firefox 3.0 and native events as" +
                         " this functionality is not working.");
      return;
    }

    List<WebElement> groupElements = svg.findElements(By.cssSelector("g"));
    assertEquals(5, groupElements.size());

    groupElements.get(1).click();
    WebElement resultElement = driver.findElement(By.id("result"));

    waitFor(elementTextToEqual(resultElement, "slice_red"));
    assertEquals("slice_red", resultElement.getText());

    groupElements.get(2).click();
    resultElement = driver.findElement(By.id("result"));

    waitFor(elementTextToEqual(resultElement, "slice_green"));
    assertEquals("slice_green", resultElement.getText());
  }

  private static WebElement findAppleElement(List<WebElement> textElements) {
    for (WebElement currentElement : textElements) {
      if (currentElement.getText().contains("Apple")) {
        return currentElement;
      }
    }

    return null;
  }

  @Test
  public void testShouldClickOnGraphTextElements() {
    driver.get(pages.svgPage);
    WebElement svg = driver.findElement(By.cssSelector("svg"));
    List<WebElement> textElements = svg.findElements(By.cssSelector("text"));

    if (isFirefox30(driver) && isNativeEventsEnabled(driver)) {
      System.out.println("Not testing SVG elements with Firefox 3.0 and native events as" +
                         " this functionality is not working.");
      return;
    }

    WebElement appleElement = findAppleElement(textElements);
    assertNotNull(appleElement);

    appleElement.click();
    WebElement resultElement = driver.findElement(By.id("result"));
    waitFor(elementTextToEqual(resultElement, "text_apple"));
    assertEquals("text_apple", resultElement.getText());
  }

}