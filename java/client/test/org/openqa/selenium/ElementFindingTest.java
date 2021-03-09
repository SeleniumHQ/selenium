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
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.LEGACY_FIREFOX_XPI;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

import java.util.List;

public class ElementFindingTest extends JUnit4TestBase {

  // By.id positive

  @Test
  public void testShouldBeAbleToFindASingleElementById() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.id("linkId"));
    assertThat(element.getAttribute("id")).isEqualTo("linkId");
  }

  @Test
  public void testShouldBeAbleToFindASingleElementByNumericId() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.id("2"));
    assertThat(element.getAttribute("id")).isEqualTo("2");
  }

  @Test
  public void testShouldBeAbleToFindASingleElementByIdWithNonAlphanumericCharacters() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.id("white space"));
    assertThat(element.getText()).isEqualTo("space");
    WebElement element2 = driver.findElement(By.id("css#.chars"));
    assertThat(element2.getText()).isEqualTo("css escapes");
  }

  @Test
  public void testShouldBeAbleToFindMultipleElementsById() {
    driver.get(pages.nestedPage);
    List<WebElement> elements = driver.findElements(By.id("test_id"));
    assertThat(elements).hasSize(2);
  }

  @Test
  public void testShouldBeAbleToFindMultipleElementsByNumericId() {
    driver.get(pages.nestedPage);
    List<WebElement> elements = driver.findElements(By.id("2"));
    assertThat(elements).hasSize(8);
  }

  @Test
  public void testShouldBeAbleToFindMultipleElementsByIdWithNonAlphanumericCharacters() {
    driver.get(pages.nestedPage);
    List<WebElement> elements = driver.findElements(By.id("white space"));
    assertThat(elements).hasSize(2);
    List<WebElement> elements2 = driver.findElements(By.id("css#.chars"));
    assertThat(elements2).hasSize(2);
  }

  // By.id negative

  @Test
  public void testShouldNotBeAbleToLocateByIdASingleElementThatDoesNotExist() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.id("nonExistentButton")));
  }

  @Test
  public void testShouldNotBeAbleToLocateByIdMultipleElementsThatDoNotExist() {
    driver.get(pages.formPage);
    List<WebElement> elements = driver.findElements(By.id("nonExistentButton"));
    assertThat(elements.size()).isEqualTo(0);
  }

  @Test
  public void testFindingASingleElementByEmptyIdShouldThrow() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.id("")));
  }

  @Test
  @NotYetImplemented(LEGACY_FIREFOX_XPI)
  @NotYetImplemented(HTMLUNIT)
  public void testFindingMultipleElementsByEmptyIdShouldThrow() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElements(By.id("")));
  }

  @Test
  public void testFindingASingleElementByIdWithSpaceShouldThrow() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.id("nonexistent button")));
  }

  @Test
  public void testFindingMultipleElementsByIdWithSpaceShouldReturnEmptyList() {
    driver.get(pages.formPage);
    List<WebElement> elements = driver.findElements(By.id("nonexistent button"));
    assertThat(elements.size()).isEqualTo(0);
  }

  // By.name positive

  @Test
  public void testShouldBeAbleToFindASingleElementByName() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.name("checky"));
    assertThat(element.getAttribute("value")).isEqualTo("furrfu");
  }

  @Test
  public void testShouldBeAbleToFindMultipleElementsByName() {
    driver.get(pages.nestedPage);
    List<WebElement> elements = driver.findElements(By.name("checky"));
    assertThat(elements.size()).isGreaterThan(1);
  }

  @Test
  public void testShouldBeAbleToFindAnElementThatDoesNotSupportTheNameProperty() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("div1"));
    assertThat(element.getAttribute("name")).isEqualTo("div1");
  }

  // By.name negative

  @Test
  public void testShouldNotBeAbleToLocateByNameASingleElementThatDoesNotExist() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.name("nonExistentButton")));
  }

  @Test
  public void testShouldNotBeAbleToLocateByNameMultipleElementsThatDoNotExist() {
    driver.get(pages.formPage);
    List<WebElement> elements = driver.findElements(By.name("nonExistentButton"));
    assertThat(elements).hasSize(0);
  }

  @Test
  public void testFindingASingleElementByEmptyNameShouldThrow() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.name("")));
  }

  @Test
  public void testFindingMultipleElementsByEmptyNameShouldReturnEmptyList() {
    driver.get(pages.formPage);
    List<WebElement> elements = driver.findElements(By.name(""));
    assertThat(elements).hasSize(0);
  }

  @Test
  public void testFindingASingleElementByNameWithSpaceShouldThrow() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.name("nonexistent button")));
  }

  @Test
  public void testFindingMultipleElementsByNameWithSpaceShouldReturnEmptyList() {
    driver.get(pages.formPage);
    List<WebElement> elements = driver.findElements(By.name("nonexistent button"));
    assertThat(elements).hasSize(0);
  }

  // By.tagName positive

  @Test
  public void testShouldBeAbleToFindASingleElementByTagName() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.tagName("input"));
    assertThat(element.getTagName().toLowerCase()).isEqualTo("input");
  }

  @Test
  public void testShouldBeAbleToFindMultipleElementsByTagName() {
    driver.get(pages.formPage);
    List<WebElement> elements = driver.findElements(By.tagName("input"));
    assertThat(elements.size()).isGreaterThan(1);
  }

  // By.tagName negative

  @Test
  public void testShouldNotBeAbleToLocateByTagNameASingleElementThatDoesNotExist() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.tagName("nonExistentButton")));
  }

  @Test
  public void testShouldNotBeAbleToLocateByTagNameMultipleElementsThatDoNotExist() {
    driver.get(pages.formPage);
    List<WebElement> elements = driver.findElements(By.tagName("nonExistentButton"));
    assertThat(elements).hasSize(0);
  }

  @Test
  public void testFindingASingleElementByEmptyTagNameShouldThrow() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.tagName("")));
  }

  @Test
  public void testFindingMultipleElementsByEmptyTagNameShouldThrow() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElements(By.tagName("")));
  }

  @Test
  public void testFindingASingleElementByTagNameWithSpaceShouldThrow() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.tagName("nonexistent button")));
  }

  @Test
  public void testFindingMultipleElementsByTagNameWithSpaceShouldReturnEmptyList() {
    driver.get(pages.formPage);
    List<WebElement> elements = driver.findElements(By.tagName("nonexistent button"));
    assertThat(elements).hasSize(0);
  }

  // By.className positive

  @Test
  public void testShouldBeAbleToFindASingleElementByClass() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.className("extraDiv"));
    assertThat(element.getText()).startsWith("Another div starts here.");
  }

  @Test
  public void testShouldBeAbleToFindMultipleElementsByClassName() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.className("nameC"));
    assertThat(elements.size()).isGreaterThan(1);
  }

  @Test
  public void testShouldFindElementByClassWhenItIsTheFirstNameAmongMany() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.className("nameA"));
    assertThat(element.getText()).isEqualTo("An H2 title");
  }

  @Test
  public void testShouldFindElementByClassWhenItIsTheLastNameAmongMany() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.className("nameC"));
    assertThat(element.getText()).isEqualTo("An H2 title");
  }

  @Test
  public void testShouldFindElementByClassWhenItIsInTheMiddleAmongMany() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.className("nameBnoise"));
    assertThat(element.getText()).isEqualTo("An H2 title");
  }

  @Test
  public void testShouldFindElementByClassWhenItsNameIsSurroundedByWhitespace() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.className("spaceAround"));
    assertThat(element.getText()).isEqualTo("Spaced out");
  }

  @Test
  public void testShouldFindElementsByClassWhenItsNameIsSurroundedByWhitespace() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.className("spaceAround"));
    assertThat(elements).hasSize(1);
    assertThat(elements.get(0).getText()).isEqualTo("Spaced out");
  }

  // By.className negative

  @Test
  public void testShouldNotFindElementByClassWhenTheNameQueriedIsShorterThanCandidateName() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.className("nameB")));
  }

  @Test
  public void testFindingASingleElementByEmptyClassNameShouldThrow() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.className("")));
  }

  @Test
  public void testFindingMultipleElementsByEmptyClassNameShouldThrow() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElements(By.className("")));
  }

  @Test
  public void testFindingASingleElementByCompoundClassNameShouldThrow() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.className("a b")));
  }

  @Test
  public void testFindingMultipleElementsByCompoundClassNameShouldThrow() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElements(By.className("a b")));
  }

  @Test
  @NotYetImplemented(LEGACY_FIREFOX_XPI)
  @NotYetImplemented(HTMLUNIT)
  public void testShouldBeAbleToFindASingleElementByAWeirdLookingClassName() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.className("cls-!@#$%^&*"));
    assertThat(element.getAttribute("class")).isEqualTo("cls-!@#$%^&*");
  }

  @Test
  @NotYetImplemented(LEGACY_FIREFOX_XPI)
  @NotYetImplemented(HTMLUNIT)
  public void testShouldBeAbleToFindMultipleElementsByAWeirdLookingClassName() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.className("cls-!@#$%^&*"));
    assertThat(elements).hasSize(1);
    assertThat(elements.get(0).getAttribute("class")).isEqualTo("cls-!@#$%^&*");
  }

  // By.xpath positive

  @Test
  public void testShouldBeAbleToFindASingleElementByXPath() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.xpath("//h1"));
    assertThat(element.getText()).isEqualTo("XHTML Might Be The Future");
  }

  @Test
  public void testShouldBeAbleToFindMultipleElementsByXPath() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.xpath("//div"));
    assertThat(elements).hasSize(13);
  }

  @Test
  public void testShouldBeAbleToFindManyElementsRepeatedlyByXPath() {
    driver.get(pages.xhtmlTestPage);
    String xpathString = "//node()[contains(@id,'id')]";
    assertThat(driver.findElements(By.xpath(xpathString))).hasSize(3);

    xpathString = "//node()[contains(@id,'nope')]";
    assertThat(driver.findElements(By.xpath(xpathString))).hasSize(0);
  }

  @Test
  public void testShouldBeAbleToIdentifyElementsByClass() {
    driver.get(pages.xhtmlTestPage);
    WebElement header = driver.findElement(By.xpath("//h1[@class='header']"));
    assertThat(header.getText()).isEqualTo("XHTML Might Be The Future");
  }

  @Test
  public void testShouldBeAbleToFindAnElementByXPathWithMultipleAttributes() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(
        By.xpath("//form[@name='optional']/input[@type='submit' and @value='Click!']"));
    assertThat(element.getTagName()).isEqualToIgnoringCase("input");
    assertThat(element.getAttribute("value")).isEqualTo("Click!");
  }

  @Test
  public void testFindingALinkByXpathShouldLocateAnElementWithTheGivenText() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.xpath("//a[text()='click me']"));
    assertThat(element.getText()).isEqualTo("click me");
  }

  @Test
  public void testFindingALinkByXpathUsingContainsKeywordShouldWork() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.xpath("//a[contains(.,'hello world')]"));
    assertThat(element.getText()).contains("hello world");
  }

  @Test
  @Ignore(IE)
  @NotYetImplemented(FIREFOX)
  @NotYetImplemented(SAFARI)
  public void testShouldBeAbleToFindElementByXPathWithNamespace() {
    driver.get(pages.svgPage);
    WebElement element = driver.findElement(By.xpath("//svg:svg//svg:text"));
    assertThat(element.getText()).isEqualTo("Test Chart");
  }

  @Test
  @Ignore(IE)
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(CHROME)
  @NotYetImplemented(EDGE)
  public void testShouldBeAbleToFindElementByXPathInXmlDocument() {
    driver.get(pages.simpleXmlDocument);
    WebElement element = driver.findElement(By.xpath("//foo"));
    assertThat(element.getText()).isEqualTo("baz");
  }

  // By.xpath negative

  @Test
  public void testShouldThrowAnExceptionWhenThereIsNoLinkToClick() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.xpath("//a[@id='Not here']")));
  }

  @Test
  public void testShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInDriverFindElement() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElement(By.xpath("this][isnot][valid")));
  }

  @Test
  public void testShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInDriverFindElements() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElements(By.xpath("this][isnot][valid")));
  }

  @Test
  public void testShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInElementFindElement() {
    driver.get(pages.formPage);
    WebElement body = driver.findElement(By.tagName("body"));
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> body.findElement(By.xpath("this][isnot][valid")));
  }

  @Test
  public void testShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInElementFindElements() {
    driver.get(pages.formPage);
    WebElement body = driver.findElement(By.tagName("body"));
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> body.findElements(By.xpath("this][isnot][valid")));
  }

  @Test
  public void testShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInDriverFindElement() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElement(By.xpath("count(//input)")));
  }

  @Test
  public void testShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInDriverFindElements() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElements(By.xpath("count(//input)")));
  }

  @Test
  public void testShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInElementFindElement() {
    driver.get(pages.formPage);

    WebElement body = driver.findElement(By.tagName("body"));
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> body.findElement(By.xpath("count(//input)")));
  }

  @Test
  public void testShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInElementFindElements() {
    driver.get(pages.formPage);
    WebElement body = driver.findElement(By.tagName("body"));
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> body.findElements(By.xpath("count(//input)")));
  }

  // By.cssSelector positive

  @Test
  public void testShouldBeAbleToFindASingleElementByCssSelector() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.cssSelector("div.content"));
    assertThat(element.getTagName()).isEqualToIgnoringCase("div");
    assertThat(element.getAttribute("class")).isEqualTo("content");
  }

  @Test
  public void testShouldBeAbleToFindMultipleElementsByCssSelector() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.cssSelector("p"));
    assertThat(elements.size()).isGreaterThan(1);
  }

  @Test
  public void testShouldBeAbleToFindASingleElementByCompoundCssSelector() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.cssSelector("div.extraDiv, div.content"));
    assertThat(element.getTagName()).isEqualToIgnoringCase("div");
    assertThat(element.getAttribute("class")).isEqualTo("content");
  }

  @Test
  public void testShouldBeAbleToFindMultipleElementsByCompoundCssSelector() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.cssSelector("div.extraDiv, div.content"));
    assertThat(elements.size()).isGreaterThan(1);
    assertThat(elements.get(0).getAttribute("class")).isEqualTo("content");
    assertThat(elements.get(1).getAttribute("class")).isEqualTo("extraDiv");
  }

  @Test
  public void testShouldBeAbleToFindAnElementByBooleanAttributeUsingCssSelector() {
    driver.get(appServer.whereIs("locators_tests/boolean_attribute_selected.html"));
    WebElement element = driver.findElement(By.cssSelector("option[selected='selected']"));
    assertThat(element.getAttribute("value")).isEqualTo("two");
  }

  @Test
  public void testShouldBeAbleToFindAnElementByBooleanAttributeUsingShortCssSelector() {
    driver.get(appServer.whereIs("locators_tests/boolean_attribute_selected.html"));
    WebElement element = driver.findElement(By.cssSelector("option[selected]"));
    assertThat(element.getAttribute("value")).isEqualTo("two");
  }

  @Test
  public void testShouldBeAbleToFindAnElementByBooleanAttributeUsingShortCssSelectorOnHtml4Page() {
    driver.get(appServer.whereIs("locators_tests/boolean_attribute_selected_html4.html"));
    WebElement element = driver.findElement(By.cssSelector("option[selected]"));
    assertThat(element.getAttribute("value")).isEqualTo("two");
  }

  // By.cssSelector negative

  @Test
  public void testShouldNotFindElementByCssSelectorWhenThereIsNoSuchElement() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.cssSelector(".there-is-no-such-class")));
  }

  @Test
  public void testShouldNotFindElementsByCssSelectorWhenThereIsNoSuchElement() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.cssSelector(".there-is-no-such-class"));
    assertThat(elements).hasSize(0);
  }

  @Test
  public void testFindingASingleElementByEmptyCssSelectorShouldThrow() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.cssSelector("")));
  }

  @Test
  public void testFindingMultipleElementsByEmptyCssSelectorShouldThrow() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElements(By.cssSelector("")));
  }

  @Test
  public void testFindingASingleElementByInvalidCssSelectorShouldThrow() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.cssSelector("//a/b/c[@id='1']")));
  }

  @Test
  public void testFindingMultipleElementsByInvalidCssSelectorShouldThrow() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElements(By.cssSelector("//a/b/c[@id='1']")));
  }

  // By.linkText positive

  @Test
  public void testShouldBeAbleToFindALinkByText() {
    driver.get(pages.xhtmlTestPage);
    WebElement link = driver.findElement(By.linkText("click me"));
    assertThat(link.getText()).isEqualTo("click me");
  }

  @Test
  public void testShouldBeAbleToFindMultipleLinksByText() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.linkText("click me"));
    assertThat(elements).hasSize(2);
  }

  @Test
  public void testShouldFindElementByLinkTextContainingEqualsSign() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.linkText("Link=equalssign"));
    assertThat(element.getAttribute("id")).isEqualTo("linkWithEqualsSign");
  }

  @Test
  public void testShouldFindMultipleElementsByLinkTextContainingEqualsSign() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.linkText("Link=equalssign"));
    assertThat(elements).hasSize(1);
    assertThat(elements.get(0).getAttribute("id")).isEqualTo("linkWithEqualsSign");
  }

  @Test
  public void findsByLinkTextOnXhtmlPage() {
    driver.get(appServer.whereIs("actualXhtmlPage.xhtml"));
    String linkText = "Foo";
    WebElement element = driver.findElement(By.linkText(linkText));
    assertThat(element.getText()).isEqualTo(linkText);
  }

  @Test
  public void testLinkWithFormattingTags() {
    driver.get(pages.simpleTestPage);
    WebElement elem = driver.findElement(By.id("links"));

    WebElement res = elem.findElement(By.partialLinkText("link with formatting tags"));
    assertThat(res.getText()).isEqualTo("link with formatting tags");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testDriverCanGetLinkByLinkTestIgnoringTrailingWhitespace() {
    driver.get(pages.simpleTestPage);
    WebElement link = driver.findElement(By.linkText("link with trailing space"));
    assertThat(link.getAttribute("id")).isEqualTo("linkWithTrailingSpace");
    assertThat(link.getText()).isEqualTo("link with trailing space");
  }

  // By.linkText negative

  @Test
  public void testShouldNotBeAbleToLocateByLinkTextASingleElementThatDoesNotExist() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.linkText("Not here either")));
  }

  @Test
  public void testShouldNotBeAbleToLocateByLinkTextMultipleElementsThatDoNotExist() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.linkText("Not here either"));
    assertThat(elements.size()).isEqualTo(0);
  }

  // By.partialLinkText positive

  @Test
  public void testShouldBeAbleToFindMultipleElementsByPartialLinkText() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.partialLinkText("ick me"));
    assertThat(elements.size()).isEqualTo(2);
  }

  @Test
  public void testShouldBeAbleToFindASingleElementByPartialLinkText() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.partialLinkText("anon"));
    assertThat(element.getText()).contains("anon");
  }

  @Test
  public void testShouldFindElementByPartialLinkTextContainingEqualsSign() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.partialLinkText("Link="));
    assertThat(element.getAttribute("id")).isEqualTo("linkWithEqualsSign");
  }

  @Test
  public void testShouldFindMultipleElementsByPartialLinkTextContainingEqualsSign() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.partialLinkText("Link="));
    assertThat(elements).hasSize(1);
    assertThat(elements.get(0).getAttribute("id")).isEqualTo("linkWithEqualsSign");
  }

  // Misc tests

  @Test
  public void testDriverShouldBeAbleToFindElementsAfterLoadingMoreThanOnePageAtATime() {
    driver.get(pages.formPage);
    driver.get(pages.xhtmlTestPage);
    WebElement link = driver.findElement(By.linkText("click me"));
    assertThat(link.getText()).isEqualTo("click me");
  }

  // You don't want to ask why this is here
  @Test
  public void testWhenFindingByNameShouldNotReturnById() {
    driver.get(pages.formPage);

    WebElement element = driver.findElement(By.name("id-name1"));
    assertThat(element.getAttribute("value")).isEqualTo("name");

    element = driver.findElement(By.id("id-name1"));
    assertThat(element.getAttribute("value")).isEqualTo("id");

    element = driver.findElement(By.name("id-name2"));
    assertThat(element.getAttribute("value")).isEqualTo("name");

    element = driver.findElement(By.id("id-name2"));
    assertThat(element.getAttribute("value")).isEqualTo("id");
  }

  @Test
  public void testShouldBeAbleToFindAHiddenElementsByName() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.name("hidden"));
    assertThat(element.getAttribute("name")).isEqualTo("hidden");
  }

  @Test
  public void testShouldNotBeAbleToFindAnElementOnABlankPage() {
    driver.get("about:blank");
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.tagName("a")));
  }

  @NeedsFreshDriver
  @Test
  @Ignore(SAFARI)
  public void testShouldNotBeAbleToLocateASingleElementOnABlankPage() {
    // Note we're on the default start page for the browser at this point.
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.id("nonExistantButton")));
  }

  @SwitchToTopAfterTest
  @Test
  @Ignore(FIREFOX)
  public void testAnElementFoundInADifferentFrameIsStale() {
    driver.get(pages.missedJsReferencePage);
    driver.switchTo().frame("inner");
    WebElement element = driver.findElement(By.id("oneline"));
    driver.switchTo().defaultContent();
    assertThatExceptionOfType(StaleElementReferenceException.class)
        .isThrownBy(element::getText);
  }

  @SwitchToTopAfterTest
  @Test
  @Ignore(CHROME)
  @Ignore(EDGE)
  @Ignore(IE)
  @Ignore(SAFARI)
  public void testAnElementInAFrameCannotBeAccessedFromAnotherFrame() {
    driver.get(pages.missedJsReferencePage);
    driver.switchTo().frame("inner");
    WebElement element = driver.findElement(By.id("oneline"));
    driver.switchTo().defaultContent();
    assertThatExceptionOfType(NoSuchElementException.class)
      .isThrownBy(element::getText);
  }

  @SwitchToTopAfterTest
  @Test
  @NotYetImplemented(SAFARI)
  public void testAnElementFoundInADifferentFrameViaJsCanBeUsed() {
    driver.get(pages.missedJsReferencePage);

    driver.switchTo().frame("inner");
    WebElement first = driver.findElement(By.id("oneline"));

    driver.switchTo().defaultContent();
    WebElement element = (WebElement) ((JavascriptExecutor) driver).executeScript(
        "return frames[0].document.getElementById('oneline');");


    driver.switchTo().frame("inner");

    WebElement second = driver.findElement(By.id("oneline"));

    assertThat(element).isEqualTo(first);
    assertThat(element).isEqualTo(second);
  }

}
