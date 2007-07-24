package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestFocusOnBlur.html.
 */
public class TestFocusOnBlur extends SeleneseTestCase
{
   public void testFocusOnBlur() throws Throwable {
		try {
			

/* Test Focus On Blur */
			// open|../tests/html/test_focus_on_blur.html|
			selenium.open("/selenium-server/tests/html/test_focus_on_blur.html");
			// type|testInput|test
			selenium.type("testInput", "test");
			// fireEvent|testInput|blur
			selenium.fireEvent("testInput", "blur");
			// verifyAlert|Bad value|
			verifyEquals("Bad value", selenium.getAlert());
			// type|testInput|somethingelse
			selenium.type("testInput", "somethingelse");

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
