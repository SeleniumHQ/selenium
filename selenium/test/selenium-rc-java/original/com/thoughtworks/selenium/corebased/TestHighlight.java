package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestHighlight.html.
 */
public class TestHighlight extends SeleneseTestCase
{
   public void testHighlight() throws Throwable {
		try {
			

/* Test Highlight */
			// open|../tests/html/test_locators.html|
			selenium.open("/selenium-server/tests/html/test_locators.html");
			// highlight|id1|
			selenium.highlight("id1");

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
