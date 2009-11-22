package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestCursorPosition extends SeleneseTestNgHelper {
	@Test public void testCursorPosition() throws Exception {
		selenium.open("../tests/html/test_type_page1.html");
		try { assertEquals(selenium.getCursorPosition("username"), "8"); fail("expected failure"); } catch (Throwable e) {}
		selenium.windowFocus();
		verifyEquals(selenium.getValue("username"), "");
		selenium.type("username", "TestUser");
		selenium.setCursorPosition("username", "0");
		verifyEquals(selenium.getCursorPosition("username"), "0");
		selenium.setCursorPosition("username", "-1");
		verifyEquals(selenium.getCursorPosition("username"), "8");
		selenium.refresh();
		selenium.waitForPageToLoad("30000");
		try { assertEquals(selenium.getCursorPosition("username"), "8"); fail("expected failure"); } catch (Throwable e) {}
	}
}
