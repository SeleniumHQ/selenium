package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestType.html.
 */
public class TestType extends SeleneseTestCase
{
   public void testType() throws Throwable {
		try {
			

/* Test Type */
			// open|../tests/html/test_type_page1.html|
			selenium.open("/selenium-server/tests/html/test_type_page1.html");
			// verifyValue|username|
			verifyEquals("", selenium.getValue("username"));
			// shiftKeyDown||
			selenium.shiftKeyDown();
			// type|username|x
			selenium.type("username", "x");
			// verifyValue|username|X
			verifyEquals("X", selenium.getValue("username"));
			// shiftKeyUp||
			selenium.shiftKeyUp();
			// type|username|TestUserWithLongName
			selenium.type("username", "TestUserWithLongName");
			// verifyValue|username|TestUserWi
			verifyEquals("TestUserWi", selenium.getValue("username"));
			// type|username|TestUser
			selenium.type("username", "TestUser");
			// verifyValue|username|TestUser
			verifyEquals("TestUser", selenium.getValue("username"));
			// verifyValue|password|
			verifyEquals("", selenium.getValue("password"));
			// type|password|testUserPasswordIsVeryLong
			selenium.type("password", "testUserPasswordIsVeryLong");
			// verifyValue|password|testUserPasswordIsVe
			verifyEquals("testUserPasswordIsVe", selenium.getValue("password"));
			// type|password|testUserPassword
			selenium.type("password", "testUserPassword");
			// verifyValue|password|testUserPassword
			verifyEquals("testUserPassword", selenium.getValue("password"));
			// clickAndWait|submitButton|
			selenium.click("submitButton");
			selenium.waitForPageToLoad("5000");
			assertTrue(selenium.isTextPresent("Welcome, TestUser!"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
