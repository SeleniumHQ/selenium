package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestProxy extends SeleneseTestNgHelper {
	@Test public void testProxy() throws Exception {
		selenium.open("http://www.yahoo.com/");
		selenium.type("p", "Selenium");
		selenium.click("searchsubmit");
		selenium.waitForPageToLoad("30000");
		selenium.open("http://www.google.com/");
		selenium.type("q", "Selenium");
		selenium.click("btnG");
		selenium.waitForPageToLoad("30000");
	}
}
