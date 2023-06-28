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
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

class ElementFindingTest extends JupiterTestBase {

  // By.id positive

  @Test
  void testShouldBeAbleToFindASingleElementById() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.id("linkId"));
    assertThat(element.getAttribute("id")).isEqualTo("linkId");
  }

  @Test
  void testShouldBeAbleToFindASingleElementByNumericId() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.id("2"));
    assertThat(element.getAttribute("id")).isEqualTo("2");
  }

  @Test
  void testShouldBeAbleToFindASingleElementByIdWithNonAlphanumericCharacters() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.id("white space"));
    assertThat(element.getText()).isEqualTo("space");
    WebElement element2 = driver.findElement(By.id("css#.chars"));
    assertThat(element2.getText()).isEqualTo("css escapes");
  }

  @Test
  void testShouldBeAbleToFindMultipleElementsById() {
    driver.get(pages.nestedPage);
    List<WebElement> elements = driver.findElements(By.id("test_id"));
    assertThat(elements).hasSize(2);
  }

  @Test
  void testShouldBeAbleToFindMultipleElementsByNumericId() {
    driver.get(pages.nestedPage);
    List<WebElement> elements = driver.findElements(By.id("2"));
    assertThat(elements).hasSize(8);
  }

  @Test
  void testShouldBeAbleToFindMultipleElementsByIdWithNonAlphanumericCharacters() {
    driver.get(pages.nestedPage);
    List<WebElement> elements = driver.findElements(By.id("white space"));
    assertThat(elements).hasSize(2);
    List<WebElement> elements2 = driver.findElements(By.id("css#.chars"));
    assertThat(elements2).hasSize(2);
  }

  // By.id negative

  @Test
  void testShouldNotBeAbleToLocateByIdASingleElementThatDoesNotExist() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.id("nonExistentButton")));
  }

  @Test
  void testShouldNotBeAbleToLocateByIdMultipleElementsThatDoNotExist() {
    driver.get(pages.formPage);
    List<WebElement> elements = driver.findElements(By.id("nonExistentButton"));
    assertThat(elements.size()).isZero();
  }

  @Test
  void testFindingASingleElementByEmptyIdShouldThrow() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElement(By.id("")));
  }

  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testFindingMultipleElementsByEmptyIdShouldThrow() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElements(By.id("")));
  }

  @Test
  void testFindingASingleElementByIdWithSpaceShouldThrow() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.id("nonexistent button")));
  }

  @Test
  void testFindingMultipleElementsByIdWithSpaceShouldReturnEmptyList() {
    driver.get(pages.formPage);
    List<WebElement> elements = driver.findElements(By.id("nonexistent button"));
    assertThat(elements.size()).isZero();
  }

  // By.name positive

  @Test
  void testShouldBeAbleToFindASingleElementByName() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.name("checky"));
    assertThat(element.getAttribute("value")).isEqualTo("furrfu");
  }

  @Test
  void testShouldBeAbleToFindMultipleElementsByName() {
    driver.get(pages.nestedPage);
    List<WebElement> elements = driver.findElements(By.name("checky"));
    assertThat(elements.size()).isGreaterThan(1);
  }

  @Test
  void testShouldBeAbleToFindAnElementThatDoesNotSupportTheNameProperty() {
    driver.get(pages.nestedPage);
    WebElement element = driver.findElement(By.name("div1"));
    assertThat(element.getAttribute("name")).isEqualTo("div1");
  }

  // By.name negative

  @Test
  void testShouldNotBeAbleToLocateByNameASingleElementThatDoesNotExist() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.name("nonExistentButton")));
  }

  @Test
  void testShouldNotBeAbleToLocateByNameMultipleElementsThatDoNotExist() {
    driver.get(pages.formPage);
    List<WebElement> elements = driver.findElements(By.name("nonExistentButton"));
    assertThat(elements).isEmpty();
  }

  @Test
  void testFindingASingleElementByEmptyNameShouldThrow() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.name("")));
  }

  @Test
  void testFindingMultipleElementsByEmptyNameShouldReturnEmptyList() {
    driver.get(pages.formPage);
    List<WebElement> elements = driver.findElements(By.name(""));
    assertThat(elements).isEmpty();
  }

  @Test
  void testFindingASingleElementByNameWithSpaceShouldThrow() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.name("nonexistent button")));
  }

  @Test
  void testFindingMultipleElementsByNameWithSpaceShouldReturnEmptyList() {
    driver.get(pages.formPage);
    List<WebElement> elements = driver.findElements(By.name("nonexistent button"));
    assertThat(elements).isEmpty();
  }

  // By.tagName positive

  @Test
  void testShouldBeAbleToFindASingleElementByTagName() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.tagName("input"));
    assertThat(element.getTagName().toLowerCase()).isEqualTo("input");
  }

  @Test
  void testShouldBeAbleToFindMultipleElementsByTagName() {
    driver.get(pages.formPage);
    List<WebElement> elements = driver.findElements(By.tagName("input"));
    assertThat(elements.size()).isGreaterThan(1);
  }

  // By.tagName negative

  @Test
  void testShouldNotBeAbleToLocateByTagNameASingleElementThatDoesNotExist() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.tagName("nonExistentButton")));
  }

  @Test
  void testShouldNotBeAbleToLocateByTagNameMultipleElementsThatDoNotExist() {
    driver.get(pages.formPage);
    List<WebElement> elements = driver.findElements(By.tagName("nonExistentButton"));
    assertThat(elements).isEmpty();
  }

  @Test
  void testFindingASingleElementByEmptyTagNameShouldThrow() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElement(By.tagName("")));
  }

  @Test
  void testFindingMultipleElementsByEmptyTagNameShouldThrow() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElements(By.tagName("")));
  }

  @Test
  void testFindingASingleElementByTagNameWithSpaceShouldThrow() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.tagName("nonexistent button")));
  }

  @Test
  void testFindingMultipleElementsByTagNameWithSpaceShouldReturnEmptyList() {
    driver.get(pages.formPage);
    List<WebElement> elements = driver.findElements(By.tagName("nonexistent button"));
    assertThat(elements).isEmpty();
  }

  // By.className positive

  @Test
  void testShouldBeAbleToFindASingleElementByClass() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.className("extraDiv"));
    assertThat(element.getText()).startsWith("Another div starts here.");
  }

  @Test
  void testShouldBeAbleToFindMultipleElementsByClassName() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.className("nameC"));
    assertThat(elements.size()).isGreaterThan(1);
  }

  @Test
  void testShouldFindElementByClassWhenItIsTheFirstNameAmongMany() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.className("nameA"));
    assertThat(element.getText()).isEqualTo("An H2 title");
  }

  @Test
  void testShouldFindElementByClassWhenItIsTheLastNameAmongMany() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.className("nameC"));
    assertThat(element.getText()).isEqualTo("An H2 title");
  }

  @Test
  void testShouldFindElementByClassWhenItIsInTheMiddleAmongMany() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.className("nameBnoise"));
    assertThat(element.getText()).isEqualTo("An H2 title");
  }

  @Test
  void testShouldFindElementByClassWhenItsNameIsSurroundedByWhitespace() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.className("spaceAround"));
    assertThat(element.getText()).isEqualTo("Spaced out");
  }

  @Test
  void testShouldFindElementsByClassWhenItsNameIsSurroundedByWhitespace() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.className("spaceAround"));
    assertThat(elements).hasSize(1);
    assertThat(elements.get(0).getText()).isEqualTo("Spaced out");
  }

  // By.className negative

  @Test
  void testShouldNotFindElementByClassWhenTheNameQueriedIsShorterThanCandidateName() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.className("nameB")));
  }

  @Test
  void testFindingASingleElementByEmptyClassNameShouldThrow() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElement(By.className("")));
  }

  @Test
  void testFindingMultipleElementsByEmptyClassNameShouldThrow() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElements(By.className("")));
  }

  @Test
  void testFindingASingleElementByCompoundClassNameShouldThrow() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElement(By.className("a b")));
  }

  @Test
  void testFindingMultipleElementsByCompoundClassNameShouldThrow() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElements(By.className("a b")));
  }

  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testShouldBeAbleToFindASingleElementByAWeirdLookingClassName() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.className("cls-!@#$%^&*"));
    assertThat(element.getAttribute("class")).isEqualTo("cls-!@#$%^&*");
  }

  @Test
  @NotYetImplemented(HTMLUNIT)
  public void testShouldBeAbleToFindMultipleElementsByAWeirdLookingClassName() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.className("cls-!@#$%^&*"));
    assertThat(elements).hasSize(1);
    assertThat(elements.get(0).getAttribute("class")).isEqualTo("cls-!@#$%^&*");
  }

  // By.xpath positive

  @Test
  void testShouldBeAbleToFindASingleElementByXPath() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.xpath("//h1"));
    assertThat(element.getText()).isEqualTo("XHTML Might Be The Future");
  }

  @Test
  void testShouldBeAbleToFindMultipleElementsByXPath() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.xpath("//div"));
    assertThat(elements).hasSize(13);
  }

  @Test
  void testShouldBeAbleToFindManyElementsRepeatedlyByXPath() {
    driver.get(pages.xhtmlTestPage);
    String xpathString = "//node()[contains(@id,'id')]";
    assertThat(driver.findElements(By.xpath(xpathString))).hasSize(3);

    xpathString = "//node()[contains(@id,'nope')]";
    assertThat(driver.findElements(By.xpath(xpathString))).isEmpty();
  }

  @Test
  void testShouldBeAbleToIdentifyElementsByClass() {
    driver.get(pages.xhtmlTestPage);
    WebElement header = driver.findElement(By.xpath("//h1[@class='header']"));
    assertThat(header.getText()).isEqualTo("XHTML Might Be The Future");
  }

  @Test
  void testShouldBeAbleToFindAnElementByXPathWithMultipleAttributes() {
    driver.get(pages.formPage);
    WebElement element =
        driver.findElement(
            By.xpath("//form[@name='optional']/input[@type='submit' and @value='Click!']"));
    assertThat(element.getTagName()).isEqualToIgnoringCase("input");
    assertThat(element.getAttribute("value")).isEqualTo("Click!");
  }

  @Test
  void testFindingALinkByXpathShouldLocateAnElementWithTheGivenText() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.xpath("//a[text()='click me']"));
    assertThat(element.getText()).isEqualTo("click me");
  }

  @Test
  void testFindingALinkByXpathUsingContainsKeywordShouldWork() {
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

  // By.xpath negative

  @Test
  void testShouldThrowAnExceptionWhenThereIsNoLinkToClick() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.xpath("//a[@id='Not here']")));
  }

  @Test
  void testShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInDriverFindElement() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElement(By.xpath("this][isnot][valid")));
  }

  @Test
  void
      testShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInDriverFindElements() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElements(By.xpath("this][isnot][valid")));
  }

  @Test
  void
      testShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInElementFindElement() {
    driver.get(pages.formPage);
    WebElement body = driver.findElement(By.tagName("body"));
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> body.findElement(By.xpath("this][isnot][valid")));
  }

  @Test
  void
      testShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInElementFindElements() {
    driver.get(pages.formPage);
    WebElement body = driver.findElement(By.tagName("body"));
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> body.findElements(By.xpath("this][isnot][valid")));
  }

  @Test
  void testShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInDriverFindElement() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElement(By.xpath("count(//input)")));
  }

  @Test
  void testShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInDriverFindElements() {
    driver.get(pages.formPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElements(By.xpath("count(//input)")));
  }

  @Test
  void testShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInElementFindElement() {
    driver.get(pages.formPage);

    WebElement body = driver.findElement(By.tagName("body"));
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> body.findElement(By.xpath("count(//input)")));
  }

  @Test
  void testShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInElementFindElements() {
    driver.get(pages.formPage);
    WebElement body = driver.findElement(By.tagName("body"));
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> body.findElements(By.xpath("count(//input)")));
  }

  // By.cssSelector positive

  @Test
  void testShouldBeAbleToFindASingleElementByCssSelector() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.cssSelector("div.content"));
    assertThat(element.getTagName()).isEqualToIgnoringCase("div");
    assertThat(element.getAttribute("class")).isEqualTo("content");
  }

  @Test
  void testShouldBeAbleToFindMultipleElementsByCssSelector() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.cssSelector("p"));
    assertThat(elements.size()).isGreaterThan(1);
  }

  @Test
  void testShouldBeAbleToFindASingleElementByCompoundCssSelector() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.cssSelector("div.extraDiv, div.content"));
    assertThat(element.getTagName()).isEqualToIgnoringCase("div");
    assertThat(element.getAttribute("class")).isEqualTo("content");
  }

  @Test
  void testShouldBeAbleToFindMultipleElementsByCompoundCssSelector() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.cssSelector("div.extraDiv, div.content"));
    assertThat(elements.size()).isGreaterThan(1);
    assertThat(elements.get(0).getAttribute("class")).isEqualTo("content");
    assertThat(elements.get(1).getAttribute("class")).isEqualTo("extraDiv");
  }

  @Test
  void testShouldBeAbleToFindAnElementByBooleanAttributeUsingCssSelector() {
    driver.get(appServer.whereIs("locators_tests/boolean_attribute_selected.html"));
    WebElement element = driver.findElement(By.cssSelector("option[selected='selected']"));
    assertThat(element.getAttribute("value")).isEqualTo("two");
  }

  @Test
  void testShouldBeAbleToFindAnElementByBooleanAttributeUsingShortCssSelector() {
    driver.get(appServer.whereIs("locators_tests/boolean_attribute_selected.html"));
    WebElement element = driver.findElement(By.cssSelector("option[selected]"));
    assertThat(element.getAttribute("value")).isEqualTo("two");
  }

  @Test
  void testShouldBeAbleToFindAnElementByBooleanAttributeUsingShortCssSelectorOnHtml4Page() {
    driver.get(appServer.whereIs("locators_tests/boolean_attribute_selected_html4.html"));
    WebElement element = driver.findElement(By.cssSelector("option[selected]"));
    assertThat(element.getAttribute("value")).isEqualTo("two");
  }

  // By.cssSelector negative

  @Test
  void testShouldNotFindElementByCssSelectorWhenThereIsNoSuchElement() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.cssSelector(".there-is-no-such-class")));
  }

  @Test
  void testShouldNotFindElementsByCssSelectorWhenThereIsNoSuchElement() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.cssSelector(".there-is-no-such-class"));
    assertThat(elements).isEmpty();
  }

  @Test
  void testFindingASingleElementByEmptyCssSelectorShouldThrow() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElement(By.cssSelector("")));
  }

  @Test
  void testFindingMultipleElementsByEmptyCssSelectorShouldThrow() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElements(By.cssSelector("")));
  }

  @Test
  void testFindingASingleElementByInvalidCssSelectorShouldThrow() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElement(By.cssSelector("//a/b/c[@id='1']")));
  }

  @Test
  void testFindingMultipleElementsByInvalidCssSelectorShouldThrow() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(InvalidSelectorException.class)
        .isThrownBy(() -> driver.findElements(By.cssSelector("//a/b/c[@id='1']")));
  }

  // By.linkText positive

  @Test
  void testShouldBeAbleToFindALinkByText() {
    driver.get(pages.xhtmlTestPage);
    WebElement link = driver.findElement(By.linkText("click me"));
    assertThat(link.getText()).isEqualTo("click me");
  }

  @Test
  void testShouldBeAbleToFindMultipleLinksByText() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.linkText("click me"));
    assertThat(elements).hasSize(2);
  }

  @Test
  void testShouldFindElementByLinkTextContainingEqualsSign() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.linkText("Link=equalssign"));
    assertThat(element.getAttribute("id")).isEqualTo("linkWithEqualsSign");
  }

  @Test
  void testShouldFindMultipleElementsByLinkTextContainingEqualsSign() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.linkText("Link=equalssign"));
    assertThat(elements).hasSize(1);
    assertThat(elements.get(0).getAttribute("id")).isEqualTo("linkWithEqualsSign");
  }

  @Test
  void findsByLinkTextOnXhtmlPage() {
    driver.get(appServer.whereIs("actualXhtmlPage.xhtml"));
    String linkText = "Foo";
    WebElement element = driver.findElement(By.linkText(linkText));
    assertThat(element.getText()).isEqualTo(linkText);
  }

  @Test
  void testLinkWithFormattingTags() {
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
  void testShouldNotBeAbleToLocateByLinkTextASingleElementThatDoesNotExist() {
    driver.get(pages.xhtmlTestPage);
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.linkText("Not here either")));
  }

  @Test
  void testShouldNotBeAbleToLocateByLinkTextMultipleElementsThatDoNotExist() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.linkText("Not here either"));
    assertThat(elements.size()).isZero();
  }

  // By.partialLinkText positive

  @Test
  void testShouldBeAbleToFindMultipleElementsByPartialLinkText() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.partialLinkText("ick me"));
    assertThat(elements.size()).isEqualTo(2);
  }

  @Test
  void testShouldBeAbleToFindASingleElementByPartialLinkText() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.partialLinkText("anon"));
    assertThat(element.getText()).contains("anon");
  }

  @Test
  void testShouldFindElementByPartialLinkTextContainingEqualsSign() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.partialLinkText("Link="));
    assertThat(element.getAttribute("id")).isEqualTo("linkWithEqualsSign");
  }

  @Test
  void testShouldFindMultipleElementsByPartialLinkTextContainingEqualsSign() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.partialLinkText("Link="));
    assertThat(elements).hasSize(1);
    assertThat(elements.get(0).getAttribute("id")).isEqualTo("linkWithEqualsSign");
  }

  // Misc tests

  @Test
  void testDriverShouldBeAbleToFindElementsAfterLoadingMoreThanOnePageAtATime() {
    driver.get(pages.formPage);
    driver.get(pages.xhtmlTestPage);
    WebElement link = driver.findElement(By.linkText("click me"));
    assertThat(link.getText()).isEqualTo("click me");
  }

  // You don't want to ask why this is here
  @Test
  void testWhenFindingByNameShouldNotReturnById() {
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
  void testShouldBeAbleToFindAHiddenElementsByName() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.name("hidden"));
    assertThat(element.getAttribute("name")).isEqualTo("hidden");
  }

  @Test
  void testShouldNotBeAbleToFindAnElementOnABlankPage() {
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
        .isThrownBy(() -> driver.findElement(By.id("nonExistentButton")));
  }

  @SwitchToTopAfterTest
  @Test
  @Ignore(
      value = CHROME,
      reason = "Element in different browsing context can not evaluate stale",
      issue = "https://bugs.chromium.org/p/chromedriver/issues/detail?id=3742")
  public void testAnElementFoundInADifferentFrameIsNotFound() {
    driver.get(pages.missedJsReferencePage);
    driver.switchTo().frame("inner");
    WebElement element = driver.findElement(By.id("oneline"));
    driver.switchTo().defaultContent();
    assertThatExceptionOfType(NoSuchElementException.class).isThrownBy(element::getText);
  }
}
