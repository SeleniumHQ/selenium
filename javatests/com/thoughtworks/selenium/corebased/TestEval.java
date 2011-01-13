package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.annotations.Test;

public class TestEval extends InternalSelenseTestNgBase {
	@Test(dataProvider = "system-properties")
  public void testEval() throws Exception {
		selenium.open("../tests/html/test_open.html");
		assertEquals(selenium.getEval("window.document.title"), "Open Test");
	}
}
