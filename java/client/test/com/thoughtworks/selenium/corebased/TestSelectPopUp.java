package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.annotations.Test;

public class TestSelectPopUp extends InternalSelenseTestNgBase {
	@Test public void testSelectPopUp() throws Exception {
		selenium.open("../tests/html/test_select_window.html");
		selenium.click("popupPage");
		selenium.waitForPopUp("myPopupWindow", "");
		selenium.selectPopUp("");
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_select_window_popup\\.html$"));
		verifyEquals(selenium.getTitle(), "Select Window Popup");
		selenium.close();
		selenium.deselectPopUp();
		verifyFalse(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_select_window_popup\\.html$"));
		verifyNotEquals("Select Window Popup", selenium.getTitle());
		selenium.click("popupPage");
		selenium.waitForPopUp("", "5000");
		selenium.selectPopUp("myPopupWindow");
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_select_window_popup\\.html$"));
		verifyEquals(selenium.getTitle(), "Select Window Popup");
		selenium.close();
		selenium.deselectPopUp();
		verifyFalse(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_select_window_popup\\.html$"));
		verifyNotEquals("Select Window Popup", selenium.getTitle());
		selenium.click("popupPage");
		selenium.waitForPopUp("null", "5000");
		selenium.selectPopUp("Select Window Popup");
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_select_window_popup\\.html$"));
		verifyEquals(selenium.getTitle(), "Select Window Popup");
		selenium.close();
		selenium.deselectPopUp();
	}
}
