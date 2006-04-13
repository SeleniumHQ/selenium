package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestUserExtensions.html.
 */
public class TestUserExtensions extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test For Sample User Functions", "info");
  
/* Test For Sample User Functions       */
		// open|./tests/html/test_type_page1.html|
		selenium.open("./tests/html/test_type_page1.html");

		/* Type 'TestUserTestUser' into the username field */
		// typeRepeated|username|TestUser
		selenium.type("username", "TestUserTestUser");
		// verifyValue|username|TestUserTestUser
		verifyEquals("TestUserTestUser", selenium.getValue("username"));

		/* Verify that 'TestUser' is repeated in the field */
// skipped undocumented >>>>>verifyValueRepeated//////username//////TestUser<<<<<

		/* Verify that we can find an element with value == 'TestUser' repeated */

		boolean sawThrow13 = false;
		try {
			// originally verifyElementPresent|valuerepeated=TestUser|
		selenium.assertElementPresent("valuerepeated=TestUser");
		}
		catch (Throwable e) {
			sawThrow13 = true;
		}
		verifyFalse(sawThrow13);
		

		/* Verify that we cannot find an element with value == 'Test' repeated */

		boolean sawThrow16 = false;
		try {
			// originally verifyElementNotPresent|valuerepeated=Test|
		selenium.assertElementNotPresent("valuerepeated=Test");
		}
		catch (Throwable e) {
			sawThrow16 = true;
		}
		verifyFalse(sawThrow16);
		

		/* Type 'Test' twice into the element with value='TestUserTestUser' */
		// typeRepeated|valuerepeated=TestUser|Test
		selenium.type("valuerepeated=TestUser", "TestTest");

		/* Verify that we not CAN find an element with value == 'Test' repeated */

		boolean sawThrow22 = false;
		try {
			// originally verifyElementPresent|valuerepeated=Test|
		selenium.assertElementPresent("valuerepeated=Test");
		}
		catch (Throwable e) {
			sawThrow22 = true;
		}
		verifyFalse(sawThrow22);
		

		/* Test getTextLength */
		// storeTextLength|//h3|myVar
		Integer myVar = new Integer(selenium.getText("//h3").length());
		// verifyTextLength|//h3|regexp:4[1-5]
		verifyEquals("regexp:4[1-5]", "" + selenium.getText("//h3").length());
		boolean sawCondition27 = false;
		for (int second = 0; second < 60; second++) {
			if (myVar.intValue()==selenium.getText("//h3").length()) {
				sawCondition27 = true;
				break;
			}
			pause(1000);
		}
		assertTrue(sawCondition27);
		
		// verifyNotTextLength|//h3|46
		verifyNotEquals("46", "" + selenium.getText("//h3").length());

		checkForVerificationErrors();
	}
}
