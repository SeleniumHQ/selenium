package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestDojoDragAndDrop.html.
 */
public class TestDojoDragAndDrop extends SeleneseTestCase
{
   public void testDojoDragAndDrop() throws Throwable {
		try {
			

/* TestDojoDragDrop */
			// open|../tests/html/dojo-0.4.0-mini/tests/dnd/test_simple.html|
			selenium.open("/selenium-server/tests/html/dojo-0.4.0-mini/tests/dnd/test_simple.html");
			// dragAndDropToObject|//li[text()='list 1 item 3']|//li[text()='list 2 item 1']
			selenium.dragAndDropToObject("//li[text()='list 1 item 3']", "//li[text()='list 2 item 1']");
			assertTrue(selenium.isTextPresent("either side of me*list 1 item 3"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
