package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestBasicAuth extends SeleneseTestNgHelper {
	@Test public void testBasicAuth() throws Exception {
		selenium.open("http://alice:foo@localhost:4444/selenium-server/tests/html/basicAuth/index.html");
		assertEquals(selenium.getTitle(), "Welcome");
	}
}
