package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;

import org.testng.annotations.Test;

public class TestSubmit extends InternalSelenseTestNgBase {
	@Test public void testSubmit() throws Exception {
		selenium.open("../tests/html/test_submit.html");
		selenium.submit("searchForm");
		assertEquals(selenium.getAlert(), "onsubmit called");
		selenium.check("okayToSubmit");
		selenium.submit("searchForm");
		assertEquals(selenium.getAlert(), "onsubmit called");
		assertEquals(selenium.getAlert(), "form submitted");
	}
}
