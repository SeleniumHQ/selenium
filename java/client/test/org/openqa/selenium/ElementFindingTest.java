/*
Copyright 2012 Software Freedom Conservancy
Copyright 2007-2012 Selenium committers

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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;
import static org.openqa.selenium.testing.TestUtilities.isOldIe;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.pageTitleToBe;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;

import java.util.List;
import java.util.concurrent.Callable;

public class ElementFindingTest extends JUnit4TestBase {

  @Test
  public void testShouldReturnTitleOfPageIfSet() {
    driver.get(pages.xhtmlTestPage);
    assertThat(driver.getTitle(), equalTo(("XHTML Test Page")));

    driver.get(pages.simpleTestPage);
    assertThat(driver.getTitle(), equalTo("Hello WebDriver"));
  }

  @Test
  public void testShouldNotBeAbleToLocateASingleElementThatDoesNotExist() {
    driver.get(pages.formPage);

    try {
      driver.findElement(By.id("nonExistantButton"));
      fail("Should not have succeeded");
    } catch (NoSuchElementException e) {
      // this is expected
    }
  }

  @Test
  public void testShouldBeAbleToClickOnLinkIdentifiedByText() {
    driver.get(pages.xhtmlTestPage);
    driver.findElement(By.linkText("click me")).click();

    waitFor(pageTitleToBe(driver, "We Arrive Here"));

    assertThat(driver.getTitle(), equalTo("We Arrive Here"));
  }

  @Test
  public void testDriverShouldBeAbleToFindElementsAfterLoadingMoreThanOnePageAtATime() {
    driver.get(pages.formPage);
    driver.get(pages.xhtmlTestPage);
    driver.findElement(By.linkText("click me")).click();

    waitFor(pageTitleToBe(driver, "We Arrive Here"));

    assertThat(driver.getTitle(), equalTo("We Arrive Here"));
  }

  @Test
  public void testshouldBeAbleToClickOnLinkIdentifiedById() {
    driver.get(pages.xhtmlTestPage);
    driver.findElement(By.id("linkId")).click();

    waitFor(pageTitleToBe(driver, "We Arrive Here"));

    assertThat(driver.getTitle(), equalTo("We Arrive Here"));
  }

  @Test
  public void testShouldThrowAnExceptionWhenThereIsNoLinkToClickAndItIsFoundWithLinkText() {
    driver.get(pages.xhtmlTestPage);

    try {
      driver.findElement(By.linkText("Not here either"));
      fail("Should not have succeeded");
    } catch (NoSuchElementException e) {
      // this is expected
    }
  }

  @Test
  public void testShouldfindAnElementBasedOnId() {
    driver.get(pages.formPage);

    WebElement element = driver.findElement(By.id("checky"));

    assertThat(element.isSelected(), is(false));
  }

  @Test
  public void testShouldNotBeAbleTofindElementsBasedOnIdIfTheElementIsNotThere() {
    driver.get(pages.formPage);

    try {
      driver.findElement(By.id("notThere"));
      fail("Should not have succeeded");
    } catch (NoSuchElementException e) {
      // this is expected
    }
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

  @Ignore(value = SELENESE, reason = "Value returned as 'off'")
  @Test
  public void testShouldFindElementsByName() {
    driver.get(pages.formPage);

    WebElement element = driver.findElement(By.name("checky"));

    assertThat(element.getAttribute("value"), is("furrfu"));
  }

  @Test
  public void testShouldFindElementsByClass() {
    driver.get(pages.xhtmlTestPage);

    WebElement element = driver.findElement(By.className("extraDiv"));
    assertTrue(element.getText().startsWith("Another div starts here."));
  }

  @Test
  public void testShouldFindElementsByClassWhenItIsTheFirstNameAmongMany() {
    driver.get(pages.xhtmlTestPage);

    WebElement element = driver.findElement(By.className("nameA"));
    assertThat(element.getText(), equalTo("An H2 title"));
  }

  @Test
  public void testShouldFindElementsByClassWhenItIsTheLastNameAmongMany() {
    driver.get(pages.xhtmlTestPage);

    WebElement element = driver.findElement(By.className("nameC"));
    assertThat(element.getText(), equalTo("An H2 title"));
  }

  @Test
  public void testShouldFindElementsByClassWhenItIsInTheMiddleAmongMany() {
    driver.get(pages.xhtmlTestPage);

    WebElement element = driver.findElement(By.className("nameBnoise"));
    assertThat(element.getText(), equalTo("An H2 title"));
  }

  @Test
  public void testShouldFindElementByClassWhenItsNameIsSurroundedByWhitespace() {
    driver.get(pages.xhtmlTestPage);

    WebElement element = driver.findElement(By.className("spaceAround"));
    assertThat(element.getText(), equalTo("Spaced out"));
  }

  @Test
  public void testShouldFindElementsByClassWhenItsNameIsSurroundedByWhitespace() {
    driver.get(pages.xhtmlTestPage);

    List<WebElement> elements = driver.findElements(By.className("spaceAround"));
    assertThat(elements.size(), equalTo(1));
    assertThat(elements.get(0).getText(), equalTo("Spaced out"));
  }

  @Test
  public void testShouldNotFindElementsByClassWhenTheNameQueriedIsShorterThanCandidateName() {
    driver.get(pages.xhtmlTestPage);

    try {
      driver.findElement(By.className("nameB"));
      fail("Should not have succeeded");
    } catch (NoSuchElementException e) {
      // this is expected
    }
  }

  @Test
  public void testShouldBeAbleToFindMultipleElementsByXPath() {
    driver.get(pages.xhtmlTestPage);

    List<WebElement> elements = driver.findElements(By.xpath("//div"));

    assertTrue(elements.size() > 1);
  }

  @Test
  public void testShouldBeAbleToFindMultipleElementsByLinkText() {
    driver.get(pages.xhtmlTestPage);

    List<WebElement> elements = driver.findElements(By.linkText("click me"));

    assertTrue("Expected 2 links, got " + elements.size(), elements.size() == 2);
  }

  @Test
  public void testShouldBeAbleToFindMultipleElementsByPartialLinkText() {
    driver.get(pages.xhtmlTestPage);

    List<WebElement> elements = driver.findElements(By.partialLinkText("ick me"));

    assertTrue(elements.size() == 2);
  }

  @Test
  public void testShouldBeAbleToFindElementByPartialLinkText() {
    driver.get(pages.xhtmlTestPage);

    try {
      driver.findElement(By.partialLinkText("anon"));
    } catch (NoSuchElementException e) {
      fail("Expected element to be found");
    }
  }

  @Test
  public void testShouldFindElementByLinkTextContainingEqualsSign() {
    driver.get(pages.xhtmlTestPage);

    try {
      WebElement element = driver.findElement(By.linkText("Link=equalssign"));
      assertEquals("linkWithEqualsSign", element.getAttribute("id"));
    } catch (NoSuchElementException e) {
      fail("Expected element to be found");
    }
  }

  @Test
  public void testShouldFindElementByPartialLinkTextContainingEqualsSign() {
    driver.get(pages.xhtmlTestPage);

    try {
      WebElement element = driver.findElement(By.partialLinkText("Link="));
      assertEquals("linkWithEqualsSign", element.getAttribute("id"));
    } catch (NoSuchElementException e) {
      fail("Expected element to be found");
    }
  }

  @Test
  public void testShouldFindElementsByLinkTextContainingEqualsSign() {
    driver.get(pages.xhtmlTestPage);

    List<WebElement> elements = driver.findElements(By.linkText("Link=equalssign"));
    assertEquals(1, elements.size());
    assertEquals("linkWithEqualsSign", elements.get(0).getAttribute("id"));
  }

  @Test
  public void testShouldFindElementsByPartialLinkTextContainingEqualsSign() {
    driver.get(pages.xhtmlTestPage);

    List<WebElement> elements = driver.findElements(By.partialLinkText("Link="));
    assertEquals(1, elements.size());
    assertEquals("linkWithEqualsSign", elements.get(0).getAttribute("id"));
  }

  @Test
  public void testShouldBeAbleToFindMultipleElementsByName() {
    driver.get(pages.nestedPage);

    List<WebElement> elements = driver.findElements(By.name("checky"));

    assertTrue(elements.size() > 1);
  }

  @Ignore(value = ANDROID, reason = "Bug in Android's XPath library.")
  @Test
  public void testShouldBeAbleToFindMultipleElementsById() {
    driver.get(pages.nestedPage);

    List<WebElement> elements = driver.findElements(By.id("2"));

    assertEquals(8, elements.size());
  }

  @Test
  public void testShouldBeAbleToFindMultipleElementsByClassName() {
    driver.get(pages.xhtmlTestPage);

    List<WebElement> elements = driver.findElements(By.className("nameC"));

    assertTrue(elements.size() > 1);
  }

  // You don't want to ask why this is here
  @Test
  public void testWhenFindingByNameShouldNotReturnById() {
    driver.get(pages.formPage);

    WebElement element = driver.findElement(By.name("id-name1"));
    assertThat(element.getAttribute("value"), is("name"));

    element = driver.findElement(By.id("id-name1"));
    assertThat(element.getAttribute("value"), is("id"));

    element = driver.findElement(By.name("id-name2"));
    assertThat(element.getAttribute("value"), is("name"));

    element = driver.findElement(By.id("id-name2"));
    assertThat(element.getAttribute("value"), is("id"));
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
    try {
      element.findElement(By.name("x"));
    } catch (NoSuchElementException e) {
      // this is expected
    }
  }

  @Test
  public void testShouldReturnElementsThatDoNotSupportTheNameProperty() {
    driver.get(pages.nestedPage);

    driver.findElement(By.name("div1"));
    // If this works, we're all good
  }

  @Test
  public void testShouldFindHiddenElementsByName() {
    driver.get(pages.formPage);

    try {
      driver.findElement(By.name("hidden"));
    } catch (NoSuchElementException e) {
      fail("Expected to be able to find hidden element");
    }
  }

  @Test
  public void testShouldfindAnElementBasedOnTagName() {
    driver.get(pages.formPage);

    WebElement element = driver.findElement(By.tagName("input"));

    assertNotNull(element);
  }

  @Test
  public void testShouldfindElementsBasedOnTagName() {
    driver.get(pages.formPage);

    List<WebElement> elements = driver.findElements(By.tagName("input"));

    assertNotNull(elements);
  }

  @Test
  public void testFindingByCompoundClassNameIsAnError() {
    driver.get(pages.xhtmlTestPage);

    try {
      driver.findElement(By.className("a b"));
      fail("Compound class names aren't allowed");
    } catch (IllegalLocatorException e) {
      // This is expected
    }

    try {
      driver.findElements(By.className("a b"));
      fail("Compound class names aren't allowed");
    } catch (IllegalLocatorException e) {
      // This is expected
    }
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToClickOnLinksWithNoHrefAttribute() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.linkText("No href"));
    element.click();

    // if any exception is thrown, we won't get this far. Sanity check
    waitFor(pageTitleToBe(driver, "Changed"));

    assertEquals("Changed", driver.getTitle());
  }

  @Ignore({SELENESE})
  @Test
  public void testShouldNotBeAbleToFindAnElementOnABlankPage() {
    driver.get("about:blank");

    try {
      // Search for anything. This used to cause an IllegalStateException in IE.
      driver.findElement(By.tagName("a"));
      fail("Should not have been able to find a link");
    } catch (NoSuchElementException e) {
      // this is expected
    }
  }

  @Ignore({IPHONE})
  @NeedsFreshDriver
  @Test
  public void testShouldNotBeAbleToLocateASingleElementOnABlankPage() {
    // Note we're on the default start page for the browser at this point.

    try {
      driver.findElement(By.id("nonExistantButton"));
      fail("Should not have succeeded");
    } catch (NoSuchElementException e) {
      // this is expected
    }
  }

  @JavascriptEnabled
  @Test
  public void testRemovingAnElementDynamicallyFromTheDomShouldCauseAStaleRefException() {
    driver.get(pages.javascriptPage);

    WebElement toBeDeleted = driver.findElement(By.id("deleted"));
    assertTrue(toBeDeleted.isDisplayed());

    driver.findElement(By.id("delete")).click();

    boolean wasStale = waitFor(elementToBeStale(toBeDeleted));
    assertTrue("Element should be stale at this point", wasStale);
  }

  private Callable<Boolean> elementToBeStale(final WebElement element) {
    return new Callable<Boolean>() {

      public Boolean call() throws Exception {
        try {
          element.isDisplayed();
          return false;
        } catch (StaleElementReferenceException e) {
          return true;
        }
      }
    };
  }

  @Test
  public void testFindingALinkByXpathUsingContainsKeywordShouldWork() {
    driver.get(pages.nestedPage);

    try {
      driver.findElement(By.xpath("//a[contains(.,'hello world')]"));
    } catch (Exception e) {
      fail("Should not have thrown an exception");
    }
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToFindAnElementByCssSelector() {
    driver.get(pages.xhtmlTestPage);
    driver.findElement(By.cssSelector("div.content"));
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToFindElementsByCssSelector() {
    driver.get(pages.xhtmlTestPage);
    driver.findElements(By.cssSelector("p"));
  }

  @JavascriptEnabled
  @Ignore(CHROME)
  @Test
  public void testShouldBeAbleToFindAnElementByCompoundCssSelector() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.cssSelector("div.extraDiv, div.content"));
    assertEquals("content", element.getAttribute("class"));
  }

  @JavascriptEnabled
  @Ignore(CHROME)
  @Test
  public void testShouldBeAbleToFindElementsByCompoundCssSelector() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> elements = driver.findElements(By.cssSelector("div.extraDiv, div.content"));
    assertEquals("content", elements.get(0).getAttribute("class"));
    assertEquals("extraDiv", elements.get(1).getAttribute("class"));
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

  // TODO(danielwh): Add extensive CSS selector tests
  @Ignore(value = {ANDROID, OPERA, SELENESE, OPERA_MOBILE}, reason = "Just not working")
  @Test
  public void testAnElementFoundInADifferentFrameIsStale() {
    driver.get(pages.missedJsReferencePage);
    driver.switchTo().frame("inner");
    WebElement element = driver.findElement(By.id("oneline"));
    driver.switchTo().defaultContent();
    try {
      element.getText();
      fail("Expected exception");
    } catch (StaleElementReferenceException expected) {
      // Expected
    }
  }

  @JavascriptEnabled
  @Ignore({ANDROID, IPHONE, OPERA, SELENESE, OPERA_MOBILE})
  @Test
  public void testAnElementFoundInADifferentFrameViaJsCanBeUsed() {
    driver.get(pages.missedJsReferencePage);

    try {
      driver.switchTo().frame("inner");
      WebElement first = driver.findElement(By.id("oneline"));

      driver.switchTo().defaultContent();
      WebElement element = (WebElement) ((JavascriptExecutor) driver).executeScript(
          "return frames[0].document.getElementById('oneline');");


      driver.switchTo().frame("inner");

      WebElement second = driver.findElement(By.id("oneline"));

      assertEquals(first, element);
      assertEquals(second, element);
    } finally {
      driver.switchTo().defaultContent();
    }
  }

  @Test
  @Ignore({CHROME, OPERA})
  public void findsByLinkTextOnXhtmlPage() {
    if (isOldIe(driver)) {
      // Old IE doesn't render XHTML pages, don't try loading XHTML pages in it
      return;
    }
    driver.get(appServer.whereIs("actualXhtmlPage.xhtml"));
    String linkText = "Foo";
    WebElement element = driver.findElement(By.linkText(linkText));
    assertEquals(linkText, element.getText());
  }
}
