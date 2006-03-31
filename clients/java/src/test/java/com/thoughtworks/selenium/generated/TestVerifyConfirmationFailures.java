package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestVerifyConfirmationFailures.html.
 */
public class TestVerifyConfirmationFailures extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Alert Verification", "info");
  
/* Test verify confirmation Failures       */
		// open|./tests/html/test_confirm.html|
		selenium.open("./tests/html/test_confirm.html");

		boolean sawThrow4 = false;
		try {
					// assertConfirmation|This should fail - there are no confirmations|
		assertEquals("This should fail - there are no confirmations", selenium.getConfirmation());
		}
		catch (Throwable e) {
			sawThrow4 = true;
		}
		verifyTrue(sawThrow4);
		
		// clickAndWait|confirmAndLeave|
		selenium.click("confirmAndLeave");
		selenium.waitForPageToLoad("60000");

		boolean sawThrow7 = false;
		try {
					// assertConfirmation|this should fail - wrong confirmation|
		assertEquals("this should fail - wrong confirmation", selenium.getConfirmation());
		}
		catch (Throwable e) {
			sawThrow7 = true;
		}
		verifyTrue(sawThrow7);
		
		// open|./tests/html/test_confirm.html|
		selenium.open("./tests/html/test_confirm.html");
		// clickAndWait|confirmAndLeave|
		selenium.click("confirmAndLeave");
		selenium.waitForPageToLoad("60000");

		boolean sawThrow11 = false;
		try {
					// open|./tests/html/test_confirm.html|
		selenium.open("./tests/html/test_confirm.html");
		}
		catch (Throwable e) {
			sawThrow11 = true;
		}
		assertTrue(sawThrow11);
		

		checkForVerificationErrors();
	}
}
