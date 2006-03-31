package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestType.html.
 */
public class TestType extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Type", "info");

/* Test Type */
		// open|./tests/html/test_type_page1.html|
		selenium.open("./tests/html/test_type_page1.html");
		// verifyValue|username|
		verifyEquals("", selenium.getValue("username"));
		// type|username|TestUser
		selenium.type("username", "TestUser");
		// verifyValue|username|TestUser
		verifyEquals("TestUser", selenium.getValue("username"));
		// verifyValue|password|
		verifyEquals("", selenium.getValue("password"));
		// type|password|testUserPassword
		selenium.type("password", "testUserPassword");
		// verifyValue|password|testUserPassword
		verifyEquals("testUserPassword", selenium.getValue("password"));
		// clickAndWait|submitButton|
		selenium.click("submitButton");
		selenium.waitForPageToLoad("60000");
		// verifyTextPresent|Welcome, TestUser!|
		verifyTrue(this.getText().indexOf("Welcome, TestUser!")!=-1);

		checkForVerificationErrors();
	}
}
