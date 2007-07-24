package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestUserExtensions.html.
 */
public class TestUserExtensions extends SeleneseTestCase
{
   public void testUserExtensions() throws Throwable {
		try {
			

/* Test For Sample User Functions */
			// open|../tests/html/test_type_page1.html|
			selenium.open("/selenium-server/tests/html/test_type_page1.html");
			// typeRepeated|username|Test
			selenium.type("username", "TestTest");
			// verifyValue|username|TestTest
			verifyEquals("TestTest", selenium.getValue("username"));
// skipped undocumented >>>>>verifyValueRepeated//////username//////Test<<<<<

			boolean sawThrow7 = false;
			try {
				// originally verifyElementPresent|valuerepeated=Test|
						assertTrue(selenium.isElementPresent("valuerepeated=Test"));
			}
			catch (Throwable e) {
				sawThrow7 = true;
			}
			verifyFalse(sawThrow7);
			

			boolean sawThrow8 = false;
			try {
				// originally verifyElementNotPresent|valuerepeated=X|
						assertTrue(!selenium.isElementPresent("valuerepeated=X"));
			}
			catch (Throwable e) {
				sawThrow8 = true;
			}
			verifyFalse(sawThrow8);
			

			/* Type 'Test' twice into the element with value='TestUserTestUser' */
			// typeRepeated|valuerepeated=Test|X
			selenium.type("valuerepeated=Test", "XX");

			/* Verify that we now CAN find an element with value == 'X' repeated */

			boolean sawThrow14 = false;
			try {
				// originally verifyElementPresent|valuerepeated=X|
						assertTrue(selenium.isElementPresent("valuerepeated=X"));
			}
			catch (Throwable e) {
				sawThrow14 = true;
			}
			verifyFalse(sawThrow14);
			

			/* Test getTextLength */
			// storeTextLength|//h3|myVar
			Integer myVar = new Integer(selenium.getText("//h3").length());
			// verifyTextLength|//h3|regexp:4[1-5]
			verifyEquals("regexp:4[1-5]", "" + selenium.getText("//h3").length());
			boolean sawCondition19 = false;
			for (int second = 0; second < 60; second++) {
				try {
					if (seleniumEquals(myVar, "" + selenium.getText("//h3").length())) {
						sawCondition19 = true;
						break;
					}
				}
				catch (Exception ignore) {
				}
				pause(1000);
			}
			assertTrue(sawCondition19);
			
			// verifyNotTextLength|//h3|46
			verifyNotEquals("46", "" + selenium.getText("//h3").length());

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
