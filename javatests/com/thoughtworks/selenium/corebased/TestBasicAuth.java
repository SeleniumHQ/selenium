package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;

import org.testng.annotations.Test;

public class TestBasicAuth extends InternalSelenseTestNgBase {
	@Test(dataProvider = "system-properties") public void testBasicAuth() throws Exception {
		selenium.open("http://alice:foo@localhost:4444/selenium-server/tests/html/basicAuth/index.html");
		assertEquals(selenium.getTitle(), "Welcome");
	}
}
