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

import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.remote.CapabilityType;

import java.util.Arrays;
import java.util.List;

import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.OPERA;
import static org.openqa.selenium.Ignore.Driver.SELENESE;


public class I18nTest extends AbstractDriverTestCase {

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
  private static final String tokyo = "東京";

  @Ignore({IE, FIREFOX, IPHONE})
  public void testCn() {
    driver.get(pages.chinesePage);
    driver.findElement(By.linkText(Messages.getString("I18nTest.link1"))).click();
  }

  public void testEnteringHebrewTextFromLeftToRight() {
    driver.get(pages.chinesePage);
    WebElement input = driver.findElement(By.name("i18n"));

    input.sendKeys(shalom);

    assertEquals(shalom, input.getAttribute("value"));
  }

  public void testEnteringHebrewTextFromRightToLeft() {
    driver.get(pages.chinesePage);
    WebElement input = driver.findElement(By.name("i18n"));

    input.sendKeys(tmunot);

    assertEquals(tmunot, input.getAttribute("value"));
  }

  @Ignore(value = {IE, SELENESE})
  public void testShouldBeAbleToReturnTheTextInAPage() {
    String url = GlobalTestEnvironment.get()
        .getAppServer()
        .whereIs("encoding");
    driver.get(url);

    String text = driver.findElement(By.tagName("body")) .getText();

    assertEquals(shalom, text);
  }

  @NeedsFreshDriver
  @Ignore(value = {IE, SELENESE, CHROME, HTMLUNIT, FIREFOX, OPERA}, reason="Not implemented on anything other than"
      + "Firefox/Linux at the moment.")
  public void testShouldBeAbleToActivateIMEEngine() throws InterruptedException {
    if (!Platform.getCurrent().is(Platform.LINUX)) {
      System.out.println("Skipping test because IME is supported on Linux only.");
      return;
    }

    if (!(driver instanceof HasCapabilities)) {
      System.out.println("Cannot query driver for native events capabilities -"
          + " no point in testing IME input.");
      return;
    }

    Capabilities capabilities = ((HasCapabilities) driver).getCapabilities();
    if (!(Boolean) capabilities.getCapability(CapabilityType.HAS_NATIVE_EVENTS)) {
      System.out.println("Native events are disabled, IME will not work.");
      return;
    }

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
    while (! ime.isActivated() && (totalWaits < 10)) {
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

  @Ignore(value = {IE, SELENESE, CHROME, HTMLUNIT, OPERA}, reason="Not implemented on anything other than"
      + "Firefox/Linux at the moment.")
  public void testShouldBeAbleToInputJapanese() {
    if (!Platform.getCurrent().is(Platform.LINUX)) {
      System.out.println("Skipping test because IME is supported on Linux only.");
      return;
    }

    if (!(driver instanceof HasCapabilities)) {
      System.out.println("Cannot query driver for native events capabilities -"
          + " no point in testing IME input.");
      return;
    }

    Capabilities capabilities = ((HasCapabilities) driver).getCapabilities();
    if (!(Boolean) capabilities.getCapability(CapabilityType.HAS_NATIVE_EVENTS)) {
      System.out.println("Native events are disabled, IME will not work.");
      return;
    }

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
    assertTrue("The elemnt's value should either remain in Romaji or be converted properly."
        + " It was: -" + elementValue + "-", Arrays.asList(possibleValues).contains(elementValue));
  }

}
