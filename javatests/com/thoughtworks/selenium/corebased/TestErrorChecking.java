package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;

import org.testng.annotations.Test;

public class TestErrorChecking extends InternalSelenseTestNgBase {
	@Test public void testErrorChecking() throws Exception {
		selenium.open("../tests/html/test_click_page1.html");
		//  These tests should all fail, as they are checking the error checking commands. 
		try { assertEquals(selenium.getText("link"), "Click here for next page"); fail("expected failure"); } catch (Throwable e) {}
		try { System.out.println("foo"); fail("expected failure"); } catch (Throwable e) {}
		try { assertEquals(selenium.getText("link"), "foo"); fail("expected failure"); } catch (Throwable e) {}
		try { assertEquals(selenium.getText("link"), "Click here for next page"); fail("expected failure"); } catch (Throwable e) {}
		try { assertEquals(selenium.getText("link"), "foo"); fail("expected failure"); } catch (Throwable e) {}
		try { assertEquals(selenium.getText("notAlink"), "foo"); fail("expected failure"); } catch (Throwable e) {}
	}
}
