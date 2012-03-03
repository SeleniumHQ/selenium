package org.openqa.selenium;

import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;

import static org.junit.Assert.assertEquals;

/**
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class ErrorsTest extends JUnit4TestBase {

  /**
   * Regression test for Selenium RC issue 363.
   * http://code.google.com/p/selenium/issues/detail?id=363
   * <p/>
   * This will trivially pass on browsers that do not support the onerror handler (e.g. Internet
   * Explorer).
   */
  @JavascriptEnabled
  @Ignore(value = Ignore.Driver.IE, reason = "IE does not support onerror")
  @Test
  public void testShouldNotGenerateErrorsWhenOpeningANewPage() {
    driver.get(pages.errorsPage);
    Object result = ((JavascriptExecutor) driver).
        executeScript("return window.ERRORS.join('\\n');");
    assertEquals("Should have no errors", "", result);
  }
}
