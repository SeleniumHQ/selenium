package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestQuickOpen.html.
 */
public class TestQuickOpen extends SeleneseTestCase
{
   public void testQuickOpen() throws Throwable {
		try {
			

/* Test Quick Open */

			/* >>>>>setTimeout//////5000//////<<<<<
 */
			// open|../tests/html/test_open.html|
			selenium.open("/selenium-server/tests/html/test_open.html");
			// open|../tests/html/test_page.slow.html|
			selenium.open("/selenium-server/tests/html/test_page.slow.html");
			assertTrue(selenium.isTextPresent("This is a slow-loading page"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
