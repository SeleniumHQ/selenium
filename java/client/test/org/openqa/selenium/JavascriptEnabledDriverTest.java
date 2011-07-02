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

import org.hamcrest.Matchers;
import org.openqa.selenium.internal.Locatable;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.core.Is.is;
import static org.junit.matchers.JUnitMatchers.either;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.OPERA;
import static org.openqa.selenium.Ignore.Driver.REMOTE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;

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
    waitForTitleChange("Changed");
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

    WebElement dynamo = driver.findElement(By.xpath("//div[@id='dynamo']"));

    waitFor(elementTextToEqual(dynamo, "Fish and chips!"));
    assertThat(dynamo.getText(), equalTo("Fish and chips!"));
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
  @Ignore(value = {CHROME, IE, IPHONE, OPERA, SELENESE},
      reason = "iPhone: does not detect that a new page loaded.")
  public void testShouldWaitForLoadsToCompleteAfterJavascriptCausesANewPageToLoad() {
    driver.get(pages.formPage);

    driver.findElement(By.id("changeme")).click();

    waitForTitleChange("Page3");
    assertThat(driver.getTitle(), equalTo("Page3"));
  }

  @JavascriptEnabled
  @Ignore(value = {CHROME, IE, SELENESE, IPHONE, OPERA},
      reason = "iPhone: does not detect that a new page loaded.")
  public void testShouldBeAbleToFindElementAfterJavascriptCausesANewPageToLoad() {
    driver.get(pages.formPage);

    driver.findElement(By.id("changeme")).click();

    waitForTitleChange("Page3");
    assertThat(driver.findElement(By.id("pageNumber")).getText(), equalTo("3"));
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  public void testShouldBeAbleToDetermineTheLocationOfAnElement() {
    driver.get(pages.xhtmlTestPage);

    WebElement element = driver.findElement(By.id("username"));
    Point location = element.getLocation();

    assertThat(location.getX() > 0, is(true));
    assertThat(location.getY() > 0, is(true));
  }

  @JavascriptEnabled
  public void testShouldBeAbleToDetermineTheSizeOfAnElement() {
    driver.get(pages.xhtmlTestPage);

    WebElement element = driver.findElement(By.id("username"));
    Dimension size = element.getSize();

    assertThat(size.getWidth() > 0, is(true));
    assertThat(size.getHeight() > 0, is(true));
  }

  @JavascriptEnabled
  @Ignore(value = {IPHONE, OPERA},
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

    waitForTitleChange("We Arrive Here");

    assertThat(driver.getTitle(), Matchers.is("We Arrive Here"));
  }

  private void waitForTitleChange(String newTitle) {
    waitFor(WaitingConditions.pageTitleToBe(driver, newTitle));
  }

  @JavascriptEnabled
  @Ignore(value = IE, reason = "Fails for IE in the continuous build")
  public void testShouldBeAbleToClickOnSubmitButtons() {
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("submittingButton"));
    element.click();

    waitForTitleChange("We Arrive Here");

    assertThat(driver.getTitle(), Matchers.is("We Arrive Here"));
  }

  @JavascriptEnabled
  public void testIssue80ClickShouldGenerateClickEvent() {
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("clickField"));
    assertEquals("Hello", element.getAttribute("value"));

    element.click();

    String elementValue = waitFor(elementValueToEqual(element, "Clicked"));

    assertEquals("Clicked", elementValue);
  }

  @JavascriptEnabled
  @Ignore(value = {IPHONE}, reason = "iPhone: focus doesn't change as expected")
  public void testShouldBeAbleToSwitchToFocusedElement() {
    driver.get(pages.javascriptPage);

    driver.findElement(By.id("switchFocus")).click();

    WebElement element = driver.switchTo().activeElement();
    assertThat(element.getAttribute("id"), is("theworks"));
  }

  @JavascriptEnabled
  @Ignore({IPHONE})
  public void testIfNoElementHasFocusTheActiveElementIsTheBody() {
    driver.get(pages.simpleTestPage);

    WebElement element = driver.switchTo().activeElement();

    assertThat(element.getAttribute("name"), is("body"));
  }

  @JavascriptEnabled
  @Ignore(value = {IE, FIREFOX, OPERA, REMOTE, SELENESE},
          reason = "Firefox: Window demands focus to work. Other platforms: not properly tested")
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
  @Ignore({IPHONE, SELENESE})
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


  /*
   * There's a weird issue with this test, which means that I've added the needs
   * fresh driver annotation. To see it in action, try running the single test
   * suite with only these tests running: "ImplicitWaitTest",
   * "TemporaryFilesystemTest", "JavascriptEnabledDriverTest".
   * SimonStewart 2010-10-04
   */
  @Ignore({IE, SELENESE, IPHONE, OPERA})
  @JavascriptEnabled
  @NeedsFreshDriver
  public void testShouldBeAbleToClickALinkThatClosesAWindow() throws Exception {
    driver.get(pages.javascriptPage);

    String handle = driver.getWindowHandle();
    driver.findElement(By.id("new_window")).click();

    driver.switchTo().window("close_me");

    driver.findElement(By.id("close")).click();

    driver.switchTo().window(handle);

    // If we haven't seen an exception or hung the test has passed
  }
}
