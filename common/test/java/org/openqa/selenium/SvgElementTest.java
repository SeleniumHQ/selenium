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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.REMOTE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

import java.util.List;

public class SvgElementTest extends AbstractDriverTestCase {

  @Ignore({HTMLUNIT, IE, CHROME, REMOTE, SELENESE})
  public void testShouldClickOnGraphVisualElements() {
    driver.get(pages.svgPage);
    WebElement svg = driver.findElement(By.tagName("svg:svg"));

    List<WebElement> groupElements = svg.findElements(By.tagName("svg:g"));
    assertEquals(5, groupElements.size());

    groupElements.get(1).click();
    WebElement resultElement = driver.findElement(By.id("result"));
    assertEquals("slice_red", resultElement.getText());

    groupElements.get(2).click();
    resultElement = driver.findElement(By.id("result"));
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

  @Ignore({HTMLUNIT, IE, CHROME, REMOTE, SELENESE})
  public void testShouldClickOnGraphTextElements() {
    driver.get(pages.svgPage);
    WebElement svg = driver.findElement(By.tagName("svg:svg"));
    List<WebElement> textElements = svg.findElements(By.tagName("svg:text"));

    WebElement appleElement = findAppleElement(textElements);
    assertNotNull(appleElement);

    appleElement.click();
    WebElement resultElement = driver.findElement(By.id("result"));
    assertEquals("text_apple", resultElement.getText());
  }
}
