package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.junit.Test;

public class TestEvilClosingWindow extends InternalSelenseTestBase {
	@Test public void testEvilClosingWindow() throws Exception {
		selenium.open("../tests/html/test_select_window.html");
		selenium.click("popupPage");
		selenium.waitForPopUp("myPopupWindow", "5000");
		selenium.selectWindow("myPopupWindow");
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_select_window_popup\\.html$"));
		selenium.close();
		try { assertTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_select_window_popup\\.html$")); fail("expected failure"); } catch (Throwable e) {}
	}
}
