package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestCheckUncheck.html.
 */
public class TestCheckUncheck extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test check/uncheck of toggle-buttons", "info");
  
/* Test check/uncheck of toggle-buttons */

/* "toggle buttons" == check-boxes and radio-buttons */
		// open|./tests/html/test_check_uncheck.html|
		selenium.open("./tests/html/test_check_uncheck.html");

/* check initial state */
		// verifyChecked|base-spud|true
		verifyEquals("true", selenium.getChecked("base-spud"));
		// verifyNotChecked|base-rice|true
		verifyNotEquals("true", selenium.getChecked("base-rice"));
		// verifyChecked|option-cheese|true
		verifyEquals("true", selenium.getChecked("option-cheese"));
		// verifyNotChecked|option-onions|true
		verifyNotEquals("true", selenium.getChecked("option-onions"));

/* okay, now start pushing buttons */
		// check|base-rice|
		selenium.check("base-rice");
		// verifyNotChecked|base-spud|true
		verifyNotEquals("true", selenium.getChecked("base-spud"));
		// verifyChecked|base-rice|true
		verifyEquals("true", selenium.getChecked("base-rice"));
		// uncheck|option-cheese|
		selenium.uncheck("option-cheese");
		// verifyNotChecked|option-cheese|true
		verifyNotEquals("true", selenium.getChecked("option-cheese"));
		// check|option-onions|
		selenium.check("option-onions");
		// verifyChecked|option-onions|true
		verifyEquals("true", selenium.getChecked("option-onions"));

/* address elements by name+value */
		// verifyNotChecked|option-chilli|true
		verifyNotEquals("true", selenium.getChecked("option-chilli"));
		// check|option chilli|
		selenium.check("option chilli");
		// verifyChecked|option-chilli|true
		verifyEquals("true", selenium.getChecked("option-chilli"));
		// uncheck|option index=3|
		selenium.uncheck("option index=3");
		// verifyNotChecked|option-chilli|true
		verifyNotEquals("true", selenium.getChecked("option-chilli"));

		checkForVerificationErrors();
	}
}
