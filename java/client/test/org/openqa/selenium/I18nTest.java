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
import static org.junit.Assume.assumeFalse;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.CHROMIUMEDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.MARIONETTE;

import org.junit.Test;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.TestUtilities;

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

  /**
   * Chinese for "The Voice of China"
   */
  private static final String theVoiceOfChina = "\u4E2D\u56FD\u4E4B\u58F0";

  @Test
  public void testCn() {
    driver.get(pages.chinesePage);
    driver.findElement(By.linkText(theVoiceOfChina)).click();
  }

  @Test
  public void testEnteringHebrewTextFromLeftToRight() {
    driver.get(pages.chinesePage);
    WebElement input = driver.findElement(By.name("i18n"));

    input.sendKeys(shalom);

    assertThat(input.getAttribute("value")).isEqualTo(shalom);
  }

  @Test
  public void testEnteringHebrewTextFromRightToLeft() {
    driver.get(pages.chinesePage);
    WebElement input = driver.findElement(By.name("i18n"));

    input.sendKeys(tmunot);

    assertThat(input.getAttribute("value")).isEqualTo(tmunot);
  }

  @Test
  @Ignore(value = CHROME, reason = "ChromeDriver only supports characters in the BMP")
  @Ignore(value = CHROMIUMEDGE, reason = "EdgeDriver only supports characters in the BMP")
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

    assertThat(el.getAttribute("value")).isEqualTo(input);
  }

  @Test
  public void testShouldBeAbleToReturnTheTextInAPage() {
    String url = GlobalTestEnvironment.get()
        .getAppServer()
        .whereIs("encoding");
    driver.get(url);

    String text = driver.findElement(By.tagName("body")).getText();

    assertThat(text).isEqualTo(shalom);
  }

  @Test
  @Ignore(IE)
  @Ignore(CHROME)
  @Ignore(CHROMIUMEDGE)
  @Ignore(FIREFOX)
  @Ignore(MARIONETTE)
  @NotYetImplemented(HTMLUNIT)
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
    assertThat(ime.isActivated()).isTrue();
    assertThat(ime.getActiveEngine()).isEqualTo(desiredEngine);

    // Send the Romaji for "Tokyo". The space at the end instructs the IME to transform the word.
    input.sendKeys("toukyou ");
    input.sendKeys(Keys.ENTER);

    String elementValue = input.getAttribute("value");

    ime.deactivate();
    assertThat(ime.isActivated()).isFalse();

    // IME is not present. Don't fail because of that. But it should have the Romaji value
    // instead.
    assertThat(elementValue)
        .describedAs("The elemnt's value should either remain in Romaji or be converted properly.")
        .isEqualTo(tokyo);
  }

  @Test
  @Ignore(IE)
  @Ignore(CHROME)
  @Ignore(CHROMIUMEDGE)
  @Ignore(FIREFOX)
  public void testShouldBeAbleToInputJapanese() {
    assumeTrue("IME is supported on Linux only.",
               TestUtilities.getEffectivePlatform().is(Platform.LINUX));

    driver.get(pages.formPage);

    WebElement input = driver.findElement(By.id("working"));

    // Activate IME. By default, this keycode activates IBus input for Japanese.
    input.sendKeys(Keys.ZENKAKU_HANKAKU);

    // Send the Romaji for "Tokyo". The space at the end instructs the IME to transform the word.
    input.sendKeys("toukyou ");

    String elementValue = input.getAttribute("value");
    // Turn OFF IME input first.
    input.sendKeys(Keys.ZENKAKU_HANKAKU);

    // IME is not present. Don't fail because of that. But it should have the Romaji value
    // instead.
    assertThat(elementValue)
        .describedAs("The element's value should either remain in Romaji or be converted properly.")
        .isIn(tokyo, "\uE040" + "toukyou ", "toukyou ");
  }

}
