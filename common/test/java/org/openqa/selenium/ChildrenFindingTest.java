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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.REMOTE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

import java.util.List;

public class ChildrenFindingTest extends AbstractDriverTestCase {
  @Ignore(SELENESE)
  public void testFindElementByXPath() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    WebElement child = element.findElement(By.xpath("select"));
    assertThat(child.getAttribute("id"), is("2"));
  }
  
  @Ignore({SELENESE, HTMLUNIT, IE, REMOTE})
  //Reason for ignores: Multiple items of ID 1 exist in the page,
  //returns subelements of *all* of them, not the one we selected
  //See issue 278
  public void testFindElementsByXPath() {
    driver.get(pages.nestedPage);
    WebElement select = driver.findElement(By.id("1"));
    List<WebElement> elements = select.findElements(By.xpath("//option"));
    assertEquals(4, elements.size());
  }

  @Ignore(value = {SELENESE, HTMLUNIT, IE, REMOTE}, reason = "Issue 278")
  public void testFindsSubElementNotTopLevelElementWhenLookingUpSubElementByXPath() {
    driver.get(pages.simpleTestPage);
    WebElement parent = driver.findElement(By.id("containsSomeDiv"));
    WebElement child = parent.findElement(By.xpath("//div[@name='someDiv']"));
    assertFalse("Child should not contain text Top level", child.getText().contains("Top level"));
    assertTrue("Child should contain text Nested", child.getText().contains("Nested"));
  }

  @Ignore(SELENESE)
  public void testFindElementByXPathWhenNoMatch() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    try {
      element.findElement(By.xpath("select/x"));
    } catch (NoSuchElementException e) {
      return;
    }
    fail();
  }

  @Ignore(SELENESE)
  public void testfindElementsByXPath() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.xpath("select/option"));
    assertThat(children.size(), is(8));
    assertThat(children.get(0).getText(), is("One"));
    assertThat(children.get(1).getText(), is("Two"));
  }

  @Ignore(SELENESE)
  public void testfindElementsByXPathWhenNoMatch() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.xpath("select/x"));
    assertEquals(0, children.size());
  }

  @Ignore(SELENESE)
  public void testfindElementByName() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    WebElement child = element.findElement(By.name("selectomatic"));
    assertThat(child.getAttribute("id"), is("2"));
  }

  @Ignore(SELENESE)
  public void testfindElementsByName() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.name("selectomatic"));
    assertThat(children.size(), is(2));
  }

  @Ignore(SELENESE)
  public void testfindElementById() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    WebElement child = element.findElement(By.id("2"));
    assertThat(child.getAttribute("name"), is("selectomatic"));
  }

  @Ignore(SELENESE)
  public void testfindElementByIdWhenMultipleMatchesExist() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.id("test_id_div"));
    WebElement child = element.findElement(By.id("test_id"));
    assertThat(child.getText(), is("inside"));
  }

  @Ignore(SELENESE)
  public void testfindElementByIdWhenNoMatchInContext() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.id("test_id_div"));
    try {
      element.findElement(By.id("test_id_out"));
      fail();
    } catch (NoSuchElementException e) {
      // This is expected
    }
  }

  @Ignore(SELENESE)
  public void testfindElementsById() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.id("2"));
    assertThat(children.size(), is(2));
  }

  @Ignore(SELENESE)
  public void testFindElementByLinkText() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("div1"));
    WebElement child = element.findElement(By.linkText("hello world"));
    assertThat(child.getAttribute("name"), is("link1"));
  }

  @Ignore(SELENESE)
  public void testFindElementsByLinkTest() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("div1"));
    List<WebElement> elements = element.findElements(By.linkText("hello world"));

    assertEquals(2, elements.size());
    assertThat(elements.get(0).getAttribute("name"), is("link1"));
    assertThat(elements.get(1).getAttribute("name"), is("link2"));
  }

  @Ignore(SELENESE)
  public void testfindElementsByLinkText() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("div1"));
    List<WebElement> children = element.findElements(
        By.linkText("hello world"));
    assertThat(children.size(), is(2));
  }

  @Ignore({IE, SELENESE})
  public void testShouldFindChildElementsByClassName() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("classes"));

    WebElement element = parent.findElement(By.className("one"));

    assertEquals("Find me", element.getText());
  }

  @Ignore({IE, SELENESE})
  public void testShouldFindChildrenByClassName() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("classes"));

    List<WebElement> elements = parent.findElements(By.className("one"));

    assertEquals(2, elements.size());
  }

  @Ignore(SELENESE)
  public void testShouldFindChildElementsByTagName() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("div1"));

    WebElement element = parent.findElement(By.tagName("a"));

    assertEquals("link1", element.getAttribute("name"));
  }

  @Ignore(SELENESE)
  public void testShouldFindChildrenByTagName() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("div1"));

    List<WebElement> elements = parent.findElements(By.tagName("a"));

    assertEquals(2, elements.size());
  }

  @JavascriptEnabled
  public void testShouldBeAbleToFindAnElementByCssSelector() {
    driver.get(pages.nestedPage);
    if (!supportsSelectorApi()) {
      System.out.println("Skipping test: selector API not supported");
      return;
    }
    WebElement parent = driver.findElement(By.name("form2"));

    WebElement element = parent.findElement(By.cssSelector("*[name=\"selectomatic\"]"));

    assertEquals("2", element.getAttribute("id"));
  }

  @JavascriptEnabled
  @Ignore(value = CHROME, reason = "Chrome doesn't handle the many-pages situation well")
  public void testShouldBeAbleToFindAnElementsByCssSelector() {
    driver.get(pages.nestedPage);
    if (!supportsSelectorApi()) {
      System.out.println("Skipping test: selector API not supported");
      return;
    }
    WebElement parent = driver.findElement(By.name("form2"));

    List<WebElement> elements = parent.findElements(By.cssSelector("*[name=\"selectomatic\"]"));

    assertEquals(2, elements.size());
  }
}
