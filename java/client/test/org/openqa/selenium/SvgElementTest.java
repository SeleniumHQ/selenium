/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import java.util.List;

import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.OPERA;
import static org.openqa.selenium.Ignore.Driver.REMOTE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;
import static org.openqa.selenium.TestUtilities.isFirefox30;
import static org.openqa.selenium.TestUtilities.isNativeEventsEnabled;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;

@Ignore(
    value = {HTMLUNIT, IE, CHROME, REMOTE, SELENESE, OPERA},
    reason = "HtmlUnit: SVG interaction is only implemented in rendered browsers")
public class SvgElementTest extends AbstractDriverTestCase {

  public void testShouldClickOnGraphVisualElements() {
    driver.get(pages.svgPage);
    WebElement svg = driver.findElement(By.tagName("svg:svg"));

    if (isFirefox30(driver) && isNativeEventsEnabled(driver)) {
      System.out.println("Not testing SVG elements with Firefox 3.0 and native events as" +
          " this functionality is not working.");
      return;
    }

    List<WebElement> groupElements = svg.findElements(By.tagName("svg:g"));
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
    for (WebElement currentElement: textElements) {
      if (currentElement.getText().contains("Apple")) {
        return currentElement;
      }
    }

    return null;
  }

  public void testShouldClickOnGraphTextElements() {
    driver.get(pages.svgPage);
    WebElement svg = driver.findElement(By.tagName("svg:svg"));
    List<WebElement> textElements = svg.findElements(By.tagName("svg:text"));

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
