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
import org.openqa.selenium.testing.JavascriptEnabled;

import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;


public class ChildrenFindingTest extends JUnit4TestBase {
  @Test
  public void testFindElementByXPath() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    WebElement child = element.findElement(By.xpath("select"));
    assertThat(child.getAttribute("id"), is("2"));
  }

  @Ignore(value = SELENESE, reason = "Apparently Selenium is filtering results")
  @Test
  public void testFindingElementsOnElementByXPathShouldFindTopLevelElements() {
    driver.get(pages.simpleTestPage);
    WebElement parent = driver.findElement(By.id("multiline"));
    List<WebElement> allPs = driver.findElements(By.xpath("//p"));
    List<WebElement> children = parent.findElements(By.xpath("//p"));
    assertEquals(allPs.size(), children.size());
  }

  @Test
  public void testFindingDotSlashElementsOnElementByXPathShouldFindNotTopLevelElements() {
    driver.get(pages.simpleTestPage);
    WebElement parent = driver.findElement(By.id("multiline"));
    List<WebElement> children = parent.findElements(By.xpath("./p"));
    assertEquals(1, children.size());
    assertEquals("A div containing", children.get(0).getText());
  }

  @Test
  public void testFindElementByXPathWhenNoMatch() {
    driver.get(pages.nestedPage);

    WebElement element = driver.findElement(By.name("form2"));
    try {
      element.findElement(By.xpath(".//select/x"));
      fail("Did not expect to find element");
    } catch (NoSuchElementException ignored) {
      // this is expected
    }
  }

  @Test
  public void testfindElementsByXPath() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.xpath("select/option"));
    assertThat(children.size(), is(8));
    assertThat(children.get(0).getText(), is("One"));
    assertThat(children.get(1).getText(), is("Two"));
  }

  @Test
  public void testfindElementsByXPathWhenNoMatch() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.xpath(".//select/x"));
    assertEquals(0, children.size());
  }

  @Test
  public void testfindElementByName() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    WebElement child = element.findElement(By.name("selectomatic"));
    assertThat(child.getAttribute("id"), is("2"));
  }

  @Test
  public void testfindElementsByName() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.name("selectomatic"));
    assertThat(children.size(), is(2));
  }

  @Test
  public void testfindElementById() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    WebElement child = element.findElement(By.id("2"));
    assertThat(child.getAttribute("name"), is("selectomatic"));
  }

  @Test
  public void testfindElementByIdWhenMultipleMatchesExist() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.id("test_id_div"));
    WebElement child = element.findElement(By.id("test_id"));
    assertThat(child.getText(), is("inside"));
  }

  @Test
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

  @Test
  public void testfindElementsById() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.id("2"));
    assertThat(children.size(), is(2));
  }

  @Test
  public void testFindElementByLinkText() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("div1"));
    WebElement child = element.findElement(By.linkText("hello world"));
    assertThat(child.getAttribute("name"), is("link1"));
  }

  @Test
  public void testFindElementsByLinkTest() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("div1"));
    List<WebElement> elements = element.findElements(By.linkText("hello world"));

    assertEquals(2, elements.size());
    assertThat(elements.get(0).getAttribute("name"), is("link1"));
    assertThat(elements.get(1).getAttribute("name"), is("link2"));
  }

  @Test
  public void testfindElementsByLinkText() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("div1"));
    List<WebElement> children = element.findElements(
        By.linkText("hello world"));
    assertThat(children.size(), is(2));
  }

  @Test
  public void testShouldFindChildElementsByClassName() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("classes"));

    WebElement element = parent.findElement(By.className("one"));

    assertEquals("Find me", element.getText());
  }

  @Test
  public void testShouldFindChildrenByClassName() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("classes"));

    List<WebElement> elements = parent.findElements(By.className("one"));

    assertEquals(2, elements.size());
  }

  @Test
  public void testShouldFindChildElementsByTagName() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("div1"));

    WebElement element = parent.findElement(By.tagName("a"));

    assertEquals("link1", element.getAttribute("name"));
  }

  @Test
  public void testShouldFindChildrenByTagName() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("div1"));

    List<WebElement> elements = parent.findElements(By.tagName("a"));

    assertEquals(2, elements.size());
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToFindAnElementByCssSelector() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("form2"));

    WebElement element = parent.findElement(By.cssSelector("*[name=\"selectomatic\"]"));

    assertEquals("2", element.getAttribute("id"));
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToFindAnElementsByCssSelector() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("form2"));

    List<WebElement> elements = parent.findElements(By.cssSelector("*[name=\"selectomatic\"]"));

    assertEquals(2, elements.size());
  }
}
