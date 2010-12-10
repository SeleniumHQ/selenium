package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;

import org.testng.annotations.Test;

public class TestFailingAssert extends InternalSelenseTestNgBase {
	@Test(dataProvider = "system-properties") public void testFailingAssert() throws Exception {
		selenium.open("../tests/html/test_verifications.html");
		try { assertEquals(selenium.getValue("theText"), "not the text value"); fail("expected failure"); } catch (Throwable e) {}
		try { assertNotEquals("the text value", selenium.getValue("theText")); fail("expected failure"); } catch (Throwable e) {}
		try { assertEquals(selenium.getValue("theTable"), "x"); fail("expected failure"); } catch (Throwable e) {}
	}
}
