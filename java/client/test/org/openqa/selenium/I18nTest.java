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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeFalse;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.FIREFOX;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;

import org.junit.Test;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.TestUtilities;

import java.util.Arrays;
import java.util.List;


public class I18nTest extends JUnit4TestBase {

  /**
   * The Hebrew word shalom (peace) encoded in order Shin (sh) Lamed (L) Vav (O) final-Mem (M).
   */
  private static final String shalom = "\u05E9\u05DC\u05D5\u05DD";


  /**
   * The Hebrew word tmunot (images) encoded in order Taf (t) Mem (m) Vav (u) Nun (n) Vav (o) Taf
   * (t).
   */
  private static final String tmunot = "\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA";

  /**
   * Japanese for "Tokyo"
   */
  private static final String tokyo = "\u6771\u4EAC";

  @Test
  public void testCn() {
    driver.get(pages.chinesePage);
    driver.findElement(By.linkText(Messages.getString("I18nTest.link1"))).click();
  }

  @Test
  @Ignore(value = HTMLUNIT, reason = "Possible bug in getAttribute?")
  public void testEnteringHebrewTextFromLeftToRight() {
    driver.get(pages.chinesePage);
    WebElement input = driver.findElement(By.name("i18n"));

    input.sendKeys(shalom);

    assertEquals(shalom, input.getAttribute("value"));
  }

  @Test
  @Ignore(value = HTMLUNIT, reason = "Possible bug in getAttribute?")
  public void testEnteringHebrewTextFromRightToLeft() {
    driver.get(pages.chinesePage);
    WebElement input = driver.findElement(By.name("i18n"));

    input.sendKeys(tmunot);

    assertEquals(tmunot, input.getAttribute("value"));
  }

  @Test
  @Ignore(
      value = {MARIONETTE, HTMLUNIT, CHROME},
      reason = "CHROME: ChromeDriver only supports characters in the BMP" +
               "MARIONETTE: Doesn't handle first codepoint correctly.")
  public void testEnteringSupplementaryCharacters() {
    assumeFalse("IE: versions less thank 10 have issue 5069",
                TestUtilities.isInternetExplorer(driver) &&
                TestUtilities.getIEVersion(driver) < 10);
    driver.get(pages.chinesePage);

    String input = "";
    input += new String(Character.toChars(0x20000));
    input += new String(Character.toChars(0x2070E));
    input += new String(Character.toChars(0x2000B));
    input += new String(Character.toChars(0x2A190));
    input += new String(Character.toChars(0x2A6B2));

    WebElement el = driver.findElement(By.name("i18n"));
    el.sendKeys(input);

    assertEquals(input, el.getAttribute("value"));
  }

  @NeedsFreshDriver
  @Test
  public void testShouldBeAbleToReturnTheTextInAPage() {
    String url = GlobalTestEnvironment.get()
        .getAppServer()
        .whereIs("encoding");
    driver.get(url);

    String text = driver.findElement(By.tagName("body")).getText();

    assertEquals(shalom, text);
  }

  @NeedsFreshDriver
  @Ignore(value = {IE, CHROME, FIREFOX},
          reason = "Not implemented on anything other than Firefox/Linux at the moment.")
  @NotYetImplemented(HTMLUNIT)
  @Test
  public void testShouldBeAbleToActivateIMEEngine() throws InterruptedException {
    assumeTrue("IME is supported on Linux only.",
               TestUtilities.getEffectivePlatform().is(Platform.LINUX));

    driver.get(pages.formPage);

    WebElement input = driver.findElement(By.id("working"));

    // Activate IME. By default, this keycode activates IBus input for Japanese.
    WebDriver.ImeHandler ime = driver.manage().ime();

    List<String> engines = ime.getAvailableEngines();
    String desiredEngine = "anthy";

    if (!engines.contains(desiredEngine)) {
      System.out.println("Desired engine " + desiredEngine + " not available, skipping test.");
      return;
    }

    ime.activateEngine(desiredEngine);

    int totalWaits = 0;
    while (!ime.isActivated() && (totalWaits < 10)) {
      Thread.sleep(500);
      totalWaits++;
    }
    assertTrue("IME Engine should be activated.", ime.isActivated());
    assertEquals(desiredEngine, ime.getActiveEngine());

    // Send the Romaji for "Tokyo". The space at the end instructs the IME to convert the word.
    input.sendKeys("toukyou ");
    input.sendKeys(Keys.ENTER);

    String elementValue = input.getAttribute("value");

    ime.deactivate();
    assertFalse("IME engine should be off.", ime.isActivated());

    // IME is not present. Don't fail because of that. But it should have the Romaji value
    // instead.
    assertTrue("The elemnt's value should either remain in Romaji or be converted properly."
        + " It was:" + elementValue, elementValue.equals(tokyo));
  }

  @Ignore(value = {IE, CHROME, FIREFOX, HTMLUNIT})
  @Test
  public void testShouldBeAbleToInputJapanese() {
    assumeTrue("IME is supported on Linux only.",
               TestUtilities.getEffectivePlatform().is(Platform.LINUX));

    driver.get(pages.formPage);

    WebElement input = driver.findElement(By.id("working"));

    // Activate IME. By default, this keycode activates IBus input for Japanese.
    input.sendKeys(Keys.ZENKAKU_HANKAKU);

    // Send the Romaji for "Tokyo". The space at the end instructs the IME to convert the word.
    input.sendKeys("toukyou ");

    String elementValue = input.getAttribute("value");
    // Turn OFF IME input first.
    input.sendKeys(Keys.ZENKAKU_HANKAKU);

    // IME is not present. Don't fail because of that. But it should have the Romaji value
    // instead.
    String[] possibleValues = {tokyo, "\uE040" + "toukyou ", "toukyou "};
    assertTrue("The element's value should either remain in Romaji or be converted properly."
        + " It was: -" + elementValue + "-", Arrays.asList(possibleValues).contains(elementValue));
  }

}
