/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

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
import org.hamcrest.Matchers;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.matchers.JUnitMatchers.either;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.CHROME_NON_WINDOWS;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.REMOTE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

import org.openqa.selenium.internal.Locatable;

import java.awt.*;

/**
 * Test case for browsers that support using Javascript
 */
public class JavascriptEnabledDriverTest extends AbstractDriverTestCase {

  @JavascriptEnabled
  @Ignore(value = SELENESE, reason = "I'm not sure why this fails")
  public void testDocumentShouldReflectLatestTitle() throws Exception {
    driver.get(pages.javascriptPage);

    assertThat(driver.getTitle(), equalTo("Testing Javascript"));
    driver.findElement(By.linkText("Change the page title!")).click();
    assertThat(driver.getTitle(), equalTo("Changed"));

    String titleViaXPath = driver.findElement(By.xpath("/html/head/title")).getText();
    assertThat(titleViaXPath, equalTo("Changed"));
  }

  @JavascriptEnabled
  public void testDocumentShouldReflectLatestDom() throws Exception {
    driver.get(pages.javascriptPage);
    String currentText = driver.findElement(By.xpath("//div[@id='dynamo']")).getText();
    assertThat(currentText, equalTo("What's for dinner?"));

    WebElement webElement = driver.findElement(By.linkText("Update a div"));
    webElement.click();

    String newText = driver.findElement(By.xpath("//div[@id='dynamo']")).getText();
    assertThat(newText, equalTo("Fish and chips!"));
  }

//    public void testShouldAllowTheUserToOkayConfirmAlerts() {
//		driver.get(alertPage);
//		driver.findElement(By.id("confirm").click();
//		driver.switchTo().alert().accept();
//		assertEquals("Hello WebDriver", driver.getTitle());
//	}
//
//	public void testShouldAllowUserToDismissAlerts() {
//		driver.get(alertPage);
//		driver.findElement(By.id("confirm").click();
//
//		driver.switchTo().alert().dimiss();
//		assertEquals("Testing Alerts", driver.getTitle());
//	}
//
//	public void testShouldBeAbleToGetTheTextOfAnAlert() {
//		driver.get(alertPage);
//		driver.findElement(By.id("confirm").click();
//
//		String alertText = driver.switchTo().alert().getText();
//		assertEquals("Are you sure?", alertText);
//	}
//
//	public void testShouldThrowAnExceptionIfAnAlertIsBeingDisplayedAndTheUserAttemptsToCarryOnRegardless() {
//		driver.get(alertPage);
//		driver.findElement(By.id("confirm").click();
//
//		try {
//			driver.get(simpleTestPage);
//			fail("Expected the alert not to allow further progress");
//		} catch (UnhandledAlertException e) {
//			// This is good
//		}
//	}

  @JavascriptEnabled
  @Ignore(value = {IE, SELENESE, CHROME_NON_WINDOWS, IPHONE},
      reason = "Chrome failing on OS X;\n  iPhone: does not detect that a new page loaded.")
  public void testShouldWaitForLoadsToCompleteAfterJavascriptCausesANewPageToLoad() {
    driver.get(pages.formPage);

    driver.findElement(By.id("changeme")).setSelected();

    assertThat(driver.getTitle(), equalTo("Page3"));
  }

  @JavascriptEnabled
  @Ignore(value = {IE, SELENESE, CHROME_NON_WINDOWS, IPHONE},
      reason = "Chrome failing on OS X;\n  iPhone: does not detect that a new page loaded.")
  public void testShouldBeAbleToFindElementAfterJavascriptCausesANewPageToLoad()
      throws InterruptedException {
    driver.get(pages.formPage);

    driver.findElement(By.id("changeme")).setSelected();

    assertThat(driver.findElement(By.id("pageNumber")).getText(), equalTo("3"));
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  public void testShouldBeAbleToDetermineTheLocationOfAnElement() {
    driver.get(pages.xhtmlTestPage);

    RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("username"));
    Point location = element.getLocation();

    assertThat(location.getX() > 0, is(true));
    assertThat(location.getY() > 0, is(true));
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  public void testShouldBeAbleToDetermineTheSizeOfAnElement() {
    driver.get(pages.xhtmlTestPage);

    RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("username"));
    Dimension size = element.getSize();

    assertThat(size.getWidth() > 0, is(true));
    assertThat(size.getHeight() > 0, is(true));
  }

  @JavascriptEnabled
  @Ignore(value = {CHROME_NON_WINDOWS, IPHONE},
      reason = "iPhone: sendKeys not implemented correctly")
  public void testShouldFireOnChangeEventWhenSettingAnElementsValue() {
    driver.get(pages.javascriptPage);
    driver.findElement(By.id("change")).sendKeys("foo");
    String result = driver.findElement(By.id("result")).getText();

    assertThat(result, equalTo("change"));
  }

  @JavascriptEnabled
  public void testShouldBeAbleToSubmitFormsByCausingTheOnClickEventToFire() {
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("jsSubmitButton"));
    element.click();

    assertThat(driver.getTitle(), Matchers.is("We Arrive Here"));
  }

  @JavascriptEnabled
  @Ignore(value = IE, reason = "Fails for IE in the continuous build")
  public void testShouldBeAbleToClickOnSubmitButtons() {
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("submittingButton"));
    element.click();

    assertThat(driver.getTitle(), Matchers.is("We Arrive Here"));
  }

  @JavascriptEnabled
  public void testIssue80ClickShouldGenerateClickEvent() {
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("clickField"));
    assertEquals("Hello", element.getValue());

    element.click();

    assertEquals("Clicked", element.getValue());
  }

  @JavascriptEnabled
  @Ignore(value = {SELENESE,IPHONE}, reason = "iPhone: focus doesn't change as expected")
  public void testShouldBeAbleToSwitchToFocusedElement() {
    driver.get(pages.javascriptPage);

    driver.findElement(By.id("switchFocus")).click();

    WebElement element = driver.switchTo().activeElement();
    assertThat(element.getAttribute("id"), is("theworks"));
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  public void testIfNoElementHasFocusTheActiveElementIsTheBody() {
    driver.get(pages.simpleTestPage);

    WebElement element = driver.switchTo().activeElement();

    assertThat(element.getAttribute("name"), is("body"));
  }

  @JavascriptEnabled
  @Ignore(value = {IE, FIREFOX, REMOTE, CHROME, SELENESE},
          reason = "Firefox: Window demands focus to work. Chrome: Event firing is broken.  Other platforms: not properly tested")
  public void testChangeEventIsFiredAppropriatelyWhenFocusIsLost() {
    driver.get(pages.javascriptPage);

    WebElement input = driver.findElement(By.id("changeable"));
    input.sendKeys("test");
    driver.findElement(By.id("clickField")).click(); // move focus
    assertThat(driver.findElement(By.id("result")).getText().trim(),
               either(is("focus change blur")).or(is("focus blur change")));

    input.sendKeys(Keys.BACK_SPACE, "t");
    driver.findElement(By.xpath("//body")).click();  // move focus

    // I weep.
    assertThat(driver.findElement(By.id("result")).getText().trim(),
               either(is("focus change blur focus blur"))
                   .or(is("focus blur change focus blur"))
                   .or(is("focus blur change focus blur change"))
                   .or(is("focus change blur focus change blur"))); //What Chrome does
  }

  /**
   * If the click handler throws an exception, the firefox driver freezes. This is suboptimal.
   */
  @JavascriptEnabled
  public void testShouldBeAbleToClickIfEvenSomethingHorribleHappens() {
    driver.get(pages.javascriptPage);

    driver.findElement(By.id("error")).click();

    // If we get this far then the test has passed, but let's do something basic to prove the point
    String text = driver.findElement(By.id("error")).getText();

    assertNotNull(text);
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  public void testShouldBeAbleToGetTheLocationOfAnElement() {
    driver.get(pages.javascriptPage);

    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    ((JavascriptExecutor) driver).executeScript("window.focus();");
    WebElement element = driver.findElement(By.id("keyUp"));

    if (!(element instanceof Locatable)) {
      return;
    }

    Point point = ((Locatable) element).getLocationOnScreenOnceScrolledIntoView();

    assertTrue(point.getX() > 1);
    assertTrue(point.getY() > 1);
  }
}
