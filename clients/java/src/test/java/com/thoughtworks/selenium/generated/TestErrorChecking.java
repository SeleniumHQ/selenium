package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestErrorChecking.html.
 */
public class TestErrorChecking extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Click", "info");
  
/* !!!Should Fail!!! Tests for expectError and expectFailure commands       */
			// open|./tests/html/test_click_page1.html|
			selenium.open("./tests/html/test_click_page1.html");

		/* These tests should all fail, as they are checking the error checking commands. */

		boolean sawThrow6 = false;
		try {
						// assertText|link|Click here for next page
			assertEquals("Click here for next page", selenium.getText("link"));
		}
		catch (Exception e) {
			sawThrow6 = true;
		}
		verifyTrue(sawThrow6);
		

		boolean sawThrow8 = false;
		try {
						// assertText|link|foo
			assertEquals("foo", selenium.getText("link"));
		}
		catch (Exception e) {
			sawThrow8 = true;
		}
		verifyTrue(sawThrow8);
		

		boolean sawThrow10 = false;
		try {
						// assertText|notAnElement|foo
			assertEquals("foo", selenium.getText("notAnElement"));
		}
		catch (Exception e) {
			sawThrow10 = true;
		}
		verifyTrue(sawThrow10);
		

		checkForVerificationErrors();
	}
}
