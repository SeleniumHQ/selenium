package org.openqa.selenium;


public class I18nTest extends AbstractDriverTestCase {
  /**
   * The Hebrew word shalom (peace) encoded in order
   * Shin (sh) Lamed (L) Vav (O) final-Mem (M).
   */
  private static final String shalom = "\u05E9\u05DC\u05D5\u05DD";


  /**
   * The Hebrew word tmunot (images) encoded in order
   * Taf (t) Mem (m) Vav (u) Nun (n) Vav (o) Taf (t).
   */
  private static final String tmunot = "\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA";

  @Ignore("safari, htmlunit, jobbie, firefox")
  public void testCn() {
    driver.get(chinesePage);
    driver.findElement(By.linkText(Messages.getString("I18nTest.link1"))).click();
  }

  @Ignore("safari, remote")
  public void testEnteringHebrewTextFromLeftToRight() {
    driver.get(chinesePage);
    WebElement input = driver.findElement(By.name("i18n"));

    input.sendKeys(shalom);

    assertEquals(shalom, input.getValue());
  }

  @Ignore("safari, remote")
  public void testEnteringHebrewTextFromRightToLeft() {
    driver.get(chinesePage);
    WebElement input = driver.findElement(By.name("i18n"));

    input.sendKeys(tmunot);

    assertEquals(tmunot, input.getValue());
  }
}
