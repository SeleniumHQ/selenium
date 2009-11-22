package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestEvilClosingWindow extends SeleneseTestNgHelper {
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
