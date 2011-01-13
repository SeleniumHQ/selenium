package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;

import org.testng.annotations.Test;

public class TestProxy extends InternalSelenseTestNgBase {
	@Test(dataProvider = "system-properties") public void testProxy() throws Exception {
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
