package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestErrorChecking.html.
 */
public class TestErrorChecking extends SeleneseTestCase
{
   public void test() throws Throwable {
   	try {
  
/* !!!Should Fail!!! Tests for expectError and expectFailure commands       */
		// open|./tests/html/test_click_page1.html|
		selenium.open("/selenium-server/tests/html/test_click_page1.html");
		// verifyText|link|Click here for next page
		verifyEquals("Click here for next page", selenium.getText("link"));

		/* These tests should all fail, as they are checking the error checking commands. */

		boolean sawThrow7 = false;
		try {
					// assertText|link|foo
		assertEquals("foo", selenium.getText("link"));
		}
		catch (Throwable e) {
			sawThrow7 = true;
		}
		verifyTrue(sawThrow7);
		

		boolean sawThrow9 = false;
		try {
					// assertText|notAnElement|foo
		assertEquals("foo", selenium.getText("notAnElement"));
		}
		catch (Throwable e) {
			sawThrow9 = true;
		}
		verifyTrue(sawThrow9);
		

		checkForVerificationErrors();
            }
            finally {
            	clearVerificationErrors();
            }
	}
}
