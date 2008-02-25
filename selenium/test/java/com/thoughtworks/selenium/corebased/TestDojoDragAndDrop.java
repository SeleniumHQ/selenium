package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestDojoDragAndDrop.html.
 */
public class TestDojoDragAndDrop extends SeleneseTestCase
{
   public void testDojoDragAndDrop() throws Throwable {
		try {
			

/* TestDojoDragDrop */
			// open|../tests/html/dojo-0.4.0-mini/tests/dnd/test_simple.html|
			selenium.open("/selenium-server/tests/html/dojo-0.4.0-mini/tests/dnd/test_simple.html");
			// dragAndDropToObject|1_3|2_1
			selenium.dragAndDropToObject("1_3", "2_1");
			assertTrue(selenium.isTextPresent("either side of me*list 1 item 3"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
