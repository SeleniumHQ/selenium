/*
Copyright 2007-2009 WebDriver committers

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
import org.openqa.selenium.testing.TestUtilities;

import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

import static org.hamcrest.Matchers.equalTo;

import java.util.List;

public class XPathElementFindingTest extends JUnit4TestBase {

  @Test
  public void testShouldThrowAnExceptionWhenThereIsNoLinkToClickAndItIsFoundWithXPath() {
    driver.get(pages.xhtmlTestPage);

    try {
      driver.findElement(By.xpath("//a[@id='Not here']"));
      fail("Should not have succeeded");
    } catch (NoSuchElementException e) {
      // this is expected
    }
  }

  @Test
  public void testShouldThrowAnExceptionWhenThereIsNoLinkToClick() {
    driver.get(pages.xhtmlTestPage);

    try {
      driver.findElement(By.xpath("//a[@id='Not here']"));
      fail("Should not have succeeded");
    } catch (NoSuchElementException e) {
      // this is expected
    }
  }

  @Test
  public void testShouldFindSingleElementByXPath() {
    driver.get(pages.xhtmlTestPage);
    WebElement element = driver.findElement(By.xpath("//h1"));
    assertThat(element.getText(), equalTo("XHTML Might Be The Future"));
  }

  @Ignore(SELENESE)
  @Test
  public void testShouldFindElementsByXPath() {
    driver.get(pages.xhtmlTestPage);
    List<WebElement> divs = driver.findElements(By.xpath("//div"));

    assertThat(divs.size(), equalTo(13));
  }

  @Ignore(SELENESE)
  @Test
  public void testShouldBeAbleToFindManyElementsRepeatedlyByXPath() {
    driver.get(pages.xhtmlTestPage);
    String xpathString = "//node()[contains(@id,'id')]";
    assertThat(driver.findElements(By.xpath(xpathString)).size(), equalTo(3));

    xpathString = "//node()[contains(@id,'nope')]";
    assertThat(driver.findElements(By.xpath(xpathString)).size(), equalTo(0));
  }

  @Test
  public void testShouldBeAbleToIdentifyElementsByClass() {
    driver.get(pages.xhtmlTestPage);

    String header = driver.findElement(By.xpath("//h1[@class='header']")).getText();
    assertThat(header, equalTo("XHTML Might Be The Future"));
  }

  @Test
  public void testShouldBeAbleToSearchForMultipleAttributes() {
    driver.get(pages.formPage);

    try {
      driver.findElement(
          By.xpath("//form[@name='optional']/input[@type='submit' and @value='Click!']")).click();
    } catch (NoSuchElementException e) {
      fail("Should be able to find the submit button");
    }
  }

  @Test
  public void testShouldLocateElementsWithGivenText() {
    driver.get(pages.xhtmlTestPage);

    try {
      driver.findElement(By.xpath("//a[text()='click me']"));
    } catch (NoSuchElementException e) {
      e.printStackTrace();
      fail("Cannot find the element");
    }
  }

  @Ignore({ANDROID, IPHONE, SELENESE, OPERA})
  @Test
  public void testShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInDriverFindElement() {
    driver.get(pages.formPage);

    try {
      driver.findElement(By.xpath("this][isnot][valid"));
      fail("Should not have succeeded because the xpath expression is syntactically not correct");
    } catch (InvalidSelectorException ignored) {
      // We expect an InvalidSelectorException because the xpath expression is syntactically
      // invalid
    }
  }

  @Ignore({ANDROID, IPHONE, SELENESE, OPERA})
  @Test
  public void testShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInDriverFindElements() {
    if (TestUtilities.isIe6(driver)) {
      System.out.println("Ignoring xpath error test in IE6");
      return;
    }
    driver.get(pages.formPage);

    try {
      driver.findElements(By.xpath("this][isnot][valid"));
      fail("Should not have succeeded because the xpath expression is syntactically not correct");
    } catch (InvalidSelectorException ignored) {
      // We expect an InvalidSelectorException because the xpath expression is syntactically
      // invalid
    }
  }

  @Ignore({ANDROID, IPHONE, OPERA, SELENESE})
  @Test
  public void testShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInElementFindElement() {
    driver.get(pages.formPage);
    WebElement body = driver.findElement(By.tagName("body"));
    try {
      body.findElement(By.xpath("this][isnot][valid"));
      fail("Should not have succeeded because the xpath expression is syntactically not correct");
    } catch (InvalidSelectorException ignored) {
      // We expect an InvalidSelectorException because the xpath expression is syntactically
      // invalid
    }
  }

  @Ignore({ANDROID, IPHONE, OPERA, SELENESE})
  @Test
  public void testShouldThrowInvalidSelectorExceptionWhenXPathIsSyntacticallyInvalidInElementFindElements() {
    if (TestUtilities.isIe6(driver)) {
      System.out.println("Ignoring xpath error test in IE6");
      return;
    }
    driver.get(pages.formPage);
    WebElement body = driver.findElement(By.tagName("body"));
    try {
      body.findElements(By.xpath("this][isnot][valid"));
      fail("Should not have succeeded because the xpath expression is syntactically not correct");
    } catch (InvalidSelectorException ignored) {
      // We expect an InvalidSelectorException because the xpath expression is syntactically
      // invalid
    }
  }

  @Ignore({ANDROID, IPHONE, OPERA, SELENESE})
  @Test
  public void testShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInDriverFindElement() {
    driver.get(pages.formPage);

    try {
      driver.findElement(By.xpath("count(//input)"));
      fail("Should not have succeeded because the xpath expression does not select an element");
    } catch (InvalidSelectorException ignored) {
      // We expect an exception because the XPath expression
      // results in a number, not in an element.
    }
  }

  @Ignore({ANDROID, IPHONE, OPERA, SELENESE})
  @Test
  public void testShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInDriverFindElements() {
    if (TestUtilities.isIe6(driver)) {
      System.out.println("Ignoring xpath error test in IE6");
      return;
    }
    driver.get(pages.formPage);

    try {
      driver.findElements(By.xpath("count(//input)"));
      fail("Should not have succeeded because the xpath expression does not select an element");
    } catch (InvalidSelectorException ignored) {
      // We expect an exception because the XPath expression
      // results in a number, not in an element.
    }
  }

  @Ignore({ANDROID, IPHONE, OPERA, SELENESE})
  @Test
  public void testShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInElementFindElement() {
    driver.get(pages.formPage);

    WebElement body = driver.findElement(By.tagName("body"));

    try {
      body.findElement(By.xpath("count(//input)"));
      fail("Should not have succeeded because the xpath expression does not select an element");
    } catch (InvalidSelectorException ignored) {
      // We expect an exception because the XPath expression
      // results in a number, not in an element.
    }
  }

  @Ignore({ANDROID, IPHONE, OPERA, SELENESE})
  @Test
  public void testShouldThrowInvalidSelectorExceptionWhenXPathReturnsWrongTypeInElementFindElements() {
    if (TestUtilities.isIe6(driver)) {
      System.out.println("Ignoring xpath error test in IE6");
      return;
    }
    driver.get(pages.formPage);

    WebElement body = driver.findElement(By.tagName("body"));

    try {
      body.findElements(By.xpath("count(//input)"));
      fail("Should not have succeeded because the xpath expression does not select an element");
    } catch (InvalidSelectorException ignored) {
      // We expect an exception because the XPath expression
      // results in a number, not in an element.
    }
  }
}
