package org.openqa.selenium;

/**
 * Bug 126 identified an instance where the HtmlUnitDriver threw a NullPointerException, {@see <a
 * href=http://code.google.com/p/webdriver/issues/detail?id=126>link to bug 126 </a>} This testsuite
 * calls various methods to confirm the expected NPEs happen, once HtmlUnitDriver (and any others if
 * necessary) is fixed they'll serve as regression tests :)
 */
public class ObjectStateAssumptions extends AbstractDriverTestCase {

  /**
   * <p>This test checks various assumptions (which currently fail for the HtmlUnitDriver).
   */
  public void testUninitializedWebDriverDoesNotThrowNPE() {
    try {
      variousMethodCallsToCheckAssumptions();
    } catch (NullPointerException npe) {
      throw new IllegalStateException("Assumptions broken for a fresh WebDriver instance", npe);
    }
  }

  /**
   * This test case differs from @see testUninitializedWebDriverDoesNotThrowNPE as it initializes
   * WebDriver with an initial call to get(). It also should not fail.
   */
  public void testinitializedWebDriverDoesNotThrowNPE() {
    driver.get(simpleTestPage);
    try {
      variousMethodCallsToCheckAssumptions();
    } catch (NullPointerException npe) {
      throw new IllegalStateException(
          "Assumptions broken for WebDriver instance after get() called", npe);
    }
  }

  /**
   * Add the various method calls you want to try here...
   */
  private void variousMethodCallsToCheckAssumptions() {
    driver.getCurrentUrl();
    driver.getTitle();
    driver.getPageSource();
    By byHtml = By.xpath("//html");
    driver.findElement(byHtml);
    driver.findElements(byHtml);
  }

  /**
   * Test the various options, again for an uninitialized driver, NPEs are thrown.
   */
  public void testOptionsForUninitializedWebDriver() {
    WebDriver.Options options = driver.manage();
    try {
      options.getCookies();
    } catch (NullPointerException npe) {
      throw new IllegalStateException("Assumptions broken for a fresh WebDriver instance", npe);
    }
  }
}
