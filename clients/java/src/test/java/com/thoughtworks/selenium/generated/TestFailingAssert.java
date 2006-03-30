package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestFailingAssert.html.
 */
public class TestFailingAssert extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Failing Assert", "info");
  
/* Test Failing Assert */
			// open|./tests/html/test_verifications.html|
			selenium.open("./tests/html/test_verifications.html");

		boolean sawThrow4 = false;
		try {
						// assertValue|theText|not the text value
			assertEquals("not the text value", selenium.getValue("theText"));
		}
		catch (Exception e) {
			sawThrow4 = true;
		}
		assertTrue(sawThrow4);
		

		boolean sawThrow6 = false;
		try {
						// assertNotValue|theText|the text value
			assertNotEquals("the text value", selenium.getValue("theText"));
		}
		catch (Exception e) {
			sawThrow6 = true;
		}
		assertTrue(sawThrow6);
		

		checkForVerificationErrors();
	}
}
