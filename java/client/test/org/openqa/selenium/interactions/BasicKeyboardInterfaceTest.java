/*
Copyright 2007-2010 Selenium committers

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

package org.openqa.selenium.interactions;

import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeFalse;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;

import static org.hamcrest.Matchers.is;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.Color;
import org.openqa.selenium.support.Colors;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.TestUtilities;

/**
 * Tests interaction through the advanced gestures API of keyboard handling.
 */
@Ignore(value = {SAFARI, MARIONETTE},
    reason = "Safari: not implemented (issue 4136)",
    issues = {4136})
public class BasicKeyboardInterfaceTest extends JUnit4TestBase {

  private Actions getBuilder(WebDriver driver) {
    return new Actions(driver);
  }

  @JavascriptEnabled
  @Ignore({ANDROID, IPHONE})
  @Test
  public void testBasicKeyboardInput() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));

    Action sendLowercase = getBuilder(driver).sendKeys(keyReporter, "abc def").build();

    sendLowercase.perform();

    assertThat(keyReporter.getAttribute("value"), is("abc def"));
  }

  @JavascriptEnabled
  @Ignore({ANDROID, IPHONE, IE, OPERA, OPERA_MOBILE})
  @Test
  public void testSendingKeyDownOnly() {
    driver.get(pages.javascriptPage);

    WebElement keysEventInput = driver.findElement(By.id("theworks"));

    Action pressShift = getBuilder(driver).keyDown(keysEventInput, Keys.SHIFT).build();

    pressShift.perform();

    WebElement keyLoggingElement = driver.findElement(By.id("result"));
    String logText = keyLoggingElement.getText();

    Action releaseShift = getBuilder(driver).keyUp(keysEventInput, Keys.SHIFT).build();
    releaseShift.perform();

    assertTrue("Key down event not isolated, got: " + logText,
        logText.endsWith("keydown"));
  }

  @JavascriptEnabled
  @Ignore({ANDROID, IPHONE, IE, OPERA, OPERA_MOBILE})
  @Test
  public void testSendingKeyUp() {
    driver.get(pages.javascriptPage);
    WebElement keysEventInput = driver.findElement(By.id("theworks"));

    Action pressShift = getBuilder(driver).keyDown(keysEventInput, Keys.SHIFT).build();
    pressShift.perform();

    WebElement keyLoggingElement = driver.findElement(By.id("result"));

    String eventsText = keyLoggingElement.getText();
    assertTrue("Key down should be isolated for this test to be meaningful. " +
        "Got events: " + eventsText, eventsText.endsWith("keydown"));

    Action releaseShift = getBuilder(driver).keyUp(keysEventInput, Keys.SHIFT).build();

    releaseShift.perform();

    eventsText = keyLoggingElement.getText();
    assertTrue("Key up event not isolated. Got events: " + eventsText,
        eventsText.endsWith("keyup"));
  }

  @JavascriptEnabled
  @Ignore({ANDROID, HTMLUNIT, IPHONE, IE, OPERA, OPERA_MOBILE})
  @Test
  public void testSendingKeysWithShiftPressed() {
    driver.get(pages.javascriptPage);

    WebElement keysEventInput = driver.findElement(By.id("theworks"));

    keysEventInput.click();

    String existingResult = getFormEvents();

    Action pressShift = getBuilder(driver).keyDown(keysEventInput, Keys.SHIFT).build();
    pressShift.perform();

    Action sendLowercase = getBuilder(driver).sendKeys(keysEventInput, "ab").build();
    sendLowercase.perform();

    Action releaseShift = getBuilder(driver).keyUp(keysEventInput, Keys.SHIFT).build();
    releaseShift.perform();

    String expectedEvents = " keydown keydown keypress keyup keydown keypress keyup keyup";
    assertThatFormEventsFiredAreExactly("Shift key not held",
        existingResult + expectedEvents);

    assertThat(keysEventInput.getAttribute("value"), is("AB"));
  }

  @JavascriptEnabled
  @Ignore({ANDROID, IPHONE})
  @Test
  public void testSendingKeysToActiveElement() {
    assumeFalse("This test fails due to a bug in Firefox 9. For more details, see: " +
                "https://bugzilla.mozilla.org/show_bug.cgi?id=696020",
                TestUtilities.isFirefox9(driver));

    driver.get(pages.bodyTypingPage);

    Action someKeys = getBuilder(driver).sendKeys("ab").build();
    someKeys.perform();

    assertThatBodyEventsFiredAreExactly("keypress keypress");
    assertThatFormEventsFiredAreExactly("");
  }

  @Ignore({ANDROID, IPHONE})
  @Test
  public void testBasicKeyboardInputOnActiveElement() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));

    keyReporter.click();

    Action sendLowercase = getBuilder(driver).sendKeys("abc def").build();

    sendLowercase.perform();

    assertThat(keyReporter.getAttribute("value"), is("abc def"));
  }

  @Ignore(value = {ANDROID, IPHONE, IE, OPERA, SAFARI, HTMLUNIT}, reason = "untested")
  @JavascriptEnabled
  @Test
  public void canGenerateKeyboardShortcuts() {
    assumeTrue(
        "Test fails with native events enabled, likely due to issue 4385",
        !TestUtilities.isFirefox(driver) || !TestUtilities.isNativeEventsEnabled(driver));

    driver.get(appServer.whereIs("keyboard_shortcut.html"));

    WebElement body = driver.findElement(By.xpath("//body"));
    assertBackgroundColor(body, Colors.WHITE);

    new Actions(driver).keyDown(Keys.SHIFT).sendKeys("1").keyUp(Keys.SHIFT).perform();
    assertBackgroundColor(body, Colors.GREEN);

    new Actions(driver).keyDown(Keys.ALT).sendKeys("1").keyUp(Keys.ALT).perform();
    assertBackgroundColor(body, Colors.LIGHTBLUE);

    new Actions(driver)
        .keyDown(Keys.SHIFT).keyDown(Keys.ALT)
        .sendKeys("1")
        .keyUp(Keys.SHIFT).keyUp(Keys.ALT)
        .perform();
    assertBackgroundColor(body, Colors.SILVER);
  }

  private void assertBackgroundColor(WebElement el, Colors expected) {
    Color actual = Color.fromString(el.getCssValue("background-color"));
    assertThat(actual, is(expected.getColorValue()));
  }

  private void assertThatFormEventsFiredAreExactly(String message, String expected) {
    assertThat(message, getFormEvents(), is(expected.trim()));
  }

  private String getFormEvents() {
    return driver.findElement(By.id("result")).getText().trim();
  }

  private void assertThatFormEventsFiredAreExactly(String expected) {
    assertThatFormEventsFiredAreExactly("", expected);
  }

  private void assertThatBodyEventsFiredAreExactly(String expected) {
    assertThat(driver.findElement(By.id("body_result")).getText().trim(), is(expected.trim()));
  }
}
