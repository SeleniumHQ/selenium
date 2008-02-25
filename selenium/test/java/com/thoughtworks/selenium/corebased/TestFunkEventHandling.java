package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestFunkEventHandling.html.
 */
public class TestFunkEventHandling extends SeleneseTestCase
{
   public void testFunkEventHandling() throws Throwable {
		try {
			

/* Test Funky Event Handling */
			// open|../tests/html/test_funky_event_handling.html|
			selenium.open("/selenium-server/tests/html/test_funky_event_handling.html");
			// click|clickMe|
			selenium.click("clickMe");
			// pause|1000|
			pause(1000);
			assertTrue(!selenium.isTextPresent("You shouldn't be here!"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
