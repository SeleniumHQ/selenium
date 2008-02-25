package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestXPathLocatorInXHtml.html.
 */
public class TestXPathLocatorInXHtml extends SeleneseTestCase
{
   public void testXPathLocatorInXHtml() throws Throwable {
		try {
			

/* Test XPath Locators In XHTML */
			// open|../tests/html/test_locators.xhtml|
			selenium.open("/selenium-server/tests/html/test_locators.xhtml");

			boolean sawThrow4 = false;
			try {
				// originally verifyElementPresent|xpath=//x:body|
						assertTrue(selenium.isElementPresent("xpath=//x:body"));
			}
			catch (Throwable e) {
				sawThrow4 = true;
			}
			verifyFalse(sawThrow4);
			

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
