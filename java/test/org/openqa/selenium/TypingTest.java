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

import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;

import static com.google.common.base.Joiner.on;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.testing.TestUtilities.getEffectivePlatform;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

public class TypingTest extends JupiterTestBase {

  private static void checkRecordedKeySequence(WebElement element, int expectedKeyCode) {
    assertThat(element.getText().trim()).contains(
      String.format("down: %1$d", expectedKeyCode),
      String.format("up: %1$d", expectedKeyCode));
  }

  private static String getValueText(WebElement el) {
    // Standardize on \n and strip any trailing whitespace.
    return el.getAttribute("value").replace("\r\n", "\n").trim();
  }

  private Keys primaryModifier() {
    return (getEffectivePlatform(driver).is(Platform.MAC)) ? Keys.COMMAND : Keys.CONTROL;
  }

  private Keys homeKey() {
    return (getEffectivePlatform(driver).is(Platform.MAC)) ? Keys.UP : Keys.HOME;
  }

  private Keys endKey() {
    return (getEffectivePlatform(driver).is(Platform.MAC)) ? Keys.DOWN : Keys.END;
  }

  @Test
  public void testShouldFireKeyPressEvents() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("a");

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText()).contains("press:");
  }

  @Test
  public void testShouldFireKeyDownEvents() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("I");

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText()).contains("down:");
  }

  @Test
  public void testShouldFireKeyUpEvents() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("a");

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText()).contains("up:");
  }

  @Test
  public void testShouldTypeLowerCaseLetters() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("abc def");

    assertThat(keyReporter.getAttribute("value")).isEqualTo("abc def");
  }

  @Test
  public void testShouldBeAbleToTypeCapitalLetters() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("ABC DEF");

    assertThat(keyReporter.getAttribute("value")).isEqualTo("ABC DEF");
  }

  @Test
  public void testShouldBeAbleToTypeQuoteMarks() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("\"");

    assertThat(keyReporter.getAttribute("value")).isEqualTo("\"");
  }

  @Test
  public void testShouldBeAbleToTypeTheAtCharacter() {
    // simon: I tend to use a US/UK or AUS keyboard layout with English
    // as my primary language. There are consistent reports that we're
    // not handling i18nised keyboards properly. This test exposes this
    // in a lightweight manner when my keyboard is set to the DE mapping
    // and we're using IE.

    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("@");

    assertThat(keyReporter.getAttribute("value")).isEqualTo("@");
  }

  @Test
  public void testShouldBeAbleToMixUpperAndLowerCaseLetters() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("me@eXample.com");

    assertThat(keyReporter.getAttribute("value")).isEqualTo("me@eXample.com");
  }

  @Test
  public void testArrowKeysShouldNotBePrintable() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys(Keys.ARROW_LEFT);

    assertThat(keyReporter.getAttribute("value")).isEqualTo("");
  }

  @Test
  public void testShouldBeAbleToUseArrowKeys() {
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("tet", Keys.ARROW_LEFT, "s");

    assertThat(keyReporter.getAttribute("value")).isEqualTo("test");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testWillSimulateAKeyUpWhenEnteringTextIntoInputElements() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyUp"));
    element.sendKeys("I like cheese");

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText()).isEqualTo("I like cheese");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testWillSimulateAKeyDownWhenEnteringTextIntoInputElements() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyDown"));
    element.sendKeys("I like cheese");

    WebElement result = driver.findElement(By.id("result"));
    // Because the key down gets the result before the input element is
    // filled, we're a letter short here
    assertThat(result.getText()).isEqualTo("I like chees");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testWillSimulateAKeyPressWhenEnteringTextIntoInputElements() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyPress"));
    element.sendKeys("I like cheese");

    WebElement result = driver.findElement(By.id("result"));
    // Because the key down gets the result before the input element is
    // filled, we're a letter short here
    assertThat(result.getText()).isEqualTo("I like chees");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testWillSimulateAKeyUpWhenEnteringTextIntoTextAreas() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyUpArea"));
    element.sendKeys("I like cheese");

    WebElement result = driver.findElement(By.id("result"));
    assertThat(result.getText()).isEqualTo("I like cheese");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testWillSimulateAKeyDownWhenEnteringTextIntoTextAreas() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyDownArea"));
    element.sendKeys("I like cheese");

    WebElement result = driver.findElement(By.id("result"));
    // Because the key down gets the result before the input element is
    // filled, we're a letter short here
    assertThat(result.getText()).isEqualTo("I like chees");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testWillSimulateAKeyPressWhenEnteringTextIntoTextAreas() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyPressArea"));
    element.sendKeys("I like cheese");

    WebElement result = driver.findElement(By.id("result"));
    // Because the key down gets the result before the input element is
    // filled, we're a letter short here
    assertThat(result.getText()).isEqualTo("I like chees");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testShouldFireFocusKeyEventsInTheRightOrder() {
    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("theworks"));

    element.sendKeys("a");
    assertThat(result.getText().trim()).isEqualTo("focus keydown keypress keyup");
  }

  @Test
  public void testShouldReportKeyCodeOfArrowKeys() {
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
    assertThat(element.getAttribute("value")).isEqualTo("");
  }

  @Test
  public void testShouldReportKeyCodeOfArrowKeysUpDownEvents() {
    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys(Keys.ARROW_DOWN);
    assertThat(result.getText().trim()).contains("down: 40", "up: 40");

    element.sendKeys(Keys.ARROW_UP);
    assertThat(result.getText().trim()).contains("down: 38", "up: 38");

    element.sendKeys(Keys.ARROW_LEFT);
    assertThat(result.getText().trim()).contains("down: 37", "up: 37");

    element.sendKeys(Keys.ARROW_RIGHT);
    assertThat(result.getText().trim()).contains("down: 39", "up: 39");

    // And leave no rubbish/printable keys in the "keyReporter"
    assertThat(element.getAttribute("value")).isEqualTo("");
  }

  @Test
  public void testNumericNonShiftKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    String numericLineCharsNonShifted = "`1234567890-=[]\\;,.'/42";
    element.sendKeys(numericLineCharsNonShifted);

    assertThat(element.getAttribute("value")).isEqualTo(numericLineCharsNonShifted);
  }

  @Test
  @Ignore(value = FIREFOX,
    reason = "Final assertion isn't 16 since keyUp not sent from shift",
    issue = "https://github.com/mozilla/geckodriver/issues/646")
  public void testNumericShiftKeys() {
    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    String numericShiftsEtc = "~!@#$%^&*()_+{}:\"<>?|END~";
    element.sendKeys(numericShiftsEtc);

    assertThat(element.getAttribute("value")).isEqualTo(numericShiftsEtc);
    assertThat(result.getText().trim()).contains(" up: 16");
  }

  @Test
  public void testLowerCaseAlphaKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    String lowerAlphas = "abcdefghijklmnopqrstuvwxyz";
    element.sendKeys(lowerAlphas);

    assertThat(element.getAttribute("value")).isEqualTo(lowerAlphas);
  }

  @Test
  @Ignore(value = FIREFOX,
    reason = "Final assertion isn't 16 since keyUp not sent from shift",
    issue = "https://github.com/mozilla/geckodriver/issues/646")
  public void testUppercaseAlphaKeys() {
    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    String upperAlphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    element.sendKeys(upperAlphas);

    assertThat(element.getAttribute("value")).isEqualTo(upperAlphas);
    assertThat(result.getText().trim()).contains(" up: 16");
  }

  @Test
  @Ignore(value = FIREFOX,
    reason = "Final assertion isn't 16 since keyUp not sent from shift",
    issue = "https://github.com/mozilla/geckodriver/issues/646")
  public void testAllPrintableKeys() {
    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    String allPrintable =
        "!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFGHIJKLMNO" +
        "PQRSTUVWXYZ [\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
    element.sendKeys(allPrintable);

    assertThat(element.getAttribute("value")).isEqualTo(allPrintable);
    assertThat(result.getText().trim()).contains(" up: 16");
  }

  @Test
  public void testArrowKeysAndPageUpAndDown() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("a" + Keys.LEFT + "b" + Keys.RIGHT +
                     Keys.UP + Keys.DOWN + Keys.PAGE_UP + Keys.PAGE_DOWN + "1");
    assertThat(element.getAttribute("value")).isEqualTo("ba1");
  }

  @Test
  @Ignore(value = FIREFOX,
    reason = "Firefox can't type at beginning of field",
    issue = "https://github.com/mozilla/geckodriver/issues/2015")
  public void testHomeAndEndAndPageUpAndPageDownKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("abc" + homeKey() + "0" + Keys.LEFT + Keys.RIGHT +
                     Keys.PAGE_UP + Keys.PAGE_DOWN + endKey() + "1" + homeKey() +
                     "0" + Keys.PAGE_UP + endKey() + "111" + homeKey() + "00");
    assertThat(element.getAttribute("value")).isEqualTo("0000abc1111");
  }

  @Test
  public void testDeleteAndBackspaceKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("abcdefghi");
    assertThat(element.getAttribute("value")).isEqualTo("abcdefghi");

    element.sendKeys(Keys.LEFT, Keys.LEFT, Keys.DELETE);
    assertThat(element.getAttribute("value")).isEqualTo("abcdefgi");

    element.sendKeys(Keys.LEFT, Keys.LEFT, Keys.BACK_SPACE);
    assertThat(element.getAttribute("value")).isEqualTo("abcdfgi");
  }

  @Test
  public void testSpecialSpaceKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("abcd" + Keys.SPACE + "fgh" + Keys.SPACE + "ij");
    assertThat(element.getAttribute("value")).isEqualTo("abcd fgh ij");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "Enters dot instead of comma")
  public void testNumberPadKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("abcd" + Keys.MULTIPLY + Keys.SUBTRACT + Keys.ADD +
                     Keys.DECIMAL + Keys.SEPARATOR + Keys.NUMPAD0 + Keys.NUMPAD9 +
                     Keys.ADD + Keys.SEMICOLON + Keys.EQUALS + Keys.DIVIDE +
                     Keys.NUMPAD3 + "abcd");
    assertThat(element.getAttribute("value")).isEqualTo("abcd*-+.,09+;=/3abcd");
  }

  @Test
  @Ignore(value = IE, reason = "F4 triggers address bar")
  public void testFunctionKeys() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("FUNCTION" + Keys.F4 + "-KEYS" + Keys.F4);
    element.sendKeys("" + Keys.F4 + "-TOO" + Keys.F4);
    assertThat(element.getAttribute("value")).isEqualTo("FUNCTION-KEYS-TOO");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShiftSelectionDeletes() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("abcd efgh");
    assertThat(element.getAttribute("value")).isEqualTo("abcd efgh");

    element.sendKeys(Keys.SHIFT, Keys.LEFT, Keys.LEFT, Keys.LEFT);
    element.sendKeys(Keys.DELETE);
    assertThat(element.getAttribute("value")).isEqualTo("abcd e");
  }

  @Test
  public void testChordControlHomeShiftEndDelete() {

    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFG");

    element.sendKeys(endKey());
    element.sendKeys("" + Keys.SHIFT + homeKey());

    element.sendKeys(Keys.DELETE);
    assertThat(element.getAttribute("value")).isEqualTo("");
  }

  @Test
  @Ignore(value = FIREFOX,
    reason = "Firefox can't type at beginning of field",
    issue = "https://github.com/mozilla/geckodriver/issues/2015")
  public void testChordReverseShiftHomeSelectionDeletes() {
    driver.get(pages.javascriptPage);

    WebElement result = driver.findElement(By.id("result"));
    WebElement element = driver.findElement(By.id("keyReporter"));

    element.sendKeys("done" + homeKey());
    assertThat(element.getAttribute("value")).isEqualTo("done");

    element.sendKeys(Keys.SHIFT + "all " + homeKey());
    assertThat(element.getAttribute("value")).isEqualTo("ALL done");

    element.sendKeys(Keys.DELETE);
    assertThat(element.getAttribute("value")).isEqualTo("done");

    element.sendKeys("" + endKey() + Keys.SHIFT + homeKey());
    assertThat(element.getAttribute("value")).isEqualTo("done");
    assertThat(result.getText().trim()).contains(" up: 16");

    element.sendKeys(Keys.DELETE);
    assertThat(element.getAttribute("value")).isEqualTo("");
  }

  @Test
  @Ignore(value = FIREFOX,
    reason = "Firefox can't type at beginning of field",
    issue = "https://github.com/mozilla/geckodriver/issues/2015")
  public void testChordControlCutAndPaste() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("keyReporter"));

    String paste = "!\"#$%&'()*+,-./0123456789:;<=>?@ ABCDEFG";
    element.sendKeys(paste);
    assertThat(element.getAttribute("value")).isEqualTo(paste);

    element.sendKeys(homeKey());
    element.sendKeys("" + homeKey() + Keys.SHIFT + endKey());

    element.sendKeys(primaryModifier(), "x");
    assertThat(element.getAttribute("value")).isEqualTo("");

    element.sendKeys(primaryModifier(), "v");
    wait.until(elementValueToEqual(element, paste));

    // Cut the last 3 letters.
    element.sendKeys("" + Keys.LEFT + Keys.LEFT + Keys.LEFT + Keys.SHIFT + endKey());

    element.sendKeys(primaryModifier(), "x");
    assertThat(element.getAttribute("value")).isEqualTo(paste.substring(0, paste.length() - 3));

    // Paste the last 3 letters.
    element.sendKeys(primaryModifier(), "v");
    assertThat(element.getAttribute("value")).isEqualTo(paste);

    element.sendKeys(homeKey());
    element.sendKeys(primaryModifier(), "v");
    element.sendKeys(primaryModifier(), "v" + "v");
    element.sendKeys(primaryModifier(), "v" + "v" + "v");
    assertThat(element.getAttribute("value")).isEqualTo("EFGEFGEFGEFGEFGEFG" + paste);

    element.sendKeys("" + Keys.END + Keys.SHIFT + homeKey() + Keys.NULL + Keys.DELETE);
    assertThat(element.getAttribute("value")).isEqualTo("");
  }

  @Test
  public void testShouldTypeIntoInputElementsThatHaveNoTypeAttribute() {
    driver.get(pages.formPage);

    WebElement element = driver.findElement(By.id("no-type"));

    element.sendKeys("should say cheese");
    assertThat(element.getAttribute("value")).isEqualTo("should say cheese");
  }

  @Test
  public void testShouldNotTypeIntoElementsThatPreventKeyDownEvents() {
    driver.get(pages.javascriptPage);

    WebElement silent = driver.findElement(By.name("suppress"));

    silent.sendKeys("s");
    assertThat(silent.getAttribute("value")).isEqualTo("");
  }

  @Test
  @NotYetImplemented(value = SAFARI, reason = "getText does not normalize spaces")
  public void testGenerateKeyPressEventEvenWhenElementPreventsDefault() {
    driver.get(pages.javascriptPage);

    WebElement silent = driver.findElement(By.name("suppress"));
    WebElement result = driver.findElement(By.id("result"));

    silent.sendKeys("s");
    assertThat(result.getText().trim()).isIn("", "mouseover");
  }

  @Test
  public void testShouldBeAbleToTypeOnAnEmailInputField() {
    driver.get(pages.formPage);
    WebElement email = driver.findElement(By.id("email"));
    email.sendKeys("foobar");
    assertThat(email.getAttribute("value")).isEqualTo("foobar");
  }

  @Test
  public void testShouldBeAbleToTypeOnANumberInputField() {
    driver.get(pages.formPage);
    WebElement email = driver.findElement(By.id("age"));
    email.sendKeys("33");
    assertThat(email.getAttribute("value")).isEqualTo("33");
  }

  @Test
  public void testShouldThrowIllegalArgumentException() {
    driver.get(pages.formPage);
    WebElement email = driver.findElement(By.id("age"));
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> email.sendKeys((CharSequence[]) null));
  }

  @Test
  public void canSafelyTypeOnElementThatIsRemovedFromTheDomOnKeyPress() {
    driver.get(appServer.whereIs("key_tests/remove_on_keypress.html"));

    WebElement input = driver.findElement(By.id("target"));
    WebElement log = driver.findElement(By.id("log"));

    assertThat(log.getAttribute("value")).isEqualTo("");

    input.sendKeys("b");
    assertThat(getValueText(log)).isEqualTo(on('\n').join(
        "keydown (target)",
        "keyup (target)",
        "keyup (body)"));

    input.sendKeys("a");

    // Some drivers (IE, Firefox) do not always generate the final keyup event since the element
    // is removed from the DOM in response to the keypress (note, this is a product of how events
    // are generated and does not match actual user behavior).
    String expected = String.join("\n",
        "keydown (target)",
        "keyup (target)",
        "keyup (body)",
        "keydown (target)",
        "a pressed; removing");
    assertThat(getValueText(log)).isIn(expected, expected + "\nkeyup (body)");
  }

  @Test
  public void canClearNumberInputAfterTypingInvalidInput() {
    driver.get(pages.formPage);
    WebElement input = driver.findElement(By.id("age"));
    input.sendKeys("e");
    input.clear();
    input.sendKeys("3");
    assertThat(input.getAttribute("value")).isEqualTo("3");
  }

  @Test
  public void canTypeSingleNewLineCharacterIntoTextArea() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("emptyTextArea"));
    element.sendKeys("\n");
    shortWait.until(ExpectedConditions.attributeToBe(element, "value", "\n"));
  }

  @Test
  public void canTypeMultipleNewLineCharactersIntoTextArea() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("emptyTextArea"));
    element.sendKeys("\n\n\n");
    shortWait.until(ExpectedConditions.attributeToBe(element, "value", "\n\n\n"));
  }
}
