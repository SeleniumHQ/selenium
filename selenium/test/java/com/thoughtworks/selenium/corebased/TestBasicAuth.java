package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.SeleneseTestNgHelper;
import org.testng.annotations.Test;

public class TestBasicAuth extends SeleneseTestNgHelper {
	@Test public void testBasicAuth() throws Exception {
		selenium.open("http://alice:foo@localhost:4444/selenium-server/tests/html/basicAuth/index.html");
		assertEquals(selenium.getTitle(), "Welcome");
	}
}
