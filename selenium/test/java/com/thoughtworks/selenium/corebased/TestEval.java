package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.SeleneseTestNgHelper;
import org.testng.annotations.Test;

public class TestEval extends SeleneseTestNgHelper {
	@Test public void testEval() throws Exception {
		selenium.open("../tests/html/test_open.html");
		assertEquals(selenium.getEval("window.document.title"), "Open Test");
	}
}
