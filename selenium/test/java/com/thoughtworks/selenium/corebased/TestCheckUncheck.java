package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestCheckUncheck.html.
 */
public class TestCheckUncheck extends SeleneseTestCase
{
   public void testCheckUncheck() throws Throwable {
		try {
			

/* Test check/uncheck of toggle-buttons */

/* "toggle buttons" == check-boxes and radio-buttons */
			// open|../tests/html/test_check_uncheck.html|
			selenium.open("/selenium-server/tests/html/test_check_uncheck.html");

/* check initial state */
			assertTrue(selenium.isChecked("base-spud"));
			assertTrue(!selenium.isChecked("base-rice"));
			assertTrue(selenium.isChecked("option-cheese"));
			assertTrue(!selenium.isChecked("option-onions"));

/* okay, now start pushing buttons */
			// check|base-rice|
			selenium.check("base-rice");
			assertTrue(!selenium.isChecked("base-spud"));
			assertTrue(selenium.isChecked("base-rice"));
			// uncheck|option-cheese|
			selenium.uncheck("option-cheese");
			assertTrue(!selenium.isChecked("option-cheese"));
			// check|option-onions|
			selenium.check("option-onions");
			assertTrue(selenium.isChecked("option-onions"));

/* address elements by name+value */
			assertTrue(!selenium.isChecked("option-chilli"));
			// check|option chilli|
			selenium.check("option chilli");
			assertTrue(selenium.isChecked("option-chilli"));
			// uncheck|option index=3|
			selenium.uncheck("option index=3");
			assertTrue(!selenium.isChecked("option-chilli"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
