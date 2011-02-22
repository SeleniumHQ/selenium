package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.junit.Test;

public class TestElementIndex extends InternalSelenseTestBase {
	@Test public void testElementIndex() throws Exception {
		selenium.open("../tests/html/test_element_order.html");
		assertEquals(selenium.getElementIndex("d2"), "1");
		assertEquals(selenium.getElementIndex("d1.1.1"), "0");
		verifyEquals(selenium.getElementIndex("d2"), "1");
		verifyEquals(selenium.getElementIndex("d1.2"), "5");
		assertNotEquals("2", selenium.getElementIndex("d2"));
		verifyNotEquals("2", selenium.getElementIndex("d2"));
	}
}
