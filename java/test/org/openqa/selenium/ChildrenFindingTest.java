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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;

class ChildrenFindingTest extends JupiterTestBase {

  @Test
  void testFindElementByXPath() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    WebElement child = element.findElement(By.xpath("select"));
    assertThat(child.getAttribute("id")).isEqualTo("2");
  }

  @Test
  void testFindingElementsOnElementByXPathShouldFindTopLevelElements() {
    driver.get(pages.simpleTestPage);
    WebElement parent = driver.findElement(By.id("multiline"));
    List<WebElement> allPs = driver.findElements(By.xpath("//p"));
    List<WebElement> children = parent.findElements(By.xpath("//p"));
    assertThat(allPs.size()).isEqualTo(children.size());
  }

  @Test
  void testFindingDotSlashElementsOnElementByXPathShouldFindNotTopLevelElements() {
    driver.get(pages.simpleTestPage);
    WebElement parent = driver.findElement(By.id("multiline"));
    List<WebElement> children = parent.findElements(By.xpath("./p"));
    assertThat(children).hasSize(1);
    assertThat(children.get(0).getText()).isEqualTo("A div containing");
  }

  @Test
  void testFindElementByXPathWhenNoMatch() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> element.findElement(By.xpath(".//select/x")));
  }

  @Test
  void testFindElementsByXPath() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.xpath("select/option"));
    assertThat(children).hasSize(8);
    assertThat(children.get(0).getText()).isEqualTo("One");
    assertThat(children.get(1).getText()).isEqualTo("Two");
  }

  @Test
  void testFindElementsByXPathWhenNoMatch() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.xpath(".//select/x"));
    assertThat(children).isEmpty();
  }

  @Test
  void testFindElementByName() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    WebElement child = element.findElement(By.name("selectomatic"));
    assertThat(child.getAttribute("id")).isEqualTo("2");
  }

  @Test
  void testFindElementsByName() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.name("selectomatic"));
    assertThat(children).hasSize(2);
  }

  @Test
  void testFindElementById() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    WebElement child = element.findElement(By.id("2"));
    assertThat(child.getAttribute("name")).isEqualTo("selectomatic");
  }

  @Test
  void testFindElementByIdWhenMultipleMatchesExist() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.id("test_id_div"));
    WebElement child = element.findElement(By.id("test_id"));
    assertThat(child.getText()).isEqualTo("inside");
  }

  @Test
  void testFindElementByIdWhenIdContainsNonAlphanumericCharacters() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.id("test_special_chars"));
    WebElement childWithSpaces = element.findElement(By.id("white space"));
    assertThat(childWithSpaces.getText()).isEqualTo("space");
    WebElement childWithCssChars = element.findElement(By.id("css#.chars"));
    assertThat(childWithCssChars.getText()).isEqualTo("css escapes");
  }

  @Test
  void testFindElementByIdWhenNoMatchInContext() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.id("test_id_div"));
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> element.findElement(By.id("test_id_out")));
  }

  @Test
  void testFindElementsById() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("form2"));
    List<WebElement> children = element.findElements(By.id("2"));
    assertThat(children).hasSize(2);
  }

  @Test
  void testFindElementsByIdWithNonAlphanumericCharacters() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.id("test_special_chars"));
    List<WebElement> children = element.findElements(By.id("white space"));
    assertThat(children).hasSize(1);
    List<WebElement> children2 = element.findElements(By.id("css#.chars"));
    assertThat(children2).hasSize(1);
  }

  @Test
  void testFindElementByLinkText() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("div1"));
    WebElement child = element.findElement(By.linkText("hello world"));
    List<WebElement> invalidChildren = element.findElements(By.linkText("HellO WorLD"));
    assertThat(invalidChildren).isEmpty();
    assertThat(child.getAttribute("name")).isEqualTo("link1");
  }

  @Test
  void testFindElementsByLinkTest() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("div1"));
    List<WebElement> elements = element.findElements(By.linkText("hello world"));

    assertThat(elements).hasSize(2);
    assertThat(elements.get(0).getAttribute("name")).isEqualTo("link1");
    assertThat(elements.get(1).getAttribute("name")).isEqualTo("link2");
  }

  @Test
  void testShouldFindChildElementsById() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.id("test_id_div"));
    WebElement element = parent.findElement(By.id("test_id"));
    assertThat(element.getText()).isEqualTo("inside");
  }

  @Test
  void testShouldNotReturnRootElementWhenFindingChildrenById() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.id("test_id"));

    assertThat(parent.findElements(By.id("test_id"))).isEmpty();
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> parent.findElement(By.id("test_id")));
  }

  @Test
  void testShouldFindChildElementsByClassName() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("classes"));

    WebElement element = parent.findElement(By.className("one"));

    assertThat(element.getText()).isEqualTo("Find me");
  }

  @Test
  void testShouldFindChildrenByClassName() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("classes"));

    List<WebElement> elements = parent.findElements(By.className("one"));

    assertThat(elements).hasSize(2);
  }

  @Test
  void testShouldFindChildElementsByTagName() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("div1"));

    WebElement element = parent.findElement(By.tagName("a"));

    assertThat(element.getAttribute("name")).isEqualTo("link1");
  }

  @Test
  void testShouldFindChildrenByTagName() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("div1"));

    List<WebElement> elements = parent.findElements(By.tagName("a"));

    assertThat(elements).hasSize(2);
  }

  @Test
  void testShouldBeAbleToFindAnElementByCssSelector() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("form2"));

    WebElement element = parent.findElement(By.cssSelector("*[name=\"selectomatic\"]"));

    assertThat(element.getAttribute("id")).isEqualTo("2");
  }

  @Test
  void testShouldBeAbleToFindAnElementByCss3Selector() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("form2"));

    WebElement element = parent.findElement(By.cssSelector("*[name^=\"selecto\"]"));

    assertThat(element.getAttribute("id")).isEqualTo("2");
  }

  @Test
  void testShouldBeAbleToFindElementsByCssSelector() {
    driver.get(pages.nestedPage);
    WebElement parent = driver.findElement(By.name("form2"));

    List<WebElement> elements = parent.findElements(By.cssSelector("*[name=\"selectomatic\"]"));

    assertThat(elements).hasSize(2);
  }

  @Test
  void testShouldBeAbleToFindChildrenOfANode() {
    driver.get(pages.selectableItemsPage);
    List<WebElement> elements = driver.findElements(By.xpath("/html/head"));
    WebElement head = elements.get(0);
    List<WebElement> importedScripts = head.findElements(By.tagName("script"));
    assertThat(importedScripts).hasSize(3);
  }

  @Test
  void testReturnAnEmptyListWhenThereAreNoChildrenOfANode() {
    driver.get(pages.xhtmlTestPage);
    WebElement table = driver.findElement(By.id("table"));
    List<WebElement> rows = table.findElements(By.tagName("tr"));

    assertThat(rows).isEmpty();
  }

  @Test
  void testShouldFindGrandChildren() {
    driver.get(pages.formPage);
    WebElement form = driver.findElement(By.id("nested_form"));
    form.findElement(By.name("x"));
  }

  @Test
  void testShouldNotFindElementOutSideTree() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.name("login"));
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> element.findElement(By.name("x")));
  }

  @Test
  void testFindingByTagNameShouldNotIncludeParentElementIfSameTagType() {
    driver.get(pages.xhtmlTestPage);
    WebElement parent = driver.findElement(By.id("my_span"));

    assertThat(parent.findElements(By.tagName("div"))).hasSize(2);
    assertThat(parent.findElements(By.tagName("span"))).hasSize(2);
  }

  @Test
  void testFindingByCssShouldNotIncludeParentElementIfSameTagType() {
    driver.get(pages.xhtmlTestPage);
    WebElement parent = driver.findElement(By.cssSelector("div#parent"));
    WebElement child = parent.findElement(By.cssSelector("div"));

    assertThat(child.getAttribute("id")).isEqualTo("child");
  }

  @Test
  void testFindMultipleElements() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));

    List<WebElement> elements = elem.findElements(By.partialLinkText("link"));
    assertThat(elements).hasSize(6);
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testLinkWithLeadingSpaces() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));

    WebElement res = elem.findElement(By.partialLinkText("link with leading space"));
    assertThat(res.getText()).isEqualTo("link with leading space");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testLinkWithTrailingSpace() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));

    WebElement res = elem.findElement(By.partialLinkText("link with trailing space"));
    assertThat(res.getText()).isEqualTo("link with trailing space");
  }

  @Test
  void testElementCanGetLinkByLinkTestIgnoringTrailingWhitespace() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));

    WebElement link = elem.findElement(By.linkText("link with trailing space"));
    assertThat(link.getAttribute("id")).isEqualTo("linkWithTrailingSpace");
  }
}
