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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.CHROME_NON_WINDOWS;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

@Ignore(value = IPHONE, reason = "sendKeys is broken on the iPhone")
public class TypingTest extends AbstractDriverTestCase {

  @JavascriptEnabled
  @Ignore(CHROME_NON_WINDOWS)
  public void testShouldFireKeyPressEvents() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("a");

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText(), containsString("press:"));
  }

  @JavascriptEnabled
  @Ignore(CHROME_NON_WINDOWS)
  public void testShouldFireKeyDownEvents() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("I");

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText(), containsString("down:"));
  }

  @JavascriptEnabled
  @Ignore(CHROME_NON_WINDOWS)
  public void testShouldFireKeyUpEvents() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("a");

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText(), containsString("up:"));
  }

  public void testShouldTypeLowerCaseLetters() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("abc def");

    assertThat(keyReporter.getValue(), is("abc def"));
  }

  public void testShouldBeAbleToTypeCapitalLetters() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("ABC DEF");

    assertThat(keyReporter.getValue(), is("ABC DEF"));
  }

  public void testShouldBeAbleToTypeQuoteMarks() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("\"");

    assertThat(keyReporter.getValue(), is("\""));
  }

  public void testShouldBeAbleToTypeTheAtCharacter() {
    // simon: I tend to use a US/UK or AUS keyboard layout with English
    // as my primary language. There are consistent reports that we're
    // not handling i18nised keyboards properly. This test exposes this
    // in a lightweight manner when my keyboard is set to the DE mapping
    // and we're using IE.

    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("@");

    assertThat(keyReporter.getValue(), is("@"));
  }

  @Ignore(SELENESE)
  public void testShouldBeAbleToMixUpperAndLowerCaseLetters() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("me@eXample.com");

    assertThat(keyReporter.getValue(), is("me@eXample.com"));
  }

  @JavascriptEnabled
  @Ignore({CHROME_NON_WINDOWS, SELENESE})
  public void testArrowKeysShouldNotBePrintable() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys(Keys.ARROW_LEFT);

    assertThat(keyReporter.getValue(), is(""));
  }

  @Ignore({HTMLUNIT, CHROME_NON_WINDOWS, SELENESE})
  public void testShouldBeAbleToUseArrowKeys() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("Tet", Keys.ARROW_LEFT, "s");

    assertThat(keyReporter.getValue(), is("Test"));
  }

  @JavascriptEnabled
  @Ignore({CHROME_NON_WINDOWS, SELENESE})
  public void testWillSimulateAKeyUpWhenEnteringTextIntoInputElements() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyUp"));
    element.sendKeys("I like cheese");

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText(), equalTo("I like cheese"));
  }

  @JavascriptEnabled
  @Ignore(CHROME_NON_WINDOWS)
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
  @Ignore(CHROME_NON_WINDOWS)
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
  @Ignore({CHROME_NON_WINDOWS, SELENESE})
  public void testWillSimulateAKeyUpWhenEnteringTextIntoTextAreas() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyUpArea"));
    element.sendKeys("I like cheese");

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText(), equalTo("I like cheese"));
  }

  @JavascriptEnabled
  @Ignore(CHROME_NON_WINDOWS)
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
  @Ignore(CHROME_NON_WINDOWS)
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
  @Ignore(value = {FIREFOX, IE, CHROME_NON_WINDOWS, SELENESE, CHROME},
          reason = "firefox specific not yet tested in htmlunit. Firefox demands to have the focus on the window already.  Chrome: event firing broken.")
  public void testShouldFireFocusKeyEventsInTheRightOrder() {
    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("theworks"));

    element.sendKeys("a");
    assertThat(result.getText().trim(), is("focus keydown keypress keyup"));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, IE, CHROME, SELENESE}, reason = "firefox-specific")
  public void testShouldReportKeyCodeOfArrowKeys() {
    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys(Keys.ARROW_DOWN);
    assertThat(result.getText().trim(), is("down: 40 press: 40 up: 40"));

    element.sendKeys(Keys.ARROW_UP);
    assertThat(result.getText().trim(), is("down: 38 press: 38 up: 38"));

    element.sendKeys(Keys.ARROW_LEFT);
    assertThat(result.getText().trim(), is("down: 37 press: 37 up: 37"));

    element.sendKeys(Keys.ARROW_RIGHT);
    assertThat(result.getText().trim(), is("down: 39 press: 39 up: 39"));

    // And leave no rubbish/printable keys in the "keyReporter"
    assertThat(element.getValue(), is(""));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE}, reason = "untested user agents")
  public void testShouldReportKeyCodeOfArrowKeysUpDownEvents() {
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
    assertThat(element.getValue(), is(""));
  }

  @JavascriptEnabled
  @Ignore(value = {SELENESE}, reason = "untested user agent")
  public void testNumericNonShiftKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    String numericLineCharsNonShifted = "`1234567890-=[]\\;,.'/42";
    element.sendKeys(numericLineCharsNonShifted);

    assertThat(element.getValue(), is(numericLineCharsNonShifted));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE}, reason = "untested user agent")
  public void testNumericShiftKeys() {
    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    String numericShiftsEtc = "~!@#$%^&*()_+{}:\"<>?|END~";
    element.sendKeys(numericShiftsEtc);

    assertThat(element.getValue(), is(numericShiftsEtc));
    assertThat(result.getText().trim(), containsString(" up: 16"));
  }

  @JavascriptEnabled
  @Ignore(value = {SELENESE}, reason = "untested user agent")
  public void testLowerCaseAlphaKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    String lowerAlphas = "abcdefghijklmnopqrstuvwxyz";
    element.sendKeys(lowerAlphas);

    assertThat(element.getValue(), is(lowerAlphas));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE}, reason = "untested user agents")
  public void testUppercaseAlphaKeys() {
    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    String upperAlphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    element.sendKeys(upperAlphas);

    assertThat(element.getValue(), is(upperAlphas));
    assertThat(result.getText().trim(), containsString(" up: 16"));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, CHROME, SELENESE}, reason = "untested user agents")
  public void testAllPrintableKeys() {
    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    String allPrintable =
        "!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFGHIJKLMNO" +
        "PQRSTUVWXYZ [\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
    element.sendKeys(allPrintable);

    assertThat(element.getValue(), is(allPrintable));
    assertThat(result.getText().trim(), containsString(" up: 16"));
  }

  @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE}, reason = "untested user agents")
  public void testArrowKeysAndPageUpAndDown() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("a" + Keys.LEFT + "b" + Keys.RIGHT +
                     Keys.UP + Keys.DOWN + Keys.PAGE_UP + Keys.PAGE_DOWN + "1");
    assertThat(element.getValue(), is("ba1"));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE}, reason = "untested user agents")
  public void testHomeAndEndAndPageUpAndPageDownKeys() {
    // FIXME: macs don't have HOME keys, would PGUP work?
    if (Platform.getCurrent().is(Platform.MAC)) {
      return;
    }

    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("abc" + Keys.HOME + "0" + Keys.LEFT + Keys.RIGHT +
                     Keys.PAGE_UP + Keys.PAGE_DOWN + Keys.END + "1" + Keys.HOME +
                     "0" + Keys.PAGE_UP + Keys.END + "111" + Keys.HOME + "00");
    assertThat(element.getValue(), is("0000abc1111"));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE}, reason = "untested user agents")
  public void testDeleteAndBackspaceKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("abcdefghi");
    assertThat(element.getValue(), is("abcdefghi"));

    element.sendKeys(Keys.LEFT, Keys.LEFT, Keys.DELETE);
    assertThat(element.getValue(), is("abcdefgi"));

    element.sendKeys(Keys.LEFT, Keys.LEFT, Keys.BACK_SPACE);
    assertThat(element.getValue(), is("abcdfgi"));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE}, reason = "untested user agents")
  public void testSpecialSpaceKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("abcd" + Keys.SPACE + "fgh" + Keys.SPACE + "ij");
    assertThat(element.getValue(), is("abcd fgh ij"));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE}, reason = "untested user agents")
  public void testNumberpadAndFunctionKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("abcd" + Keys.MULTIPLY + Keys.SUBTRACT + Keys.ADD +
                     Keys.DECIMAL + Keys.SEPARATOR + Keys.NUMPAD0 + Keys.NUMPAD9 +
                     Keys.ADD + Keys.SEMICOLON + Keys.EQUALS + Keys.DIVIDE +
                     Keys.NUMPAD3 + "abcd");
    assertThat(element.getValue(), is("abcd*-+.,09+;=/3abcd"));

    element.clear();
    element.sendKeys("FUNCTION" + Keys.F2 + "-KEYS" + Keys.F2);
    element.sendKeys("" + Keys.F2 + "-TOO" + Keys.F2);
    assertThat(element.getValue(), is("FUNCTION-KEYS-TOO"));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE}, reason = "untested user agents")
  public void testShiftSelectionDeletes() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("abcd efgh");
    assertThat(element.getValue(), is("abcd efgh"));

    element.sendKeys(Keys.SHIFT, Keys.LEFT, Keys.LEFT, Keys.LEFT);
    element.sendKeys(Keys.DELETE);
    assertThat(element.getValue(), is("abcd e"));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE}, reason = "untested user agents")
  public void testChordControlHomeShiftEndDelete() {
    // FIXME: macs don't have HOME keys, would PGUP work?
    if (Platform.getCurrent().is(Platform.MAC)) {
      return;
    }

    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFG");

    element.sendKeys(Keys.HOME);
    element.sendKeys("" + Keys.SHIFT + Keys.END + Keys.DELETE);

    assertThat(element.getValue(), is(""));
    assertThat(result.getText(), containsString(" up: 16"));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE}, reason = "untested user agents")
  public void testChordReveseShiftHomeSelectionDeletes() {
    // FIXME: macs don't have HOME keys, would PGUP work?
    if (Platform.getCurrent().is(Platform.MAC)) {
      return;
    }

    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("done" + Keys.HOME);
    assertThat(element.getValue(), is("done"));

    element.sendKeys("" + Keys.SHIFT + "ALL " + Keys.HOME);
    assertThat(element.getValue(), is("ALL done"));

    element.sendKeys(Keys.DELETE);
    assertThat(element.getValue(), is("done"));

    element.sendKeys("" + Keys.END + Keys.SHIFT + Keys.HOME);
    assertThat(element.getValue(), is("done"));
    assertThat(  // Note: trailing SHIFT up here
                 result.getText().trim(), containsString(" up: 16"));

    element.sendKeys("" + Keys.DELETE);
    assertThat(element.getValue(), is(""));
  }

  // control-x control-v here for cut & paste tests, these work on windows
  // and linux, but not on the MAC.

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, CHROME_NON_WINDOWS, SELENESE}, reason = "untested user agents")
  public void testChordControlCutAndPaste() {
    // FIXME: macs don't have HOME keys, would PGUP work?
    if (Platform.getCurrent().is(Platform.MAC)) {
      return;
    }

    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));
    WebElement result = driver.findElement(By.id("result"));

    String paste = "!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFG";
    element.sendKeys(paste);
    assertThat(element.getValue(), is(paste));

    element.sendKeys("" + Keys.HOME + Keys.SHIFT + Keys.END);
    assertThat(result.getText().trim(), containsString(" up: 16"));

    element.sendKeys(Keys.CONTROL, "x");
    assertThat(element.getValue(), is(""));

    element.sendKeys(Keys.CONTROL, "v");
    assertThat(element.getValue(), is(paste));

    element.sendKeys("" + Keys.LEFT + Keys.LEFT + Keys.LEFT +
                     Keys.SHIFT + Keys.END);
    element.sendKeys(Keys.CONTROL, "x" + "v");
    assertThat(element.getValue(), is(paste));

    element.sendKeys(Keys.HOME);
    element.sendKeys(Keys.CONTROL, "v");
    element.sendKeys(Keys.CONTROL, "v" + "v");
    element.sendKeys(Keys.CONTROL, "v" + "v" + "v");
    assertThat(element.getValue(), is("EFGEFGEFGEFGEFGEFG" + paste));

    element.sendKeys("" + Keys.END + Keys.SHIFT + Keys.HOME +
                     Keys.NULL + Keys.DELETE);
    assertThat(element.getValue(), is(""));
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  public void testShouldTypeIntoInputElementsThatHaveNoTypeAttribute() {
    driver.get(pages.formPage);

    WebElement element = driver.findElement(By.id("no-type"));

    element.sendKeys("Should Say Cheese");
    assertThat(element.getValue(), is("Should Say Cheese"));
  }

  @JavascriptEnabled
  @Ignore(value = {CHROME_NON_WINDOWS, SELENESE}, reason = "untested user agents")
  public void testShouldNotTypeIntoElementsThatPreventKeyDownEvents() {
    driver.get(pages.javascriptPage);

    WebElement silent = driver.findElement(By.name("suppress"));

    silent.sendKeys("s");
    assertThat(silent.getValue(), is(""));
  }

  @JavascriptEnabled
  @Ignore(value = {IE, CHROME}, reason = "firefox-specific")
  public void testGenerateKeyPressEventEvenWhenElementPreventsDefault() {
    driver.get(pages.javascriptPage);

    WebElement silent = driver.findElement(By.name("suppress"));
    WebElement result = driver.findElement(By.id("result"));

    silent.sendKeys("s");
    assertThat(result.getText(), containsString("press"));
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, IE, CHROME, SELENESE}, reason = "Chrome: See crbug 20773")
  public void testTypingIntoAnIFrameWithContentEditableOrDesignModeSet() {
    driver.get(pages.richTextPage);

    driver.switchTo().frame("editFrame");
    WebElement element = driver.switchTo().activeElement();
    element.sendKeys("Fishy");

    driver.switchTo().defaultContent();
    WebElement trusted = driver.findElement(By.id("istrusted"));
    WebElement id = driver.findElement(By.id("tagId"));

    assertEquals("[true]", trusted.getText());
    assertEquals("[frameHtml]", id.getText());
  }

  @JavascriptEnabled
  @Ignore(value = {HTMLUNIT, IE, CHROME, SELENESE}, reason = "Chrome: See crbug 20773")
  public void testNonPrintableCharactersShouldWorkWithContentEditableOrDesignModeSet() {
    driver.get(pages.richTextPage);

    // not tested on mac
    if (Platform.getCurrent().is(Platform.MAC)) {
      return;
    }

    driver.switchTo().frame("editFrame");
    WebElement element = driver.switchTo().activeElement();
    element.sendKeys("Dishy", Keys.BACK_SPACE, Keys.LEFT, Keys.LEFT);
    element.sendKeys(Keys.LEFT, Keys.LEFT, "F", Keys.DELETE, Keys.END, "ee!");

    assertEquals("Fishee!", element.getText());
  }
}
