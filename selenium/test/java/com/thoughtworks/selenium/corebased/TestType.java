package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestType extends SeleneseTestNgHelper {
	@Test public void testType() throws Exception {
		selenium.open("../tests/html/test_type_page1.html");
		verifyEquals(selenium.getValue("username"), "");
		selenium.shiftKeyDown();
		selenium.type("username", "x");
		verifyEquals(selenium.getValue("username"), "X");
		selenium.shiftKeyUp();
		selenium.type("username", "TestUserWithLongName");
		verifyEquals(selenium.getValue("username"), "TestUserWi");
		selenium.type("username", "TestUser");
		verifyEquals(selenium.getValue("username"), "TestUser");
		verifyEquals(selenium.getValue("password"), "");
		selenium.type("password", "testUserPasswordIsVeryLong");
		verifyEquals(selenium.getValue("password"), "testUserPasswordIsVe");
		selenium.type("password", "testUserPassword");
		verifyEquals(selenium.getValue("password"), "testUserPassword");
		selenium.click("submitButton");
		selenium.waitForPageToLoad("30000");
		verifyTrue(selenium.isTextPresent("Welcome, TestUser!"));
	}
}
