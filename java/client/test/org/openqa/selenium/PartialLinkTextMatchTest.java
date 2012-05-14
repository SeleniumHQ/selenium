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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;
import static org.openqa.selenium.testing.Ignore.Driver.REMOTE;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

import java.util.List;

public class PartialLinkTextMatchTest extends JUnit4TestBase {

  @Ignore({REMOTE, SELENESE})
  @Test
  public void testLinkWithFormattingTags() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));

    WebElement res =
        elem.findElement(By.partialLinkText("link with formatting tags"));
    assertNotNull(res);
    assertEquals("link with formatting tags", res.getText());
  }

  @Ignore({REMOTE})
  @Test
  public void testLinkWithLeadingSpaces() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));

    WebElement res = elem.findElement(By.partialLinkText("link with leading space"));
    assertNotNull(res);
    assertEquals("link with leading space", res.getText());
  }

  @Ignore({REMOTE})
  @Test
  public void testLinkWithTrailingSpace() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));

    WebElement res =
        elem.findElement(By.partialLinkText("link with trailing space"));
    assertNotNull(res);
    assertEquals("link with trailing space", res.getText());
  }

  @Ignore({REMOTE})
  @Test
  public void testFindMultipleElements() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));

    List<WebElement> elements =
        elem.findElements(By.partialLinkText("link"));
    assertNotNull(elements);
    assertEquals(6, elements.size());
  }

  @Test
  public void testDriverCanGetLinkByLinkTestIgnoringTrailingWhitespace() {
    driver.get(pages.simpleTestPage);
    WebElement link = null;
    try {
      link = driver.findElement(By.linkText("link with trailing space"));
    } catch (NoSuchElementException e) {
      fail("Should have found link");
    }
    assertEquals("linkWithTrailingSpace", link.getAttribute("id"));
  }

  @Test
  public void testElementCanGetLinkByLinkTestIgnoringTrailingWhitespace() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));

    WebElement link = null;
    try {
      link = elem.findElement(By.linkText("link with trailing space"));
    } catch (NoSuchElementException e) {
      fail("Should have found link");
    }
    assertEquals("linkWithTrailingSpace", link.getAttribute("id"));
  }
}
