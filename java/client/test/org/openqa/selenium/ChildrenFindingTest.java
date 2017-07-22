// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.instanceOf;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.TestUtilities.catchThrowable;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.util.List;
import org.openqa.selenium.testing.NotYetImplemented;

public class ChildrenFindingTest extends JUnit4TestBase {

  @Rule
  public final ExpectedException expectedException = ExpectedException.none();

  @Test
  public void testFindElementByXPath() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    WebElement child = element.findElement(By.xpath("select"));
    assertThat(child.getAttribute("id"), is("2"));
  }

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
    Throwable t = catchThrowable(() -> element.findElement(By.xpath(".//select/x")));
    assertThat(t, instanceOf(NoSuchElementException.class));
  }

  @Test
  public void testFindElementsByXPath() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.xpath("select/option"));
    assertThat(children.size(), is(8));
    assertThat(children.get(0).getText(), is("One"));
    assertThat(children.get(1).getText(), is("Two"));
  }

  @Test
  public void testFindElementsByXPathWhenNoMatch() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.xpath(".//select/x"));
    assertEquals(0, children.size());
  }

  @Test
  public void testFindElementByName() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    WebElement child = element.findElement(By.name("selectomatic"));
    assertThat(child.getAttribute("id"), is("2"));
  }

  @Test
  public void testFindElementsByName() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.name("selectomatic"));
    assertThat(children.size(), is(2));
  }

  @Test
  public void testFindElementById() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    WebElement child = element.findElement(By.id("2"));
    assertThat(child.getAttribute("name"), is("selectomatic"));
  }

  @Test
  public void testFindElementByIdWhenMultipleMatchesExist() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.id("test_id_div"));
    WebElement child = element.findElement(By.id("test_id"));
    assertThat(child.getText(), is("inside"));
  }

  @Test
  @Ignore(value = CHROME,
      reason = "Need to recompile drivers with atoms from 6c55320d3f0eb23de56270a55c74602fc8d63c8a")
  public void testFindElementByIdWhenIdContainsNonAlphanumericCharacters() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.id("test_special_chars"));
    WebElement childWithSpaces = element.findElement(By.id("white space"));
    assertThat(childWithSpaces.getText(), is("space"));
    WebElement childWithCssChars = element.findElement(By.id("css#.chars"));
    assertThat(childWithCssChars.getText(), is("css escapes"));
  }

  @Test
  public void testFindElementByIdWhenNoMatchInContext() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.id("test_id_div"));
    Throwable t = catchThrowable(() -> element.findElement(By.id("test_id_out")));
    assertThat(t, instanceOf(NoSuchElementException.class));
  }

  @Test
  public void testFindElementsById() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.id("2"));
    assertThat(children.size(), is(2));
  }

  @Test
  @Ignore(value = CHROME,
      reason = "Need to recompile drivers with atoms from 6c55320d3f0eb23de56270a55c74602fc8d63c8a")
  public void testFindElementsByIdWithNonAlphanumericCharacters() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.id("test_special_chars"));
    List<WebElement> children = element.findElements(By.id("white space"));
    assertThat(children.size(), is(1));
    List<WebElement> children2 = element.findElements(By.id("css#.chars"));
    assertThat(children2.size(), is(1));
  }

  @Test
  public void testFindElementByLinkText() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("div1"));
    WebElement child = element.findElement(By.linkText("hello world"));
    List<WebElement> invalidChildren = element.findElements(By.linkText("HellO WorLD"));
    assertEquals(0, invalidChildren.size());
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
  public void testShouldFindChildElementsById() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.id("test_id_div"));
    WebElement element = parent.findElement(By.id("test_id"));
    assertEquals("inside", element.getText());
  }

  @Test
  @NotYetImplemented(value = CHROME, reason = "Need to release atoms fix from #4351")
  @NotYetImplemented(value = IE, reason = "Need to release atoms fix from #4351")
  public void testShouldNotReturnRootElementWhenFindingChildrenById() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.id("test_id"));

    assertEquals(0, parent.findElements(By.id("test_id")).size());
    expectedException.expect(NoSuchElementException.class);
    parent.findElement(By.id("test_id"));
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

  @Test
  public void testShouldBeAbleToFindAnElementByCssSelector() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("form2"));

    WebElement element = parent.findElement(By.cssSelector("*[name=\"selectomatic\"]"));

    assertEquals("2", element.getAttribute("id"));
  }

  @Test
  public void testShouldBeAbleToFindAnElementByCss3Selector() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("form2"));

    WebElement element = parent.findElement(By.cssSelector("*[name^=\"selecto\"]"));

    assertEquals("2", element.getAttribute("id"));
  }

  @Test
  public void testShouldBeAbleToFindElementsByCssSelector() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("form2"));

    List<WebElement> elements = parent.findElements(By.cssSelector("*[name=\"selectomatic\"]"));

    assertEquals(2, elements.size());
  }

  @Test
  public void testShouldBeAbleToFindChildrenOfANode() {
    driver.get(pages.selectableItemsPage);
    List<WebElement> elements = driver.findElements(By.xpath("/html/head"));
    WebElement head = elements.get(0);
    List<WebElement> importedScripts = head.findElements(By.tagName("script"));
    assertThat(importedScripts.size(), equalTo(3));
  }

  @Test
  public void testReturnAnEmptyListWhenThereAreNoChildrenOfANode() {
    driver.get(pages.xhtmlTestPage);
    WebElement table = driver.findElement(By.id("table"));
    List<WebElement> rows = table.findElements(By.tagName("tr"));

    assertThat(rows.size(), equalTo(0));
  }

  @Test
  public void testShouldFindGrandChildren() {
    driver.get(pages.formPage);
    WebElement form = driver.findElement(By.id("nested_form"));
    form.findElement(By.name("x"));
  }

  @Test
  public void testShouldNotFindElementOutSideTree() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.name("login"));
    Throwable t = catchThrowable(() -> element.findElement(By.name("x")));
    assertThat(t, instanceOf(NoSuchElementException.class));
  }

  @Test
  public void testFindingByTagNameShouldNotIncludeParentElementIfSameTagType() {
    driver.get(pages.xhtmlTestPage);
    WebElement parent = driver.findElement(By.id("my_span"));

    assertEquals(2, parent.findElements(By.tagName("div")).size());
    assertEquals(2, parent.findElements(By.tagName("span")).size());
  }

  @Test
  public void testFindingByCssShouldNotIncludeParentElementIfSameTagType() {
    driver.get(pages.xhtmlTestPage);
    WebElement parent = driver.findElement(By.cssSelector("div#parent"));
    WebElement child = parent.findElement(By.cssSelector("div"));

    assertEquals("child", child.getAttribute("id"));
  }

  @Test
  public void testFindMultipleElements() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));

    List<WebElement> elements = elem.findElements(By.partialLinkText("link"));
    assertNotNull(elements);
    assertEquals(6, elements.size());
  }

  @Test
  public void testLinkWithLeadingSpaces() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));

    WebElement res = elem.findElement(By.partialLinkText("link with leading space"));
    assertEquals("link with leading space", res.getText());
  }

  @Test
  public void testLinkWithTrailingSpace() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));

    WebElement res = elem.findElement(By.partialLinkText("link with trailing space"));
    assertEquals("link with trailing space", res.getText());
  }

  @Test
  public void testElementCanGetLinkByLinkTestIgnoringTrailingWhitespace() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));

    WebElement link = elem.findElement(By.linkText("link with trailing space"));
    assertEquals("linkWithTrailingSpace", link.getAttribute("id"));
  }

}
