package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestElementIndex.html.
 */
public class TestElementIndex extends SeleneseTestCase
{
   public void testElementIndex() throws Throwable {
		try {
			

/* TestElementIndex */
			// open|../tests/html/test_element_order.html|
			selenium.open("/selenium-server/tests/html/test_element_order.html");
			// assertElementIndex|d2|1
			assertEquals("1", selenium.getElementIndex("d2"));
			// assertElementIndex|d1.1.1|0
			assertEquals("0", selenium.getElementIndex("d1.1.1"));
			// verifyElementIndex|d2|1
			verifyEquals("1", selenium.getElementIndex("d2"));
			// verifyElementIndex|d1.2|5
			verifyEquals("5", selenium.getElementIndex("d1.2"));
			// assertNotElementIndex|d2|2
			assertNotEquals("2", selenium.getElementIndex("d2"));
			// verifyNotElementIndex|d2|2
			verifyNotEquals("2", selenium.getElementIndex("d2"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
