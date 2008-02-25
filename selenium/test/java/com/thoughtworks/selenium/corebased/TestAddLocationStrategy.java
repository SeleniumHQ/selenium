package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestAddLocationStrategy.html.
 */
public class TestAddLocationStrategy extends SeleneseTestCase
{
   public void testAddLocationStrategy() throws Throwable {
		try {
			

/* TestAddLocationStrategy */
			// open|../tests/html/test_click_page1.html|
			selenium.open("/selenium-server/tests/html/test_click_page1.html");
			// addLocationStrategy|foo|return inDocument.getElementById(locator);
			selenium.addLocationStrategy("foo", "return inDocument.getElementById(locator);");
			assertTrue(selenium.isElementPresent("foo=link"));
			// refreshAndWait||
			selenium.refresh();
			selenium.waitForPageToLoad("30000");
			assertTrue(selenium.isElementPresent("foo=link"));

			boolean sawThrow8 = false;
			try {
							// addLocationStrategy|bar|[[[;
			selenium.addLocationStrategy("bar", "[[[;");
			}
			catch (Throwable e) {
				sawThrow8 = true;
			}
			assertTrue(sawThrow8);
			
			// addLocationStrategy|bar|thisVariableDoesNotExist;
			selenium.addLocationStrategy("bar", "thisVariableDoesNotExist;");

			boolean sawThrow11 = false;
			try {
							assertTrue(selenium.isElementPresent("bar=link"));
			}
			catch (Throwable e) {
				sawThrow11 = true;
			}
			assertTrue(sawThrow11);
			

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
