/*
Copyright 2007-2009 Selenium committers
Portions copyright 2011 Software Freedom Conservancy

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

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.WaitingConditions.windowToBeSwitchedToWithName;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;

import org.hamcrest.Matchers;
import org.junit.Test;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;

/**
 * Test case for browsers that support using Javascript
 */
public class JavascriptEnabledDriverTest extends JUnit4TestBase {

  @JavascriptEnabled
  @Ignore(value = {ANDROID}, reason = "I'm not sure why this fails")
  @Test
  public void testDocumentShouldReflectLatestTitle() throws Exception {
    driver.get(pages.javascriptPage);

    assertThat(driver.getTitle(), equalTo("Testing Javascript"));
    driver.findElement(By.linkText("Change the page title!")).click();
    waitForTitleChange("Changed");
    assertThat(driver.getTitle(), equalTo("Changed"));
  }

  @JavascriptEnabled
  @Test
  @Ignore(MARIONETTE)
  public void testDocumentShouldReflectLatestDom() throws Exception {
    driver.get(pages.javascriptPage);
    String currentText = driver.findElement(By.xpath("//div[@id='dynamo']")).getText();
    assertThat(currentText, equalTo("What's for dinner?"));

    WebElement webElement = driver.findElement(By.linkText("Update a div"));
    webElement.click();

    WebElement dynamo = driver.findElement(By.xpath("//div[@id='dynamo']"));

    wait.until(elementTextToEqual(dynamo, "Fish and chips!"));
    assertThat(dynamo.getText(), equalTo("Fish and chips!"));
  }

  @JavascriptEnabled
  @Ignore(value = {IPHONE, ANDROID, MARIONETTE},
          reason = "iPhone: does not detect that a new page loaded.")
  @Test
  public void testShouldWaitForLoadsToCompleteAfterJavascriptCausesANewPageToLoad() {
    driver.get(pages.formPage);

    driver.findElement(By.id("changeme")).click();

    waitForTitleChange("Page3");
    assertThat(driver.getTitle(), equalTo("Page3"));
  }

  @JavascriptEnabled
  @Ignore(value = {IPHONE, ANDROID, MARIONETTE},
          reason = "iPhone: does not detect that a new page loaded.")
  @Test
  public void testShouldBeAbleToFindElementAfterJavascriptCausesANewPageToLoad() {
    driver.get(pages.formPage);

    driver.findElement(By.id("changeme")).click();

    waitForTitleChange("Page3");
    assertThat(driver.findElement(By.id("pageNumber")).getText(), equalTo("3"));
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToDetermineTheLocationOfAnElement() {
    driver.get(pages.xhtmlTestPage);

    WebElement element = driver.findElement(By.id("username"));
    Point location = element.getLocation();

    assertThat(location.getX() > 0, is(true));
    assertThat(location.getY() > 0, is(true));
  }

  @JavascriptEnabled
  @Ignore(value = {IPHONE},
          reason = "iPhone: sendKeys not implemented correctly")
  @Test
  public void testShouldFireOnChangeEventWhenSettingAnElementsValue() {
    driver.get(pages.javascriptPage);
    driver.findElement(By.id("change")).sendKeys("foo");
    String result = driver.findElement(By.id("result")).getText();

    assertThat(result, equalTo("change"));
  }

  @JavascriptEnabled
  @Ignore(ANDROID)
  @Test
  public void testShouldBeAbleToSubmitFormsByCausingTheOnClickEventToFire() {
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("jsSubmitButton"));
    element.click();

    waitForTitleChange("We Arrive Here");

    assertThat(driver.getTitle(), is("We Arrive Here"));
  }

  private void waitForTitleChange(String newTitle) {
    wait.until(titleIs(newTitle));
  }

  @JavascriptEnabled
  @Ignore(value = {ANDROID})
  @Test
  public void testShouldBeAbleToClickOnSubmitButtons() {
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("submittingButton"));
    element.click();

    waitForTitleChange("We Arrive Here");

    assertThat(driver.getTitle(), is("We Arrive Here"));
  }

  @JavascriptEnabled
  @Ignore(ANDROID)
  @Test
  public void testIssue80ClickShouldGenerateClickEvent() {
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("clickField"));
    assertEquals("Hello", element.getAttribute("value"));

    element.click();

    String elementValue = wait.until(elementValueToEqual(element, "Clicked"));

    assertEquals("Clicked", elementValue);
  }

  @JavascriptEnabled
  @Ignore(value = {IPHONE, ANDROID}, reason = "iPhone: focus doesn't change as expected")
  @Test
  public void testShouldBeAbleToSwitchToFocusedElement() {
    driver.get(pages.javascriptPage);

    driver.findElement(By.id("switchFocus")).click();

    WebElement element = driver.switchTo().activeElement();
    assertThat(element.getAttribute("id"), is("theworks"));
  }

  @JavascriptEnabled
  @Ignore({IPHONE})
  @Test
  public void testIfNoElementHasFocusTheActiveElementIsTheBody() {
    driver.get(pages.simpleTestPage);

    WebElement element = driver.switchTo().activeElement();

    assertThat(element.getAttribute("name"), is("body"));
  }

  @JavascriptEnabled
  @Ignore(value = {SAFARI, MARIONETTE}, reason = " Safari: issue 4061. Other platforms: not properly tested")
  @Test
  public void testChangeEventIsFiredAppropriatelyWhenFocusIsLost() {
    driver.get(pages.javascriptPage);

    WebElement input = driver.findElement(By.id("changeable"));
    input.sendKeys("test");
    moveFocus();
    assertThat(driver.findElement(By.id("result")).getText().trim(),
               Matchers.<String>either(is("focus change blur")).or(is("focus blur change")));

    input.sendKeys(Keys.BACK_SPACE, "t");
    moveFocus();

    // I weep.
    assertThat(driver.findElement(By.id("result")).getText().trim(),
               Matchers.<String>either(is("focus change blur focus blur"))
                   .or(is("focus blur change focus blur"))
                   .or(is("focus blur change focus blur change"))
                   .or(is("focus change blur focus change blur"))); // What Chrome does
  }

  /**
   * If the click handler throws an exception, the firefox driver freezes. This is suboptimal.
   */
  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToClickIfEvenSomethingHorribleHappens() {
    driver.get(pages.javascriptPage);

    driver.findElement(By.id("error")).click();

    // If we get this far then the test has passed, but let's do something basic to prove the point
    String text = driver.findElement(By.id("error")).getText();

    assertNotNull(text);
  }

  @JavascriptEnabled
  @Ignore({IPHONE, MARIONETTE})
  @Test
  public void testShouldBeAbleToGetTheLocationOfAnElement() {
    assumeTrue(driver instanceof JavascriptExecutor);

    driver.get(pages.javascriptPage);

    ((JavascriptExecutor) driver).executeScript("window.focus();");
    WebElement element = driver.findElement(By.id("keyUp"));

    assumeTrue(element instanceof Locatable);

    Point point = ((Locatable) element).getCoordinates().inViewPort();

    assertTrue(String.format("Non-positive X coordinates: %d", point.getX()),
               point.getX() > 1);
    // Element's Y coordinates can be 0, as the element is scrolled right to the top of the window.
    assertTrue(String.format("Negative Y coordinates: %d", point.getY()),
               point.getY() >= 0);
  }


  /*
   * There's a weird issue with this test, which means that I've added the needs fresh driver
   * annotation. To see it in action, try running the single test suite with only these tests
   * running: "ImplicitWaitTest", "TemporaryFilesystemTest", "JavascriptEnabledDriverTest".
   * SimonStewart 2010-10-04
   */
  @Ignore(value = {IPHONE, OPERA, SAFARI, MARIONETTE}, reason = "Safari: issue 3693")
  @JavascriptEnabled
  @NeedsFreshDriver
  @Test
  public void testShouldBeAbleToClickALinkThatClosesAWindow() throws Exception {
    driver.get(pages.javascriptPage);

    String handle = driver.getWindowHandle();
    driver.findElement(By.id("new_window")).click();

    // Depending on the Android emulator platform this can take a while.
    wait.until(windowToBeSwitchedToWithName("close_me"));

    driver.findElement(By.id("close")).click();

    driver.switchTo().window(handle);

    // If we haven't seen an exception or hung the test has passed
  }

  private void moveFocus() {
    driver.findElement(By.id("clickField")).click();
  }
}
