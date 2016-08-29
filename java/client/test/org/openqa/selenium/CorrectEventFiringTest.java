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
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.junit.Assume.assumeFalse;
import static org.openqa.selenium.WaitingConditions.elementTextToContain;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfElementLocated;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.FIREFOX;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.SAFARI;
import static org.openqa.selenium.testing.TestUtilities.isOldIe;

import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.SauceDriver;

import java.io.File;
import java.io.IOException;
import java.util.List;

public class CorrectEventFiringTest extends JUnit4TestBase {

  @JavascriptEnabled
  @Test
  public void testShouldFireFocusEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("focus");
  }

  @JavascriptEnabled
  @Test
  public void testShouldFireClickEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("click");
  }

  @JavascriptEnabled
  @Test
  public void testShouldFireMouseDownEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("mousedown");
  }

  @JavascriptEnabled
  @Test
  public void testShouldFireMouseUpEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("mouseup");
  }

  @JavascriptEnabled
  @Test
  public void testShouldFireMouseOverEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("mouseover");
  }

  // TODO: this is a bad test: mousemove should not fire in a perfect click (e.g. mouse did not move
  // while doing down, up, click
  @JavascriptEnabled
  @Test
  @Ignore(MARIONETTE)
  public void testShouldFireMouseMoveEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("mousemove");
  }

  @JavascriptEnabled
  @Test
  public void testShouldNotThrowIfEventHandlerThrows() {
    driver.get(pages.javascriptPage);

    try {
      driver.findElement(By.id("throwing-mouseover")).click();
    } catch (WebDriverException e) {
      fail("Error in event handler should not have propagated: " + e);
    }
  }

  @JavascriptEnabled
  @Test
  public void testShouldFireEventsInTheRightOrder() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    String text = driver.findElement(By.id("result")).getText();

    int lastIndex = -1;
    for (String event : new String[] {"mousedown", "focus", "mouseup", "click"}) {
      int index = text.indexOf(event);

      assertTrue(event + " did not fire at all", index != -1);
      assertTrue(event + " did not fire in the correct order", index > lastIndex);
      lastIndex = index;
    }
  }

  @JavascriptEnabled
  @Test
  public void testsShouldIssueMouseDownEvents() {
    driver.get(pages.javascriptPage);
    driver.findElement(By.id("mousedown")).click();

    assertEventFired("mouse down");
    String result = driver.findElement(By.id("result")).getText();
    assertThat(result, equalTo("mouse down"));
  }

  @JavascriptEnabled
  @Test
  public void testShouldIssueClickEvents() {
    driver.get(pages.javascriptPage);
    driver.findElement(By.id("mouseclick")).click();

    WebElement result = driver.findElement(By.id("result"));
    wait.until(elementTextToEqual(result, "mouse click"));
    assertThat(result.getText(), equalTo("mouse click"));
  }

  @JavascriptEnabled
  @Test
  public void testShouldIssueMouseUpEvents() {
    driver.get(pages.javascriptPage);
    driver.findElement(By.id("mouseup")).click();

    WebElement result = driver.findElement(By.id("result"));
    wait.until(elementTextToEqual(result, "mouse up"));
    assertThat(result.getText(), equalTo("mouse up"));
  }

  @JavascriptEnabled
  @Test
  public void testMouseEventsShouldBubbleUpToContainingElements() {
    driver.get(pages.javascriptPage);
    driver.findElement(By.id("child")).click();

    WebElement result = driver.findElement(By.id("result"));
    wait.until(elementTextToEqual(result, "mouse down"));
    assertThat(result.getText(), equalTo("mouse down"));
  }

  @JavascriptEnabled
  @Ignore(value = {MARIONETTE})
  @Test
  public void testShouldEmitOnChangeEventsWhenSelectingElements() {
    driver.get(pages.javascriptPage);
    // Intentionally not looking up the select tag. See selenium r7937 for details.
    List<WebElement> allOptions = driver.findElements(By.xpath("//select[@id='selector']//option"));

    String initialTextValue = driver.findElement(By.id("result")).getText();

    WebElement foo = allOptions.get(0);
    WebElement bar = allOptions.get(1);

    foo.click();
    assertThat(driver.findElement(By.id("result")).getText(),
               equalTo(initialTextValue));
    bar.click();
    assertThat(driver.findElement(By.id("result")).getText(),
        equalTo("bar"));
  }

  @JavascriptEnabled
  @Ignore(MARIONETTE)
  @Test
  public void testShouldEmitOnClickEventsWhenSelectingElements() {
    driver.get(pages.javascriptPage);
    // Intentionally not looking up the select tag. See selenium r7937 for details.
    List<WebElement> allOptions = driver.findElements(By.xpath("//select[@id='selector2']//option"));

    WebElement foo = allOptions.get(0);
    WebElement bar = allOptions.get(1);

    foo.click();
    assertThat(driver.findElement(By.id("result")).getText(),
               equalTo("foo"));
    bar.click();
    assertThat(driver.findElement(By.id("result")).getText(),
               equalTo("bar"));
  }

  @JavascriptEnabled
  @Ignore(value = {IE, HTMLUNIT},
      reason = "IE: Only fires the onchange event when the checkbox loses the focus, "
             + "HtmlUnit: default mode is IE8 now")
  @Test
  public void testShouldEmitOnChangeEventsWhenChangingTheStateOfACheckbox() {
    driver.get(pages.javascriptPage);
    WebElement checkbox = driver.findElement(By.id("checkbox"));

    checkbox.click();
    WebElement result = driver.findElement(By.id("result"));
    wait.until(elementTextToEqual(result, "checkbox thing"));
  }

  @JavascriptEnabled
  @Test
  public void testShouldEmitClickEventWhenClickingOnATextInputElement() {
    driver.get(pages.javascriptPage);

    WebElement clicker = driver.findElement(By.id("clickField"));
    clicker.click();

    wait.until(elementValueToEqual(clicker, "Clicked"));
    assertThat(clicker.getAttribute("value"), equalTo("Clicked"));
  }

  @JavascriptEnabled
  @Test
  public void testShouldFireTwoClickEventsWhenClickingOnALabel() {
    driver.get(pages.javascriptPage);

    driver.findElement(By.id("labelForCheckbox")).click();

    WebElement result = driver.findElement(By.id("result"));
    assertNotNull(wait.until(elementTextToContain(result, "labelclick chboxclick")));
  }

  @JavascriptEnabled
  @Test
  public void testClearingAnElementShouldCauseTheOnChangeHandlerToFire() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("clearMe"));
    element.clear();

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText(), equalTo("Cleared"));
  }

  @JavascriptEnabled
  @Test
  public void testSendingKeysToAnotherElementShouldCauseTheBlurEventToFire() {
    assumeFalse(browserNeedsFocusOnThisOs(driver));

    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("theworks"));
    element.sendKeys("foo");
    WebElement element2 = driver.findElement(By.id("changeable"));
    element2.sendKeys("bar");
    assertEventFired("blur");
  }

  @JavascriptEnabled
  @Test
  public void testSendingKeysToAnElementShouldCauseTheFocusEventToFire() {
    assumeFalse(browserNeedsFocusOnThisOs(driver));

    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("theworks"));
    element.sendKeys("foo");
    assertEventFired("focus");
  }

  @JavascriptEnabled
  @Test
  public void testSendingKeysToAFocusedElementShouldNotBlurThatElement() {
    assumeFalse(browserNeedsFocusOnThisOs(driver));

    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("theworks"));
    element.click();

    // Wait until focused
    boolean focused = false;
    WebElement result = driver.findElement(By.id("result"));
    for (int i = 0; i < 5; ++i) {
      String fired = result.getText();
      if (fired.contains("focus")) {
        focused = true;
        break;
      }
      try {
        Thread.sleep(200);
      } catch (InterruptedException e) {
        throw new RuntimeException(e);
      }
    }
    if (!focused) {
      fail("Clicking on element didn't focus it in time - can't proceed so failing");
    }

    element.sendKeys("a");
    assertEventNotFired("blur");
  }

  @JavascriptEnabled
  @Ignore(value = {SAFARI, HTMLUNIT})
  @Test
  public void testClickingAnUnfocusableChildShouldNotBlurTheParent() {
    assumeFalse(isOldIe(driver));
    driver.get(pages.javascriptPage);
    // Click on parent, giving it the focus.
    WebElement parent = driver.findElement(By.id("hideOnBlur"));
    parent.click();
    assertEventNotFired("blur");
    // Click on child. It is not focusable, so focus should stay on the parent.
    driver.findElement(By.id("hideOnBlurChild")).click();
    assertTrue("#hideOnBlur should still be displayed after click",
               parent.isDisplayed());
    assertEventNotFired("blur");
    // Click elsewhere, and let the element disappear.
    driver.findElement(By.id("result")).click();
    assertEventFired("blur");
  }

  @JavascriptEnabled
  @Test
  public void testSubmittingFormFromFormElementShouldFireOnSubmitForThatForm() {
    driver.get(pages.javascriptPage);
    WebElement formElement = driver.findElement(By.id("submitListeningForm"));
    formElement.submit();
    assertEventFired("form-onsubmit");
  }

  @JavascriptEnabled
  @Test
  public void testSubmittingFormFromFormInputSubmitElementShouldFireOnSubmitForThatForm() {
    driver.get(pages.javascriptPage);
    WebElement submit = driver.findElement(By.id("submitListeningForm-submit"));
    submit.submit();
    assertEventFired("form-onsubmit");
  }

  @JavascriptEnabled
  @Test
  public void testSubmittingFormFromFormInputTextElementShouldFireOnSubmitForThatFormAndNotClickOnThatInput() {
    driver.get(pages.javascriptPage);
    WebElement submit = driver.findElement(By.id("submitListeningForm-submit"));
    submit.submit();
    assertEventFired("form-onsubmit");
    assertEventNotFired("text-onclick");
  }

  @JavascriptEnabled
  @Ignore(value = {SAFARI, MARIONETTE},
      reason = "Does not yet support file uploads", issues = {4220})
  @Test
  public void testUploadingFileShouldFireOnChangeEvent() throws IOException {
    driver.get(pages.formPage);
    WebElement uploadElement = driver.findElement(By.id("upload"));
    WebElement result = driver.findElement(By.id("fileResults"));
    assertThat(result.getText(), equalTo(""));

    File file = File.createTempFile("test", "txt");
    file.deleteOnExit();

    uploadElement.sendKeys(file.getAbsolutePath());
    // Shift focus to something else because send key doesn't make the focus leave
    driver.findElement(By.id("id-name1")).click();

    assertThat(result.getText(), equalTo("changed"));
  }

  private String getTextFromElementOnceAvailable(String elementId) {
    return wait.until(visibilityOfElementLocated(By.id(elementId))).getText();
  }

  @JavascriptEnabled
  @Test
  public void testShouldReportTheXAndYCoordinatesWhenClicking() {
    assumeFalse("Skipping test which fails in IE on Sauce",
                SauceDriver.shouldUseSauce() && TestUtilities.isInternetExplorer(driver));

    driver.get(pages.clickEventPage);

    WebElement element = driver.findElement(By.id("eventish"));
    element.click();

    String clientX = getTextFromElementOnceAvailable("clientX");
    String clientY = getTextFromElementOnceAvailable("clientY");

    assertThat(clientX, not(equalTo("0")));
    assertThat(clientY, not(equalTo("0")));
  }

  @JavascriptEnabled
  @Ignore(value = {MARIONETTE})
  @Test
  public void testClickEventsShouldBubble() {
    driver.get(pages.clicksPage);
    driver.findElement(By.id("bubblesFrom")).click();
    boolean eventBubbled = (Boolean)((JavascriptExecutor)driver).executeScript("return !!window.bubbledClick;");
    assertTrue("Event didn't bubble up", eventBubbled);
  }

  @JavascriptEnabled
  @Ignore(value = {IE, MARIONETTE, SAFARI, HTMLUNIT})
  @Test
  public void testClickOverlappingElements() {
    assumeFalse(isOldIe(driver));
    driver.get(appServer.whereIs("click_tests/overlapping_elements.html"));
    try {
      driver.findElement(By.id("under")).click();
    } catch (WebDriverException expected) {
      if (expected.getMessage().contains("Other element would receive the click")) {
        return;
      }
      expected.printStackTrace();
    }
    fail("Should have thrown Exception with 'Other element would receive the click' in the message");
  }

  @JavascriptEnabled
  @Ignore(value = {CHROME, IE, MARIONETTE, SAFARI, HTMLUNIT})
  @Test
  public void testClickPartiallyOverlappingElements() {
    assumeFalse(isOldIe(driver));
    for (int i = 1; i < 6; i++) {
      driver.get(appServer.whereIs("click_tests/partially_overlapping_elements.html"));
      WebElement over = driver.findElement(By.id("over" + i));
      ((JavascriptExecutor) driver).executeScript("arguments[0].style.display = 'none'", over);
      driver.findElement(By.id("under")).click();
      assertEquals(driver.findElement(By.id("log")).getText(),
                   "Log:\n"
                   + "mousedown in under (handled by under)\n"
                   + "mousedown in under (handled by body)\n"
                   + "mouseup in under (handled by under)\n"
                   + "mouseup in under (handled by body)\n"
                   + "click in under (handled by under)\n"
                   + "click in under (handled by body)");
    }
  }

  @JavascriptEnabled
  @Ignore(value = {CHROME, FIREFOX, SAFARI, HTMLUNIT})
  @Test
  public void testNativelyClickOverlappingElements() {
    assumeFalse(isOldIe(driver));
    driver.get(appServer.whereIs("click_tests/overlapping_elements.html"));
    driver.findElement(By.id("under")).click();
    assertEquals(driver.findElement(By.id("log")).getText(),
                 "Log:\n"
                 + "mousedown in over (handled by over)\n"
                 + "mousedown in over (handled by body)\n"
                 + "mouseup in over (handled by over)\n"
                 + "mouseup in over (handled by body)\n"
                 + "click in over (handled by over)\n"
                 + "click in over (handled by body)");
  }

  @JavascriptEnabled
  @Ignore(value = {SAFARI, HTMLUNIT})
  @Test
  public void testClickAnElementThatDisappear() {
    assumeFalse(isOldIe(driver));
    driver.get(appServer.whereIs("click_tests/disappearing_element.html"));
    driver.findElement(By.id("over")).click();
    assertThat(driver.findElement(By.id("log")).getText(),
               startsWith("Log:\n"
                          + "mousedown in over (handled by over)\n"
                          + "mousedown in over (handled by body)\n"
                          + "mouseup in under (handled by under)\n"
                          + "mouseup in under (handled by body)"));
  }

  private void clickOnElementWhichRecordsEvents() {
    driver.findElement(By.id("plainButton")).click();
  }

  private void assertEventFired(String eventName) {
    WebElement result = driver.findElement(By.id("result"));

    String text = wait.until(elementTextToContain(result, eventName));
    boolean conditionMet = text.contains(eventName);

    assertTrue("No " + eventName + " fired: " + text, conditionMet);
  }

  private void assertEventNotFired(String eventName) {
    WebElement result = driver.findElement(By.id("result"));
    String text = result.getText();
    assertFalse(eventName + " fired: " + text, text.contains(eventName));
  }

  private boolean browserNeedsFocusOnThisOs(WebDriver driver) {
    // No browser yet demands focus on windows
    if (TestUtilities.getEffectivePlatform().is(Platform.WINDOWS))
      return false;

    if (Boolean.getBoolean("webdriver.focus.override")) {
      return false;
    }

    String browserName = getBrowserName(driver);
    return browserName.toLowerCase().contains("firefox");
  }

  private String getBrowserName(WebDriver driver) {
    if (driver instanceof HasCapabilities) {
      return ((HasCapabilities) driver).getCapabilities().getBrowserName();
    }

    return driver.getClass().getName();
  }
}
