package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestElementOrder.html.
 */
public class TestElementOrder extends SeleneseTestCase
{
   public void testElementOrder() throws Throwable {
		try {
			

/* TestElementOrder */
			// open|../tests/html/test_element_order.html|
			selenium.open("/selenium-server/tests/html/test_element_order.html");
			// assertOrdered|s1.1|d1.1
			assertEquals(true, selenium.isOrdered("s1.1", "d1.1"));
			// assertNotOrdered|s1.1|s1.1
			assertNotEquals(true, selenium.isOrdered("s1.1", "s1.1"));
			// verifyOrdered|s1.1|d1.1
			verifyEquals(true, selenium.isOrdered("s1.1", "d1.1"));
			// assertNotOrdered|d1.1|s1.1
			assertNotEquals(true, selenium.isOrdered("d1.1", "s1.1"));
			// verifyNotOrdered|s1.1|d2
			verifyNotEquals(true, selenium.isOrdered("s1.1", "d2"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
