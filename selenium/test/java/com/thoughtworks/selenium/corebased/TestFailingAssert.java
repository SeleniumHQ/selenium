package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestFailingAssert.html.
 */
public class TestFailingAssert extends SeleneseTestCase
{
   public void testFailingAssert() throws Throwable {
		try {
			

/* Test Failing Assert */
			// open|../tests/html/test_verifications.html|
			selenium.open("/selenium-server/tests/html/test_verifications.html");

			boolean sawThrow4 = false;
			try {
							// assertValue|theText|not the text value
			assertEquals("not the text value", selenium.getValue("theText"));
			}
			catch (Throwable e) {
				sawThrow4 = true;
			}
			assertTrue(sawThrow4);
			

			boolean sawThrow6 = false;
			try {
							// assertNotValue|theText|the text value
			assertNotEquals("the text value", selenium.getValue("theText"));
			}
			catch (Throwable e) {
				sawThrow6 = true;
			}
			assertTrue(sawThrow6);
			

			boolean sawThrow8 = false;
			try {
							// assertValue|theTable|x
			assertEquals("x", selenium.getValue("theTable"));
			}
			catch (Throwable e) {
				sawThrow8 = true;
			}
			assertTrue(sawThrow8);
			

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
