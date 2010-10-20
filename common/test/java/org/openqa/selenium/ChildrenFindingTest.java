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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.REMOTE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

@Ignore(SELENESE)
public class ChildrenFindingTest extends AbstractDriverTestCase {
  public void testFindElementByXPath() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    WebElement child = element.findElement(By.xpath("select"));
    assertThat(child.getAttribute("id"), is("2"));
  }
  
  public void testFindingElementsOnElementByXPathShouldFindTopLevelElements() {
    driver.get(pages.simpleTestPage);
    WebElement parent = driver.findElement(By.id("multiline"));
    List<WebElement> allPs = driver.findElements(By.xpath("//p"));
    List<WebElement> children = parent.findElements(By.xpath("//p"));
    assertEquals(allPs.size(), children.size());
  }

  public void testFindingDotSlashElementsOnElementByXPathShouldFindNotTopLevelElements() {
    driver.get(pages.simpleTestPage);
    WebElement parent = driver.findElement(By.id("multiline"));
    List<WebElement> children = parent.findElements(By.xpath("./p"));
    assertEquals(1, children.size());
    assertEquals("A div containing", children.get(0).getText());
  }

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

  public void testfindElementsByXPath() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.xpath("select/option"));
    assertThat(children.size(), is(8));
    assertThat(children.get(0).getText(), is("One"));
    assertThat(children.get(1).getText(), is("Two"));
  }

  public void testfindElementsByXPathWhenNoMatch() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.xpath("select/x"));
    assertEquals(0, children.size());
  }

  public void testfindElementByName() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    WebElement child = element.findElement(By.name("selectomatic"));
    assertThat(child.getAttribute("id"), is("2"));
  }

  public void testfindElementsByName() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.name("selectomatic"));
    assertThat(children.size(), is(2));
  }

  public void testfindElementById() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    WebElement child = element.findElement(By.id("2"));
    assertThat(child.getAttribute("name"), is("selectomatic"));
  }

  public void testfindElementByIdWhenMultipleMatchesExist() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.id("test_id_div"));
    WebElement child = element.findElement(By.id("test_id"));
    assertThat(child.getText(), is("inside"));
  }

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

  public void testfindElementsById() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.id("2"));
    assertThat(children.size(), is(2));
  }

  public void testFindElementByLinkText() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("div1"));
    WebElement child = element.findElement(By.linkText("hello world"));
    assertThat(child.getAttribute("name"), is("link1"));
  }

  public void testFindElementsByLinkTest() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("div1"));
    List<WebElement> elements = element.findElements(By.linkText("hello world"));

    assertEquals(2, elements.size());
    assertThat(elements.get(0).getAttribute("name"), is("link1"));
    assertThat(elements.get(1).getAttribute("name"), is("link2"));
  }

  public void testfindElementsByLinkText() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("div1"));
    List<WebElement> children = element.findElements(
        By.linkText("hello world"));
    assertThat(children.size(), is(2));
  }

  @Ignore(IE)
  public void testShouldFindChildElementsByClassName() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("classes"));

    WebElement element = parent.findElement(By.className("one"));

    assertEquals("Find me", element.getText());
  }

  @Ignore(IE)
  public void testShouldFindChildrenByClassName() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("classes"));

    List<WebElement> elements = parent.findElements(By.className("one"));

    assertEquals(2, elements.size());
  }

  public void testShouldFindChildElementsByTagName() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("div1"));

    WebElement element = parent.findElement(By.tagName("a"));

    assertEquals("link1", element.getAttribute("name"));
  }

  public void testShouldFindChildrenByTagName() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("div1"));

    List<WebElement> elements = parent.findElements(By.tagName("a"));

    assertEquals(2, elements.size());
  }

  @JavascriptEnabled
  @Ignore(REMOTE)
  public void testShouldBeAbleToFindAnElementByCssSelector() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("form2"));

    WebElement element = parent.findElement(By.cssSelector("*[name=\"selectomatic\"]"));

    assertEquals("2", element.getAttribute("id"));
  }

  @JavascriptEnabled
  @Ignore(value = {CHROME, REMOTE}, reason = "Chrome doesn't handle the many-pages situation well")
  public void testShouldBeAbleToFindAnElementsByCssSelector() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("form2"));

    List<WebElement> elements = parent.findElements(By.cssSelector("*[name=\"selectomatic\"]"));

    assertEquals(2, elements.size());
  }
}
