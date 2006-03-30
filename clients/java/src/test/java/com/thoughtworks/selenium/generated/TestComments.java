package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestComments.html.
 */
public class TestComments extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Comments", "info");
  
/* Test Comments */
			// open|./tests/html/test_verifications.html?foo=bar|
			selenium.open("./tests/html/test_verifications.html?foo=bar");

/* Any row with fewer than 3 cells is ignored */
selenium.assertLocation("/tests/html/test_verifications.html");
			// verifyValue|theText|the text value
			verifyEquals("the text value", selenium.getValue("theText"));
			// verifyValue|theHidden|the hidden value
			verifyEquals("the hidden value", selenium.getValue("theHidden"));
			// verifyText|theSpan|this is the span
			verifyEquals("this is the span", selenium.getText("theSpan"));

		checkForVerificationErrors();
	}
}
