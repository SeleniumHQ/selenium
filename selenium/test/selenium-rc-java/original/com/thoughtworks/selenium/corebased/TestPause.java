package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestPause.html.
 */
public class TestPause extends SeleneseTestCase
{
   public void testPause() throws Throwable {
		try {
			

/* Test Select and Pause for Reload */
			// open|../tests/html/test_reload_onchange_page.html|
			selenium.open("/selenium-server/tests/html/test_reload_onchange_page.html");

			/* Make sure we can pause even when the page doesn't change */
			// pause|100|
			pause(100);
			// verifyTitle|Reload Page
			verifyEquals("*Reload Page", selenium.getTitle());

			boolean sawThrow8 = false;
			try {
				// originally verifyElementPresent|theSelect|
						assertTrue(selenium.isElementPresent("theSelect"));
			}
			catch (Throwable e) {
				sawThrow8 = true;
			}
			verifyFalse(sawThrow8);
			
			// select|theSelect|Second Option
			selenium.select("theSelect", "Second Option");

			/* Make sure we can pause to wait for a page reload */

			/* Must pause longer than the slow-loading page takes (500ms) */
			// pause|5000|
			pause(5000);
			// verifyTitle|Slow Loading Page|
			verifyEquals("*Slow Loading Page", selenium.getTitle());

			boolean sawThrow16 = false;
			try {
				// originally verifyElementNotPresent|theSelect|
						assertTrue(!selenium.isElementPresent("theSelect"));
			}
			catch (Throwable e) {
				sawThrow16 = true;
			}
			verifyFalse(sawThrow16);
			

			boolean sawThrow17 = false;
			try {
				// originally verifyElementPresent|theSpan|
						assertTrue(selenium.isElementPresent("theSpan"));
			}
			catch (Throwable e) {
				sawThrow17 = true;
			}
			verifyFalse(sawThrow17);
			

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
