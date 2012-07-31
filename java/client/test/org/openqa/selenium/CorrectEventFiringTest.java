/*
Copyright 2007-2009 Selenium committers

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
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.SauceDriver;

import java.io.File;
import java.io.IOException;
import java.util.List;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.not;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.elementTextToContain;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.WaitingConditions.elementToExist;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.testing.Ignore.Driver.ALL;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

public class CorrectEventFiringTest extends JUnit4TestBase {

  @Ignore(value = {CHROME, FIREFOX, ANDROID}, reason = "Webkit bug 22261. Firefox 3.6 wants focus")
  @JavascriptEnabled
  @Test
  public void testShouldFireFocusEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("focus");
  }

  @Ignore(ANDROID)
  @JavascriptEnabled
  @Test
  public void testShouldFireClickEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("click");
  }

  @JavascriptEnabled
  @Ignore({SELENESE, ANDROID})
  @Test
  public void testShouldFireMouseDownEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("mousedown");
  }

  @JavascriptEnabled
  @Ignore({SELENESE, ANDROID})
  @Test
  public void testShouldFireMouseUpEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("mouseup");
  }

  @JavascriptEnabled
  @Ignore(value = {SELENESE})
  @Test
  public void testShouldFireMouseOverEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("mouseover");
  }

  // TODO: this is a bad test: mousemove should not fire in a perfect click (e.g. mouse did not move
  // while doing down, up, click
  @JavascriptEnabled
  @Ignore({SELENESE, CHROME, FIREFOX})
  @Test
  public void testShouldFireMouseMoveEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("mousemove");
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  @Test
  public void testShouldNotThrowIfEventHandlerThrows() {
    driver.get(pages.javascriptPage);

    try {
      driver.findElement(By.id("throwing-mouseover")).click();
    } catch (WebDriverException e) {
      fail("Error in event handler should not have propagated: " + e);
    }
  }

  @Ignore(value = {CHROME, SELENESE, FIREFOX, ANDROID},
      reason = "Webkit bug 22261. Firefox 3.6 wants focus")
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
    }
  }

  @JavascriptEnabled
  @Ignore({SELENESE, ANDROID})
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
    waitFor(elementTextToEqual(result, "mouse click"));
    assertThat(result.getText(), equalTo("mouse click"));
  }

  @JavascriptEnabled
  @Ignore(value = {ANDROID, SELENESE}, reason = "Android: triggers mouse click instead.")
  @Test
  public void testShouldIssueMouseUpEvents() {
    driver.get(pages.javascriptPage);
    driver.findElement(By.id("mouseup")).click();

    WebElement result = driver.findElement(By.id("result"));
    waitFor(elementTextToEqual(result, "mouse up"));
    assertThat(result.getText(), equalTo("mouse up"));
  }

  @JavascriptEnabled
  @Ignore(value = {IPHONE, SELENESE})
  @Test
  public void testMouseEventsShouldBubbleUpToContainingElements() {
    driver.get(pages.javascriptPage);
    driver.findElement(By.id("child")).click();

    WebElement result = driver.findElement(By.id("result"));
    waitFor(elementTextToEqual(result, "mouse down"));
    assertThat(result.getText(), equalTo("mouse down"));
  }

  @JavascriptEnabled
  @Ignore(value = {IPHONE, SELENESE, ANDROID})
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
  @Ignore(value = {SELENESE, IE},
      reason = "IE: Only fires the onchange event when the checkbox loses the focus")
  @Test
  public void testShouldEmitOnChangeEventsWhenChangingTheStateOfACheckbox() {
    driver.get(pages.javascriptPage);
    WebElement checkbox = driver.findElement(By.id("checkbox"));

    checkbox.click();
    WebElement result = driver.findElement(By.id("result"));
    waitFor(elementTextToEqual(result, "checkbox thing"));
  }

  @JavascriptEnabled
  @Test
  public void testShouldEmitClickEventWhenClickingOnATextInputElement() {
    driver.get(pages.javascriptPage);

    WebElement clicker = driver.findElement(By.id("clickField"));
    clicker.click();

    waitFor(elementValueToEqual(clicker, "Clicked"));
    assertThat(clicker.getAttribute("value"), equalTo("Clicked"));
  }

  @Ignore({ANDROID})
  @JavascriptEnabled
  @Test
  public void testShouldFireTwoClickEventsWhenClickingOnALabel() {
    driver.get(pages.javascriptPage);

    driver.findElement(By.id("labelForCheckbox")).click();

    WebElement result = driver.findElement(By.id("result"));
    assertNotNull(waitFor(elementTextToContain(result, "labelclick chboxclick")));
  }

  @Ignore(ANDROID)
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
  @Ignore(value = {SELENESE, IPHONE, ANDROID},
      reason = "Selenese: Fails when running in firefox.\n"
          + "  iPhone: sendKeys implementation is incorrect")
  @Test
  public void testSendingKeysToAnotherElementShouldCauseTheBlurEventToFire() {
    if (browserNeedsFocusOnThisOs(driver)) {
      System.out.println("Skipping this test because browser demands focus");
      return;
    }

    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("theworks"));
    element.sendKeys("foo");
    WebElement element2 = driver.findElement(By.id("changeable"));
    element2.sendKeys("bar");
    assertEventFired("blur");
  }

  @JavascriptEnabled
  @Ignore(value = {SELENESE, IPHONE, ANDROID},
      reason = "Selenese: Fails when running in firefox.\n"
          + "  iPhone: sendKeys implementation is incorrect")
  @Test
  public void testSendingKeysToAnElementShouldCauseTheFocusEventToFire() {
    if (browserNeedsFocusOnThisOs(driver)) {
      System.out.println("Skipping this test because browser demands focus");
      return;
    }

    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("theworks"));
    element.sendKeys("foo");
    assertEventFired("focus");
  }

  @JavascriptEnabled
  @Ignore(value = {IPHONE, SELENESE, ANDROID},
      reason = "iPhone: input elements are blurred when the keyboard is closed")
  @Test
  public void testSendingKeysToAFocusedElementShouldNotBlurThatElement() {
    if (browserNeedsFocusOnThisOs(driver)) {
      System.out.println("Skipping this test because browser demands focus");
      return;
    }

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
  @Ignore({SELENESE})
  @Test
  public void testSubmittingFormFromFormElementShouldFireOnSubmitForThatForm() {
    driver.get(pages.javascriptPage);
    WebElement formElement = driver.findElement(By.id("submitListeningForm"));
    formElement.submit();
    assertEventFired("form-onsubmit");
  }

  @JavascriptEnabled
  @Ignore({SELENESE, ANDROID})
  @Test
  public void testSubmittingFormFromFormInputSubmitElementShouldFireOnSubmitForThatForm() {
    driver.get(pages.javascriptPage);
    WebElement submit = driver.findElement(By.id("submitListeningForm-submit"));
    submit.submit();
    assertEventFired("form-onsubmit");
  }

  @JavascriptEnabled
  @Ignore({SELENESE, ANDROID})
  @Test
  public void testSubmittingFormFromFormInputTextElementShouldFireOnSubmitForThatFormAndNotClickOnThatInput() {
    driver.get(pages.javascriptPage);
    WebElement submit = driver.findElement(By.id("submitListeningForm-submit"));
    submit.submit();
    assertEventFired("form-onsubmit");
    assertEventNotFired("text-onclick");
  }

  @JavascriptEnabled
  @Ignore(value = {CHROME, SELENESE, IPHONE, ANDROID, OPERA, SAFARI, OPERA_MOBILE},
      reason = "Does not yet support file uploads", issues = { 4220 })
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
    return waitFor(elementToExist(driver, elementId)).getText();
  }

  @JavascriptEnabled
  @Ignore(value = {SELENESE, ANDROID}, reason = "Not implemented")
  @Test
  public void testShouldReportTheXAndYCoordinatesWhenClicking() {
    if (SauceDriver.shouldUseSauce() && TestUtilities.isInternetExplorer(driver)) {
      System.err.println("Skipping test which fails in IE on Sauce");
      return;
    }
    driver.get(pages.clickEventPage);

    WebElement element = driver.findElement(By.id("eventish"));
    element.click();

    String clientX = getTextFromElementOnceAvailable("clientX");
    String clientY = getTextFromElementOnceAvailable("clientY");

    assertThat(clientX, not(equalTo("0")));
    assertThat(clientY, not(equalTo("0")));
  }
  
  @JavascriptEnabled
  @Ignore(ALL)
  @Test
  public void testClickEventsShouldBubble() {
    driver.get(pages.clicksPage);
    driver.findElement(By.id("bubblesFrom")).click();
    boolean eventBubbled = (Boolean)((JavascriptExecutor)driver).executeScript("return !!window.bubbledClick;");
    assertTrue("Event didn't bubble up", eventBubbled);
  }

  private void clickOnElementWhichRecordsEvents() {
    driver.findElement(By.id("plainButton")).click();
  }

  private void assertEventFired(String eventName) {
    WebElement result = driver.findElement(By.id("result"));

    String text = waitFor(elementTextToContain(result, eventName));
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
    if (Platform.getCurrent().is(Platform.WINDOWS))
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
