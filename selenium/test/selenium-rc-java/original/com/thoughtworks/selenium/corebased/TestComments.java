package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestComments.html.
 */
public class TestComments extends SeleneseTestCase
{
   public void testComments() throws Throwable {
		try {
			

/* Test Comments */
			// open|../tests/html/test_verifications.html?foo=bar|
			selenium.open("/selenium-server/tests/html/test_verifications.html?foo=bar");

/* Any row with fewer than 3 cells is ignored */
			// verifyLocation|*/tests/html/test_verifications.html*||anything after the 3rd cell is ignored
			verifyEquals("*/tests/html/test_verifications.html*", selenium.getLocation());
			// verifyValue|theText|the text value
			verifyEquals("the text value", selenium.getValue("theText"));
			// verifyValue|theHidden|the hidden value
			verifyEquals("the hidden value", selenium.getValue("theHidden"));
			// verifyText|theSpan|this is the span
			verifyEquals("this is the span", selenium.getText("theSpan"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
