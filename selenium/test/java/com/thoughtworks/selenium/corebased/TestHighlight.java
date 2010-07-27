package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.SeleneseTestNgHelper;
import org.testng.annotations.Test;

public class TestHighlight extends SeleneseTestNgHelper {
	@Test public void testHighlight() throws Exception {
		selenium.open("../tests/html/test_locators.html");
		selenium.highlight("id1");
	}
}
