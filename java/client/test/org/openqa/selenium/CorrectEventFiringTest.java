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

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.instanceOf;
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
import static org.openqa.selenium.testing.TestUtilities.catchThrowable;
import static org.openqa.selenium.testing.TestUtilities.isOldIe;

import org.junit.Test;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.SauceDriver;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.File;
import java.io.IOException;
import java.util.List;

public class CorrectEventFiringTest extends JUnit4TestBase {

  @Test
  public void testShouldFireFocusEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents(driver);

    assertEventFired("focus", driver);
  }

  @Test
  @Ignore(value = MARIONETTE, issue = "https://github.com/mozilla/geckodriver/issues/906")
  @Ignore(FIREFOX)
  public void testShouldFireFocusEventInNonTopmostWindow() {
    WebDriver driver2 = new WebDriverBuilder().get();
    try {
      // topmost
      driver2.get(pages.javascriptPage);
      clickOnElementWhichRecordsEvents(driver2);
      assertEventFired("focus", driver2);

      // non-topmost
      driver.get(pages.javascriptPage);
      clickOnElementWhichRecordsEvents(driver);
      assertEventFired("focus", driver);

    } finally {
      driver2.quit();
    }
  }

  @Test
  public void testShouldFireClickEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents(driver);

    assertEventFired("click", driver);
  }

  @Test
  public void testShouldFireMouseDownEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents(driver);

    assertEventFired("mousedown", driver);
  }

  @Test
  public void testShouldFireMouseUpEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents(driver);

    assertEventFired("mouseup", driver);
  }

  @Test
  public void testShouldFireMouseOverEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents(driver);

    assertEventFired("mouseover", driver);
  }

  /**
   * This isn't quite right. We just loaded the page, and the native mouse is assumed to be at 0,0
   * (or the last location the mouse was in) In order to click the element, the mouse will have to
   * move towards it.
   */
  @Test
  @Ignore(MARIONETTE)
  public void testShouldFireMouseMoveEventWhenClicking() {
    driver.get(pages.simpleTestPage);
    // Move the mouse cursor to somewhere pretty far down the page
    new Actions(driver).moveToElement(driver.findElement(By.id("span"))).perform();

    driver.get(pages.javascriptPage);
    clickOnElementWhichRecordsEvents(driver);

    assertEventFired("mousemove", driver);
  }

  @Test
  public void testShouldNotThrowIfEventHandlerThrows() {
    driver.get(pages.javascriptPage);

    try {
      driver.findElement(By.id("throwing-mouseover")).click();
    } catch (WebDriverException e) {
      fail("Error in event handler should not have propagated: " + e);
    }
  }

  @Test
  public void testShouldFireEventsInTheRightOrder() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents(driver);

    String text = driver.findElement(By.id("result")).getText();

    int lastIndex = -1;
    for (String event : new String[] {"mousedown", "focus", "mouseup", "click"}) {
      int index = text.indexOf(event);

      assertTrue(event + " did not fire at all", index != -1);
      assertTrue(event + " did not fire in the correct order", index > lastIndex);
      lastIndex = index;
    }
  }

  @Test
  public void testsShouldIssueMouseDownEvents() {
    driver.get(pages.javascriptPage);
    driver.findElement(By.id("mousedown")).click();

    assertEventFired("mouse down", driver);
    String result = driver.findElement(By.id("result")).getText();
    assertThat(result, equalTo("mouse down"));
  }

  @Test
  public void testShouldIssueClickEvents() {
    driver.get(pages.javascriptPage);
    driver.findElement(By.id("mouseclick")).click();

    WebElement result = driver.findElement(By.id("result"));
    wait.until(elementTextToEqual(result, "mouse click"));
    assertThat(result.getText(), equalTo("mouse click"));
  }

  @Test
  public void testShouldIssueMouseUpEvents() {
    driver.get(pages.javascriptPage);
    driver.findElement(By.id("mouseup")).click();

    WebElement result = driver.findElement(By.id("result"));
    wait.until(elementTextToEqual(result, "mouse up"));
    assertThat(result.getText(), equalTo("mouse up"));
  }

  @Test
  public void testMouseEventsShouldBubbleUpToContainingElements() {
    driver.get(pages.javascriptPage);
    driver.findElement(By.id("child")).click();

    WebElement result = driver.findElement(By.id("result"));
    wait.until(elementTextToEqual(result, "mouse down"));
    assertThat(result.getText(), equalTo("mouse down"));
  }

  @Test
  @Ignore(MARIONETTE)
  public void testShouldEmitOnChangeEventsWhenSelectingElements() {
    driver.get(pages.javascriptPage);
    // Intentionally not looking up the select tag. See selenium r7937 for details.
    List<WebElement> allOptions = driver.findElements(By.xpath("//select[@id='selector']//option"));

    String initialTextValue = driver.findElement(By.id("result")).getText();

    WebElement foo = allOptions.get(0);
    WebElement bar = allOptions.get(1);

    foo.click();
    assertThat(driver.findElement(By.id("result")).getText(), equalTo(initialTextValue));
    bar.click();
    assertThat(driver.findElement(By.id("result")).getText(), equalTo("bar"));
  }

  @Test
  public void testShouldEmitOnClickEventsWhenSelectingElements() {
    driver.get(pages.javascriptPage);
    // Intentionally not looking up the select tag. See selenium r7937 for details.
    List<WebElement> allOptions = driver.findElements(By.xpath("//select[@id='selector2']//option"));

    WebElement foo = allOptions.get(0);
    WebElement bar = allOptions.get(1);

    foo.click();
    assertThat(driver.findElement(By.id("result")).getText(), equalTo("foo"));
    bar.click();
    assertThat(driver.findElement(By.id("result")).getText(), equalTo("bar"));
  }

  @Test
  @Ignore(value = IE, reason = "Only fires the onchange event when the checkbox loses the focus")
  public void testShouldEmitOnChangeEventsWhenChangingTheStateOfACheckbox() {
    driver.get(pages.javascriptPage);
    WebElement checkbox = driver.findElement(By.id("checkbox"));

    checkbox.click();
    WebElement result = driver.findElement(By.id("result"));
    wait.until(elementTextToEqual(result, "checkbox thing"));
  }

  @Test
  public void testShouldEmitClickEventWhenClickingOnATextInputElement() {
    driver.get(pages.javascriptPage);

    WebElement clicker = driver.findElement(By.id("clickField"));
    clicker.click();

    wait.until(elementValueToEqual(clicker, "Clicked"));
    assertThat(clicker.getAttribute("value"), equalTo("Clicked"));
  }

  @Test
  public void testShouldFireTwoClickEventsWhenClickingOnALabel() {
    driver.get(pages.javascriptPage);

    driver.findElement(By.id("labelForCheckbox")).click();

    WebElement result = driver.findElement(By.id("result"));
    assertNotNull(wait.until(elementTextToContain(result, "labelclick chboxclick")));
  }

  @Test
  public void testClearingAnElementShouldCauseTheOnChangeHandlerToFire() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("clearMe"));
    element.clear();

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText(), equalTo("Cleared"));
  }

  @Test
  public void testSendingKeysToAnotherElementShouldCauseTheBlurEventToFire() {
    assumeFalse(browserNeedsFocusOnThisOs(driver));

    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("theworks"));
    element.sendKeys("foo");
    WebElement element2 = driver.findElement(By.id("changeable"));
    element2.sendKeys("bar");
    assertEventFired("blur", driver);
  }

  @Test
  @Ignore(value = MARIONETTE, issue = "https://github.com/mozilla/geckodriver/issues/906")
  public void testSendingKeysToAnotherElementShouldCauseTheBlurEventToFireInNonTopmostWindow() {
    assumeFalse(browserNeedsFocusOnThisOs(driver));

    WebDriver driver2 = new WebDriverBuilder().get();
    try {
      // topmost
      driver2.get(pages.javascriptPage);
      WebElement element = driver2.findElement(By.id("theworks"));
      element.sendKeys("foo");
      WebElement element2 = driver2.findElement(By.id("changeable"));
      element2.sendKeys("bar");
      assertEventFired("blur", driver2);

      // non-topmost
      driver.get(pages.javascriptPage);
      element = driver.findElement(By.id("theworks"));
      element.sendKeys("foo");
      element2 = driver.findElement(By.id("changeable"));
      element2.sendKeys("bar");
      assertEventFired("blur", driver);

    } finally {
      driver2.quit();
    }

    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("theworks"));
    element.sendKeys("foo");
    WebElement element2 = driver.findElement(By.id("changeable"));
    element2.sendKeys("bar");
    assertEventFired("blur", driver);
  }

  @Test
  public void testSendingKeysToAnElementShouldCauseTheFocusEventToFire() {
    assumeFalse(browserNeedsFocusOnThisOs(driver));

    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("theworks"));
    element.sendKeys("foo");
    assertEventFired("focus", driver);
  }

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
    assertEventNotFired("blur", driver);
  }

  @Test
  @Ignore(SAFARI)
  @NotYetImplemented(HTMLUNIT)
  public void testClickingAnUnfocusableChildShouldNotBlurTheParent() {
    assumeFalse(isOldIe(driver));
    driver.get(pages.javascriptPage);
    // Click on parent, giving it the focus.
    WebElement parent = driver.findElement(By.id("hideOnBlur"));
    parent.click();
    assertEventNotFired("blur", driver);
    // Click on child. It is not focusable, so focus should stay on the parent.
    driver.findElement(By.id("hideOnBlurChild")).click();
    assertTrue("#hideOnBlur should still be displayed after click",
               parent.isDisplayed());
    assertEventNotFired("blur", driver);
    // Click elsewhere, and let the element disappear.
    driver.findElement(By.id("result")).click();
    assertEventFired("blur", driver);
  }

  @Test
  public void testSubmittingFormFromFormElementShouldFireOnSubmitForThatForm() {
    driver.get(pages.javascriptPage);
    WebElement formElement = driver.findElement(By.id("submitListeningForm"));
    formElement.submit();
    assertEventFired("form-onsubmit", driver);
  }

  @Test
  public void testSubmittingFormFromFormInputSubmitElementShouldFireOnSubmitForThatForm() {
    driver.get(pages.javascriptPage);
    WebElement submit = driver.findElement(By.id("submitListeningForm-submit"));
    submit.submit();
    assertEventFired("form-onsubmit", driver);
  }

  @Test
  public void testSubmittingFormFromFormInputTextElementShouldFireOnSubmitForThatFormAndNotClickOnThatInput() {
    driver.get(pages.javascriptPage);
    WebElement submit = driver.findElement(By.id("submitListeningForm-submit"));
    submit.submit();
    assertEventFired("form-onsubmit", driver);
    assertEventNotFired("text-onclick", driver);
  }

  @Test
  @Ignore(value = SAFARI, reason = "Does not yet support file uploads, issue 4220")
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

  @Test
  public void testClickEventsShouldBubble() {
    driver.get(pages.clicksPage);
    driver.findElement(By.id("bubblesFrom")).click();
    boolean eventBubbled = (Boolean)((JavascriptExecutor)driver).executeScript("return !!window.bubbledClick;");
    assertTrue("Event didn't bubble up", eventBubbled);
  }

  @Test
  @Ignore(IE)
  @Ignore(MARIONETTE)
  @Ignore(SAFARI)
  @Ignore(HTMLUNIT)
  public void testClickOverlappingElements() {
    assumeFalse(isOldIe(driver));
    driver.get(appServer.whereIs("click_tests/overlapping_elements.html"));
    WebElement element = driver.findElement(By.id("under"));
    Throwable t = catchThrowable(element::click);
    assertThat(t, instanceOf(WebDriverException.class));
    assertThat(t.getMessage(), containsString("Other element would receive the click"));
  }

  @Test
  @Ignore(CHROME)
  @Ignore(IE)
  @Ignore(MARIONETTE)
  @Ignore(SAFARI)
  @Ignore(HTMLUNIT)
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

  @Test
  @Ignore(CHROME)
  @Ignore(FIREFOX)
  @Ignore(SAFARI)
  @Ignore(HTMLUNIT)
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

  @Test
  @Ignore(SAFARI)
  @Ignore(HTMLUNIT)
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

  private static void clickOnElementWhichRecordsEvents(WebDriver driver) {
    driver.findElement(By.id("plainButton")).click();
  }

  private static void assertEventFired(String eventName, WebDriver driver) {
    WebElement result = driver.findElement(By.id("result"));

    String text = new WebDriverWait(driver, 10).until(elementTextToContain(result, eventName));
    boolean conditionMet = text.contains(eventName);

    assertTrue("No " + eventName + " fired: " + text, conditionMet);
  }

  private static void assertEventNotFired(String eventName, WebDriver driver) {
    WebElement result = driver.findElement(By.id("result"));
    String text = result.getText();
    assertFalse(eventName + " fired: " + text, text.contains(eventName));
  }

  private static boolean browserNeedsFocusOnThisOs(WebDriver driver) {
    // No browser yet demands focus on windows
    if (TestUtilities.getEffectivePlatform().is(Platform.WINDOWS))
      return false;

    if (Boolean.getBoolean("webdriver.focus.override")) {
      return false;
    }

    String browserName = getBrowserName(driver);
    return browserName.toLowerCase().contains("firefox");
  }

  private static String getBrowserName(WebDriver driver) {
    if (driver instanceof HasCapabilities) {
      return ((HasCapabilities) driver).getCapabilities().getBrowserName();
    }

    return driver.getClass().getName();
  }
}
