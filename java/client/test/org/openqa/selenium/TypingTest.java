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

import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assume.assumeFalse;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Driver.SAFARI;
import static org.openqa.selenium.testing.TestUtilities.getEffectivePlatform;
import static org.openqa.selenium.testing.TestUtilities.getFirefoxVersion;
import static org.openqa.selenium.testing.TestUtilities.isFirefox;

import com.google.common.base.Joiner;

import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.drivers.Browser;

public class TypingTest extends JUnit4TestBase {

  @JavascriptEnabled
  @Test
  public void testShouldFireKeyPressEvents() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("a");

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText(), containsString("press:"));
  }

  @JavascriptEnabled
  @Test
  public void testShouldFireKeyDownEvents() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("I");

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText(), containsString("down:"));
  }

  @JavascriptEnabled
  @Test
  public void testShouldFireKeyUpEvents() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("a");

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText(), containsString("up:"));
  }

  @Test
  @Ignore(value = HTMLUNIT, reason = "Possible bug in getAttribute?")
  public void testShouldTypeLowerCaseLetters() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("abc def");

    assertThat(keyReporter.getAttribute("value"), is("abc def"));
  }

  @Test
  @Ignore(value = HTMLUNIT, reason = "Possible bug in getAttribute?")
  public void testShouldBeAbleToTypeCapitalLetters() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("ABC DEF");

    assertThat(keyReporter.getAttribute("value"), is("ABC DEF"));
  }

  @Test
  @Ignore(value = HTMLUNIT, reason = "Possible bug in getAttribute?")
  public void testShouldBeAbleToTypeQuoteMarks() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("\"");

    assertThat(keyReporter.getAttribute("value"), is("\""));
  }

  @Test
  @Ignore(value = HTMLUNIT, reason = "Possible bug in getAttribute?")
  public void testShouldBeAbleToTypeTheAtCharacter() {
    // simon: I tend to use a US/UK or AUS keyboard layout with English
    // as my primary language. There are consistent reports that we're
    // not handling i18nised keyboards properly. This test exposes this
    // in a lightweight manner when my keyboard is set to the DE mapping
    // and we're using IE.

    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("@");

    assertThat(keyReporter.getAttribute("value"), is("@"));
  }

  @Test
  @Ignore(value = HTMLUNIT, reason = "Possible bug in getAttribute?")
  public void testShouldBeAbleToMixUpperAndLowerCaseLetters() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("me@eXample.com");

    assertThat(keyReporter.getAttribute("value"), is("me@eXample.com"));
  }

  @JavascriptEnabled
  @Test
  public void testArrowKeysShouldNotBePrintable() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys(Keys.ARROW_LEFT);

    assertThat(keyReporter.getAttribute("value"), is(""));
  }

  @NotYetImplemented(HTMLUNIT)
  @Ignore(value = HTMLUNIT, reason = "Possible bug in getAttribute?")
  @Test
  public void testShouldBeAbleToUseArrowKeys() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("tet", Keys.ARROW_LEFT, "s");

    assertThat(keyReporter.getAttribute("value"), is("test"));
  }

  @JavascriptEnabled
  @Test
  public void testWillSimulateAKeyUpWhenEnteringTextIntoInputElements() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyUp"));
    element.sendKeys("I like cheese");

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText(), equalTo("I like cheese"));
  }

  @JavascriptEnabled
  @Test
  public void testWillSimulateAKeyDownWhenEnteringTextIntoInputElements() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyDown"));
    element.sendKeys("I like cheese");

    WebElement result = driver.findElement(By.id("result"));
    // Because the key down gets the result before the input element is
    // filled, we're a letter short here
    assertThat(result.getText(), equalTo("I like chees"));
  }

  @JavascriptEnabled
  @Test
  public void testWillSimulateAKeyPressWhenEnteringTextIntoInputElements() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyPress"));
    element.sendKeys("I like cheese");

    WebElement result = driver.findElement(By.id("result"));
    // Because the key down gets the result before the input element is
    // filled, we're a letter short here
    assertThat(result.getText(), equalTo("I like chees"));
  }

  @JavascriptEnabled
  @Test
  public void testWillSimulateAKeyUpWhenEnteringTextIntoTextAreas() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyUpArea"));
    element.sendKeys("I like cheese");

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText(), equalTo("I like cheese"));
  }

  @JavascriptEnabled
  @Test
  public void testWillSimulateAKeyDownWhenEnteringTextIntoTextAreas() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyDownArea"));
    element.sendKeys("I like cheese");

    WebElement result = driver.findElement(By.id("result"));
    // Because the key down gets the result before the input element is
    // filled, we're a letter short here
    assertThat(result.getText(), equalTo("I like chees"));
  }

  @JavascriptEnabled
  @Test
  public void testWillSimulateAKeyPressWhenEnteringTextIntoTextAreas() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyPressArea"));
    element.sendKeys("I like cheese");

    WebElement result = driver.findElement(By.id("result"));
    // Because the key down gets the result before the input element is
    // filled, we're a letter short here
    assertThat(result.getText(), equalTo("I like chees"));
  }

  @JavascriptEnabled
  @Ignore(value = {IE})
  @Test
  public void testShouldFireFocusKeyEventsInTheRightOrder() {
    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("theworks"));

    element.sendKeys("a");
    assertThat(result.getText().trim(), is("focus keydown keypress keyup"));
  }

  private static void checkRecordedKeySequence(WebElement element, int expectedKeyCode) {
    assertThat(element.getText().trim(),
               anyOf(is(String.format("down: %1$d press: %1$d up: %1$d", expectedKeyCode)),
                     is(String.format("down: %1$d up: %1$d", expectedKeyCode))));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, IE, PHANTOMJS})
  @NotYetImplemented(HTMLUNIT)
  @Test
  public void testShouldReportKeyCodeOfArrowKeys() {
    assumeFalse(Browser.detect() == Browser.opera &&
                getEffectivePlatform().is(Platform.WINDOWS));

    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys(Keys.ARROW_DOWN);
    checkRecordedKeySequence(result, 40);

    element.sendKeys(Keys.ARROW_UP);
    checkRecordedKeySequence(result, 38);

    element.sendKeys(Keys.ARROW_LEFT);
    checkRecordedKeySequence(result, 37);

    element.sendKeys(Keys.ARROW_RIGHT);
    checkRecordedKeySequence(result, 39);

    // And leave no rubbish/printable keys in the "keyReporter"
    assertThat(element.getAttribute("value"), is(""));
  }

  @JavascriptEnabled
  @NotYetImplemented(HTMLUNIT)
  @Ignore(value = HTMLUNIT, reason = "Possible bug in getAttribute?")
  @Test
  public void testShouldReportKeyCodeOfArrowKeysUpDownEvents() {
    assumeFalse(Browser.detect() == Browser.opera &&
                getEffectivePlatform().is(Platform.WINDOWS));

    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys(Keys.ARROW_DOWN);
    assertThat(result.getText().trim(), containsString("down: 40"));
    assertThat(result.getText().trim(), containsString("up: 40"));

    element.sendKeys(Keys.ARROW_UP);
    assertThat(result.getText().trim(), containsString("down: 38"));
    assertThat(result.getText().trim(), containsString("up: 38"));

    element.sendKeys(Keys.ARROW_LEFT);
    assertThat(result.getText().trim(), containsString("down: 37"));
    assertThat(result.getText().trim(), containsString("up: 37"));

    element.sendKeys(Keys.ARROW_RIGHT);
    assertThat(result.getText().trim(), containsString("down: 39"));
    assertThat(result.getText().trim(), containsString("up: 39"));

    // And leave no rubbish/printable keys in the "keyReporter"
    assertThat(element.getAttribute("value"), is(""));
  }

  @JavascriptEnabled
  @Test
  public void testNumericNonShiftKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    String numericLineCharsNonShifted = "`1234567890-=[]\\;,.'/42";
    element.sendKeys(numericLineCharsNonShifted);

    assertThat(element.getAttribute("value"), is(numericLineCharsNonShifted));
  }

  @JavascriptEnabled
  @Test
  @Ignore(MARIONETTE)
  public void testNumericShiftKeys() {
    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    String numericShiftsEtc = "~!@#$%^&*()_+{}:\"<>?|END~";
    element.sendKeys(numericShiftsEtc);

    assertThat(element.getAttribute("value"), is(numericShiftsEtc));
    assertThat(result.getText().trim(), containsString(" up: 16"));
  }

  @JavascriptEnabled
  @Test
  public void testLowerCaseAlphaKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    String lowerAlphas = "abcdefghijklmnopqrstuvwxyz";
    element.sendKeys(lowerAlphas);

    assertThat(element.getAttribute("value"), is(lowerAlphas));
  }

  @JavascriptEnabled
  @Test
  @Ignore(MARIONETTE)
  public void testUppercaseAlphaKeys() {
    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    String upperAlphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    element.sendKeys(upperAlphas);

    assertThat(element.getAttribute("value"), is(upperAlphas));
    assertThat(result.getText().trim(), containsString(" up: 16"));
  }

  @JavascriptEnabled
  @Test
  @Ignore(MARIONETTE)
  public void testAllPrintableKeys() {
    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    String allPrintable =
        "!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFGHIJKLMNO" +
        "PQRSTUVWXYZ [\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
    element.sendKeys(allPrintable);

    assertThat(element.getAttribute("value"), is(allPrintable));
    assertThat(result.getText().trim(), containsString(" up: 16"));
  }

  @NotYetImplemented(HTMLUNIT)
  @Ignore(value = HTMLUNIT, reason = "Possible bug in getAttribute?")
  @Test
  public void testArrowKeysAndPageUpAndDown() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("a" + Keys.LEFT + "b" + Keys.RIGHT +
                     Keys.UP + Keys.DOWN + Keys.PAGE_UP + Keys.PAGE_DOWN + "1");
    assertThat(element.getAttribute("value"), is("ba1"));
  }

  @JavascriptEnabled
  @Test
  public void testHomeAndEndAndPageUpAndPageDownKeys() {
    assumeFalse("FIXME: macs don't have HOME keys, would PGUP work?",
                getEffectivePlatform().is(Platform.MAC));

    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("abc" + Keys.HOME + "0" + Keys.LEFT + Keys.RIGHT +
                     Keys.PAGE_UP + Keys.PAGE_DOWN + Keys.END + "1" + Keys.HOME +
                     "0" + Keys.PAGE_UP + Keys.END + "111" + Keys.HOME + "00");
    assertThat(element.getAttribute("value"), is("0000abc1111"));
  }

  @JavascriptEnabled
  @NotYetImplemented(HTMLUNIT)
  @Ignore(value = HTMLUNIT, reason = "Possible bug in getAttribute?")
  @Test
  public void testDeleteAndBackspaceKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("abcdefghi");
    assertThat(element.getAttribute("value"), is("abcdefghi"));

    element.sendKeys(Keys.LEFT, Keys.LEFT, Keys.DELETE);
    assertThat(element.getAttribute("value"), is("abcdefgi"));

    element.sendKeys(Keys.LEFT, Keys.LEFT, Keys.BACK_SPACE);
    assertThat(element.getAttribute("value"), is("abcdfgi"));
  }

  @JavascriptEnabled
  @NotYetImplemented(HTMLUNIT)
  @Test
  @Ignore({HTMLUNIT, MARIONETTE})
  public void testSpecialSpaceKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("abcd" + Keys.SPACE + "fgh" + Keys.SPACE + "ij");
    assertThat(element.getAttribute("value"), is("abcd fgh ij"));
  }

  @JavascriptEnabled
  @NotYetImplemented(HTMLUNIT)
  @Test
  @Ignore({HTMLUNIT, MARIONETTE})
  public void testNumberpadKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("abcd" + Keys.MULTIPLY + Keys.SUBTRACT + Keys.ADD +
                     Keys.DECIMAL + Keys.SEPARATOR + Keys.NUMPAD0 + Keys.NUMPAD9 +
                     Keys.ADD + Keys.SEMICOLON + Keys.EQUALS + Keys.DIVIDE +
                     Keys.NUMPAD3 + "abcd");
    assertThat(element.getAttribute("value"), is("abcd*-+.,09+;=/3abcd"));
  }

  @JavascriptEnabled
  @Ignore(value = {IE}, reason = "IE: F4 triggers address bar")
  @Test
  public void testFunctionKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("FUNCTION" + Keys.F4 + "-KEYS" + Keys.F4);
    element.sendKeys("" + Keys.F4 + "-TOO" + Keys.F4);
    assertThat(element.getAttribute("value"), is("FUNCTION-KEYS-TOO"));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, SAFARI}, reason = "Safari: issue 4221", issues = {4221})
  @NotYetImplemented(HTMLUNIT)
  @Test
  public void testShiftSelectionDeletes() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("abcd efgh");
    assertThat(element.getAttribute("value"), is("abcd efgh"));

    element.sendKeys(Keys.SHIFT, Keys.LEFT, Keys.LEFT, Keys.LEFT);
    element.sendKeys(Keys.DELETE);
    assertThat(element.getAttribute("value"), is("abcd e"));
  }

  @JavascriptEnabled
  @Test
  @Ignore(MARIONETTE)
  public void testChordControlHomeShiftEndDelete() {
    assumeFalse("FIXME: macs don't have HOME keys, would PGUP work?",
                getEffectivePlatform().is(Platform.MAC));

    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFG");

    element.sendKeys(Keys.HOME);
    element.sendKeys("" + Keys.SHIFT + Keys.END);
    assertThat(result.getText(), containsString(" up: 16"));

    element.sendKeys(Keys.DELETE);
    assertThat(element.getAttribute("value"), is(""));
  }

  @JavascriptEnabled
  @NotYetImplemented(HTMLUNIT)
  @Test
  @Ignore(MARIONETTE)
  public void testChordReveseShiftHomeSelectionDeletes() {
    assumeFalse("FIXME: macs don't have HOME keys, would PGUP work?",
                getEffectivePlatform().is(Platform.MAC));

    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("done" + Keys.HOME);
    assertThat(element.getAttribute("value"), is("done"));

    element.sendKeys("" + Keys.SHIFT + "ALL " + Keys.HOME);
    assertThat(element.getAttribute("value"), is("ALL done"));

    element.sendKeys(Keys.DELETE);
    assertThat(element.getAttribute("value"), is("done"));

    element.sendKeys("" + Keys.END + Keys.SHIFT + Keys.HOME);
    assertThat(element.getAttribute("value"), is("done"));
    assertThat( // Note: trailing SHIFT up here
                result.getText().trim(), containsString(" up: 16"));

    element.sendKeys("" + Keys.DELETE);
    assertThat(element.getAttribute("value"), is(""));
  }

  // control-x control-v here for cut & paste tests, these work on windows
  // and linux, but not on the MAC.

  @JavascriptEnabled
  @Test
  @Ignore(MARIONETTE)
  public void testChordControlCutAndPaste() {
    assumeFalse("FIXME: macs don't have HOME keys, would PGUP work?",
                getEffectivePlatform().is(Platform.MAC));

    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));
    WebElement result = driver.findElement(By.id("result"));

    String paste = "!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFG";
    element.sendKeys(paste);
    assertThat(element.getAttribute("value"), is(paste));

    element.sendKeys(Keys.HOME);
    element.sendKeys("" + Keys.SHIFT + Keys.END);
    assertThat(result.getText().trim(), containsString(" up: 16"));

    element.sendKeys(Keys.CONTROL, "x");
    assertThat(element.getAttribute("value"), is(""));

    element.sendKeys(Keys.CONTROL, "v");
    wait.until(elementValueToEqual(element, paste));

    // Cut the last 3 letters.
    element.sendKeys("" + Keys.LEFT + Keys.LEFT + Keys.LEFT +
                     Keys.SHIFT + Keys.END);

    element.sendKeys(Keys.CONTROL, "x");
    assertThat(element.getAttribute("value"), is(paste.substring(0, paste.length() - 3)));

    // Paste the last 3 letters.
    element.sendKeys(Keys.CONTROL, "v");
    assertThat(element.getAttribute("value"), is(paste));

    element.sendKeys(Keys.HOME);
    element.sendKeys(Keys.CONTROL, "v");
    element.sendKeys(Keys.CONTROL, "v" + "v");
    element.sendKeys(Keys.CONTROL, "v" + "v" + "v");
    assertThat(element.getAttribute("value"), is("EFGEFGEFGEFGEFGEFG" + paste));

    element.sendKeys("" + Keys.END + Keys.SHIFT + Keys.HOME +
                     Keys.NULL + Keys.DELETE);
    assertThat(element.getAttribute("value"), is(""));
  }

  @JavascriptEnabled
  @Test
  public void testShouldTypeIntoInputElementsThatHaveNoTypeAttribute() {
    driver.get(pages.formPage);

    WebElement element = driver.findElement(By.id("no-type"));

    element.sendKeys("should say cheese");
    assertThat(element.getAttribute("value"), is("should say cheese"));
  }

  @JavascriptEnabled
  @Test
  public void testShouldNotTypeIntoElementsThatPreventKeyDownEvents() {
    driver.get(pages.javascriptPage);

    WebElement silent = driver.findElement(By.name("suppress"));

    silent.sendKeys("s");
    assertThat(silent.getAttribute("value"), is(""));
  }

  @JavascriptEnabled
  @Ignore(value = {PHANTOMJS, MARIONETTE, HTMLUNIT})
  @NotYetImplemented(HTMLUNIT)
  @Test
  public void testGenerateKeyPressEventEvenWhenElementPreventsDefault() {
    assumeFalse(isFirefox(driver) && getFirefoxVersion(driver) < 25);
    driver.get(pages.javascriptPage);

    WebElement silent = driver.findElement(By.name("suppress"));
    WebElement result = driver.findElement(By.id("result"));

    silent.sendKeys("s");
    assertThat(result.getText().trim(), is(""));
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToTypeOnAnEmailInputField() {
    driver.get(pages.formPage);
    WebElement email = driver.findElement(By.id("email"));
    email.sendKeys("foobar");
    assertThat(email.getAttribute("value"), equalTo("foobar"));
  }

  @Ignore(value = {HTMLUNIT}, reason = "inconsistent test")
  @Test
  public void testShouldBeAbleToTypeOnANumberInputField() {
    driver.get(pages.formPage);
    WebElement email = driver.findElement(By.id("age"));
    email.sendKeys("33");
    assertThat(email.getAttribute("value"), equalTo("33"));
  }

  @JavascriptEnabled
  @Ignore(value = {SAFARI}, reason = "Untested")
  @Test
  public void canSafelyTypeOnElementThatIsRemovedFromTheDomOnKeyPress() {
    driver.get(appServer.whereIs("key_tests/remove_on_keypress.html"));

    WebElement input = driver.findElement(By.id("target"));
    WebElement log = driver.findElement(By.id("log"));

    assertEquals("", log.getAttribute("value"));

    input.sendKeys("b");
    assertThat(getValueText(log), equalTo(Joiner.on('\n').join(
        "keydown (target)",
        "keyup (target)",
        "keyup (body)")));

    input.sendKeys("a");

    // Some drivers (IE, Firefox) do not always generate the final keyup event since the element
    // is removed from the DOM in response to the keypress (note, this is a product of how events
    // are generated and does not match actual user behavior).
    String expected = Joiner.on('\n').join(
        "keydown (target)",
        "keyup (target)",
        "keyup (body)",
        "keydown (target)",
        "a pressed; removing");
    assertThat(getValueText(log), anyOf(equalTo(expected), equalTo(expected + "\nkeyup (body)")));
  }

  @Test
  @Ignore(value = {HTMLUNIT, MARIONETTE, CHROME}, reason = "Failed with JS enabled, passed otherwise")
  public void canClearNumberInputAfterTypingInvalidInput() {
    driver.get(pages.formPage);
    WebElement input = driver.findElement(By.id("age"));
    input.sendKeys("e");
    input.clear();
    input.sendKeys("3");
    assertEquals("3", input.getAttribute("value"));
  }

  private static String getValueText(WebElement el) {
    // Standardize on \n and strip any trailing whitespace.
    return el.getAttribute("value").replace("\r\n", "\n").trim();
  }
}
