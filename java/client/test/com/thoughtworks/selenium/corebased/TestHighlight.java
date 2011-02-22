package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.junit.Test;

public class TestHighlight extends InternalSelenseTestBase {
	@Test public void testHighlight() throws Exception {
		selenium.open("../tests/html/test_locators.html");
		selenium.highlight("id1");
	}
}
