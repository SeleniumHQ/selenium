package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestVerifyAlertsFailures.html.
 */
public class TestVerifyAlertsFailures extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Alert Verification", "info");
  
/* Test Alert verifyment Failures       */
		// open|./tests/html/test_verify_alert.html|
		selenium.open("./tests/html/test_verify_alert.html");

		boolean sawThrow4 = false;
		try {
					// assertAlert|noAlert|
		assertEquals("noAlert", selenium.getAlert());
		}
		catch (Throwable e) {
			sawThrow4 = true;
		}
		verifyTrue(sawThrow4);
		
		// click|oneAlert|
		selenium.click("oneAlert");

		boolean sawThrow7 = false;
		try {
					// assertAlert|wrongAlert|
		assertEquals("wrongAlert", selenium.getAlert());
		}
		catch (Throwable e) {
			sawThrow7 = true;
		}
		verifyTrue(sawThrow7);
		
		// click|twoAlerts|
		selenium.click("twoAlerts");

		boolean sawThrow10 = false;
		try {
					// assertAlert|Store Below 429 degrees F!|
		assertEquals("Store Below 429 degrees F!", selenium.getAlert());
		}
		catch (Throwable e) {
			sawThrow10 = true;
		}
		verifyTrue(sawThrow10);
		

		boolean sawThrow12 = false;
		try {
					// assertAlert|Store Below 220 degrees C!|
		assertEquals("Store Below 220 degrees C!", selenium.getAlert());
		}
		catch (Throwable e) {
			sawThrow12 = true;
		}
		verifyTrue(sawThrow12);
		
		// click|oneAlert|
		selenium.click("oneAlert");

		boolean sawThrow15 = false;
		try {
					// open|./tests/html/test_assert_alert.html|
		selenium.open("./tests/html/test_assert_alert.html");
		}
		catch (Throwable e) {
			sawThrow15 = true;
		}
		assertTrue(sawThrow15);
		

		checkForVerificationErrors();
	}
}
