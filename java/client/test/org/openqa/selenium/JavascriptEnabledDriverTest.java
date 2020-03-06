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
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.WaitingConditions.windowToBeSwitchedToWithName;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_JAVASCRIPT;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.Test;
import org.openqa.selenium.interactions.Locatable;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NotYetImplemented;

public class JavascriptEnabledDriverTest extends JUnit4TestBase {

  @Test
  public void testDocumentShouldReflectLatestTitle() {
    driver.get(pages.javascriptPage);

    assertThat(driver.getTitle()).isEqualTo("Testing Javascript");
    driver.findElement(By.linkText("Change the page title!")).click();
    waitForTitleChange("Changed");
    assertThat(driver.getTitle()).isEqualTo("Changed");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testDocumentShouldReflectLatestDom() {
    driver.get(pages.javascriptPage);
    String currentText = driver.findElement(By.xpath("//div[@id='dynamo']")).getText();
    assertThat(currentText).isEqualTo("What's for dinner?");

    WebElement webElement = driver.findElement(By.linkText("Update a div"));
    webElement.click();

    WebElement dynamo = driver.findElement(By.xpath("//div[@id='dynamo']"));

    wait.until(elementTextToEqual(dynamo, "Fish and chips!"));
    assertThat(dynamo.getText()).isEqualTo("Fish and chips!");
  }

  @Test
  public void testShouldWaitForLoadsToCompleteAfterJavascriptCausesANewPageToLoad() {
    driver.get(pages.formPage);

    driver.findElement(By.id("changeme")).click();

    waitForTitleChange("Page3");
    assertThat(driver.getTitle()).isEqualTo("Page3");
  }

  @Test
  public void testShouldBeAbleToFindElementAfterJavascriptCausesANewPageToLoad() {
    driver.get(pages.formPage);

    driver.findElement(By.id("changeme")).click();

    waitForTitleChange("Page3");
    assertThat(driver.findElement(By.id("pageNumber")).getText()).isEqualTo("3");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldFireOnChangeEventWhenSettingAnElementsValue() {
    driver.get(pages.javascriptPage);
    driver.findElement(By.id("change")).sendKeys("foo");
    String result = driver.findElement(By.id("result")).getText();

    assertThat(result).isEqualTo("change");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldBeAbleToSubmitFormsByCausingTheOnClickEventToFire() {
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("jsSubmitButton"));
    element.click();

    waitForTitleChange("We Arrive Here");

    assertThat(driver.getTitle()).isEqualTo("We Arrive Here");
  }

  private void waitForTitleChange(String newTitle) {
    wait.until(titleIs(newTitle));
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldBeAbleToClickOnSubmitButtons() {
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("submittingButton"));
    element.click();

    waitForTitleChange("We Arrive Here");

    assertThat(driver.getTitle()).isEqualTo("We Arrive Here");
  }

  @Test
  public void testIssue80ClickShouldGenerateClickEvent() {
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("clickField"));
    assertThat(element.getAttribute("value")).isEqualTo("Hello");

    element.click();

    String elementValue = wait.until(elementValueToEqual(element, "Clicked"));

    assertThat(elementValue).isEqualTo("Clicked");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldBeAbleToSwitchToFocusedElement() {
    driver.get(pages.javascriptPage);

    driver.findElement(By.id("switchFocus")).click();

    WebElement element = driver.switchTo().activeElement();
    assertThat(element.getAttribute("id")).isEqualTo("theworks");
  }

  @Test
  public void testIfNoElementHasFocusTheActiveElementIsTheBody() {
    driver.get(pages.simpleTestPage);

    WebElement element = driver.switchTo().activeElement();

    assertThat(element.getAttribute("name")).isEqualTo("body");
  }

  @Test
  @NotYetImplemented(value = SAFARI)
  public void testChangeEventIsFiredAppropriatelyWhenFocusIsLost() {
    driver.get(pages.javascriptPage);

    WebElement input = driver.findElement(By.id("changeable"));
    input.sendKeys("test");
    moveFocus();
    assertThat(driver.findElement(By.id("result")).getText().trim())
        .isIn("focus change blur", "focus blur change");

    input.sendKeys(Keys.BACK_SPACE, "t");
    moveFocus();

    // I weep.
    assertThat(driver.findElement(By.id("result")).getText().trim())
        .isIn("focus change blur focus blur", "focus blur change focus blur",
              "focus blur change focus blur change", "focus change blur focus change blur");
  }

  /**
   * If the click handler throws an exception, the firefox driver freezes. This is suboptimal.
   */
  @Test
  public void testShouldBeAbleToClickIfEvenSomethingHorribleHappens() {
    driver.get(pages.javascriptPage);

    driver.findElement(By.id("error")).click();

    // If we get this far then the test has passed, but let's do something basic to prove the point
    String text = driver.findElement(By.id("error")).getText();
    assertThat(text).isNotNull();
  }

  @Test
  public void testShouldBeAbleToGetTheLocationOfAnElement() {
    assumeTrue(driver instanceof JavascriptExecutor);
    assumeTrue(((HasCapabilities) driver).getCapabilities().is(SUPPORTS_JAVASCRIPT));

    driver.get(pages.javascriptPage);

    ((JavascriptExecutor) driver).executeScript("window.focus();");
    WebElement element = driver.findElement(By.id("keyUp"));

    assumeTrue(element instanceof Locatable);

    Point point = ((Locatable) element).getCoordinates().inViewPort();

    assertThat(point.getX()).as("X coordinate").isGreaterThan(1);
    // Element's Y coordinates can be 0, as the element is scrolled right to the top of the window.
    assertThat(point.getY()).as("Y coordinate").isGreaterThanOrEqualTo(0);
  }


  /*
   * There's a weird issue with this test, which means that I've added the needs fresh driver
   * annotation. To see it in action, try running the single test suite with only these tests
   * running: "ImplicitWaitTest", "TemporaryFilesystemTest", "JavascriptEnabledDriverTest".
   * SimonStewart 2010-10-04
   */
  @NoDriverAfterTest
  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldBeAbleToClickALinkThatClosesAWindow() {
    driver.get(pages.javascriptPage);

    String handle = driver.getWindowHandle();
    driver.findElement(By.id("new_window")).click();

    // Depending on the Android emulator platform this can take a while.
    wait.until(windowToBeSwitchedToWithName("close_me"));

    wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("close")));
    driver.findElement(By.id("close")).click();

    driver.switchTo().window(handle);

    // If we haven't seen an exception or hung the test has passed
  }

  private void moveFocus() {
    driver.findElement(By.id("clickField")).click();
  }
}
