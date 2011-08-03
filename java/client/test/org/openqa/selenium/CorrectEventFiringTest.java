/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import java.io.File;
import java.io.IOException;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.openqa.selenium.Ignore.Driver.ANDROID;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.OPERA;
import static org.openqa.selenium.Ignore.Driver.SELENESE;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.elementTextToContain;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.WaitingConditions.elementToExist;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;

public class CorrectEventFiringTest extends AbstractDriverTestCase {

  @Ignore(value = {CHROME, FIREFOX, ANDROID}, reason = "Webkit bug 22261. Firefox 3.6 wants focus")
  @JavascriptEnabled
  public void testShouldFireFocusEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("focus");
  }

  @Ignore(ANDROID)
  @JavascriptEnabled
  public void testShouldFireClickEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("click");
  }

  @JavascriptEnabled
  @Ignore({SELENESE, ANDROID})
  public void testShouldFireMouseDownEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("mousedown");
  }

  @JavascriptEnabled
  @Ignore({SELENESE, ANDROID})
  public void testShouldFireMouseUpEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("mouseup");
  }

  @JavascriptEnabled
  @Ignore(value = {SELENESE})
  public void testShouldFireMouseOverEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("mouseover");
  }

  // TODO: this is a bad test: mousemove should not fire in a perfect click (e.g. mouse did not move
  // while doing down, up, click
  @JavascriptEnabled
  @Ignore({SELENESE, CHROME, FIREFOX})
  public void testShouldFireMouseMoveEventWhenClicking() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    assertEventFired("mousemove");
  }

  @JavascriptEnabled
  @Ignore(
      value = {SELENESE, HTMLUNIT},
      reason = "HtmlUnit: See issue 2187")
  public void testShouldNotThrowIfEventHandlerThrows() {
    driver.get(pages.javascriptPage);

    try {
      driver.findElement(By.id("throwing-mouseover")).click();
    } catch(WebDriverException e) {
      fail("Error in event handler should not have propagated: " + e);
    }
  }

  @Ignore(value = {CHROME, SELENESE, FIREFOX, ANDROID},
      reason = "Webkit bug 22261. Firefox 3.6 wants focus")
  @JavascriptEnabled
  public void testShouldFireEventsInTheRightOrder() {
    driver.get(pages.javascriptPage);

    clickOnElementWhichRecordsEvents();

    String text = driver.findElement(By.id("result")).getText();

    int lastIndex = -1;
    for (String event : new String[]{"mousedown", "focus", "mouseup", "click"}) {
      int index = text.indexOf(event);

      assertTrue(event + " did not fire at all", index != -1);
      assertTrue(event + " did not fire in the correct order", index > lastIndex);
    }
  }

  @JavascriptEnabled
  @Ignore({SELENESE, ANDROID})
  public void testsShouldIssueMouseDownEvents() {
    driver.get(pages.javascriptPage);
    driver.findElement(By.id("mousedown")).click();

    assertEventFired("mouse down");
    String result = driver.findElement(By.id("result")).getText();
    assertThat(result, equalTo("mouse down"));
  }

  @JavascriptEnabled
  public void testShouldIssueClickEvents() {
    driver.get(pages.javascriptPage);
    driver.findElement(By.id("mouseclick")).click();

    WebElement result = driver.findElement(By.id("result"));
    waitFor(elementTextToEqual(result, "mouse click"));
    assertThat(result.getText(), equalTo("mouse click"));
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  public void testShouldIssueMouseUpEvents() {
    driver.get(pages.javascriptPage);
    driver.findElement(By.id("mouseup")).click();

    WebElement result = driver.findElement(By.id("result"));
    waitFor(elementTextToEqual(result, "mouse up"));
    assertThat(result.getText(), equalTo("mouse up"));
  }

  @JavascriptEnabled
  @Ignore(value = {IPHONE, SELENESE})
  public void testMouseEventsShouldBubbleUpToContainingElements() {
    driver.get(pages.javascriptPage);
    driver.findElement(By.id("child")).click();

    WebElement result = driver.findElement(By.id("result"));
    waitFor(elementTextToEqual(result, "mouse down"));
    assertThat(result.getText(), equalTo("mouse down"));
  }

  @JavascriptEnabled
  @Ignore(value = {CHROME, IPHONE, SELENESE})
  public void testShouldEmitOnChangeEventsWhenSelectingElements() {
    driver.get(pages.javascriptPage);
    //Intentionally not looking up the select tag.  See selenium r7937 for details.
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
  @Ignore(value = {SELENESE, IE})
  public void testShouldEmitOnChangeEventsWhenChangingTheStateOfACheckbox() {
    driver.get(pages.javascriptPage);
    WebElement checkbox = driver.findElement(By.id("checkbox"));

    checkbox.click();
    assertThat(driver.findElement(By.id("result")).getText(),
               equalTo("checkbox thing"));
  }

  @JavascriptEnabled
  public void testShouldEmitClickEventWhenClickingOnATextInputElement() {
    driver.get(pages.javascriptPage);

    WebElement clicker = driver.findElement(By.id("clickField"));
    clicker.click();

    waitFor(elementValueToEqual(clicker, "Clicked"));
    assertThat(clicker.getAttribute("value"), equalTo("Clicked"));
  }

  @Ignore(ANDROID)
  @JavascriptEnabled
  public void testClearingAnElementShouldCauseTheOnChangeHandlerToFire() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("clearMe"));
    element.clear();

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText(), equalTo("Cleared"));
  }
  
  @JavascriptEnabled
  @Ignore(value = {SELENESE, IPHONE},
      reason = "Selenese: Fails when running in firefox.\n"
               + "  iPhone: sendKeys implementation is incorrect")
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
  @Ignore(value = {IPHONE, SELENESE},
      reason = "iPhone: input elements are blurred when the keyboard is closed")
  public void testSendingKeysToAFocusedElementShouldNotBlurThatElement() {
    if (browserNeedsFocusOnThisOs(driver)) {
      System.out.println("Skipping this test because browser demands focus");
      return;
    }
    
    driver.get(pages.javascriptPage);
    WebElement element = driver.findElement(By.id("theworks"));
    element.click();
    
    //Wait until focused
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
  @Ignore({IE, SELENESE})
  public void testSubmittingFormFromFormElementShouldFireOnSubmitForThatForm() {
    driver.get(pages.javascriptPage);
    WebElement formElement = driver.findElement(By.id("submitListeningForm"));
    formElement.submit();
    assertEventFired("form-onsubmit");
  }

  @JavascriptEnabled
  @Ignore({IE, SELENESE})
  public void testSubmittingFormFromFormInputSubmitElementShouldFireOnSubmitForThatForm() {
    driver.get(pages.javascriptPage);
    WebElement submit = driver.findElement(By.id("submitListeningForm-submit"));
    submit.submit();
    assertEventFired("form-onsubmit");
  }

  @JavascriptEnabled 
  @Ignore({IE, SELENESE})
  public void testSubmittingFormFromFormInputTextElementShouldFireOnSubmitForThatFormAndNotClickOnThatInput() {
    driver.get(pages.javascriptPage);
    WebElement submit = driver.findElement(By.id("submitListeningForm-submit"));
    submit.submit();
    assertEventFired("form-onsubmit");
    assertEventNotFired("text-onclick");
  }

  @JavascriptEnabled 
  @Ignore(value = {CHROME, SELENESE, IPHONE, ANDROID, OPERA},
      reason = "Does not yet support file uploads")
  public void testUploadingFileShouldFireOnChangeEvent() throws IOException {
    driver.get(pages.formPage);
    WebElement uploadElement = driver.findElement(By.id("upload"));
    WebElement result = driver.findElement(By.id("fileResults"));
    assertThat(result.getText(), equalTo(""));

    File file = File.createTempFile("test", "txt");
    file.deleteOnExit();

    uploadElement.sendKeys(file.getAbsolutePath());
    // Shift focus to something else because send key doesn't make the focus leave
    driver.findElement(By.tagName("body")).click();

    assertThat(result.getText(), equalTo("changed"));
  }

  private String getTextFromElementOnceAvailable(String elementId) {
    return waitFor(elementToExist(driver, elementId)).getText();
  }

  @Ignore(
      value = {CHROME, HTMLUNIT, SELENESE, ANDROID},
      reason = "Not implemented")
  public void testShouldReportTheXAndYCoordinatesWhenClicking() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("eventish"));
    element.click();

    String clientX = getTextFromElementOnceAvailable("clientX");
    String clientY = getTextFromElementOnceAvailable("clientY");

    assertFalse("0".equals(clientX));
    assertFalse("0".equals(clientY));
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
}
