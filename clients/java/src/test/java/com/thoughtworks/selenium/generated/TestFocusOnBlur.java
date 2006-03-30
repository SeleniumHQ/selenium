package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestFocusOnBlur.html.
 */
public class TestFocusOnBlur extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Focus On Blur", "info");
  
/* Test Focus On Blur       */
			// open|./tests/html/test_focus_on_blur.html|
			selenium.open("./tests/html/test_focus_on_blur.html");
			// type|testInput|test
			selenium.type("testInput", "test");
			// verifyAlert|Bad value|
			verifyEquals("Bad value", selenium.getAlert());
			// type|testInput|somethingelse
			selenium.type("testInput", "somethingelse");

		checkForVerificationErrors();
	}
}
