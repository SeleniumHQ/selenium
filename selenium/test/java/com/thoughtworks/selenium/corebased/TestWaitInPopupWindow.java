package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestWaitInPopupWindow extends SeleneseTestNgHelper {
	@Test public void testWaitInPopupWindow() throws Exception {
		selenium.open("../tests/html/test_select_window.html");
		selenium.click("popupPage");
		selenium.waitForPopUp("myPopupWindow", "5000");
		selenium.selectWindow("myPopupWindow");
		verifyEquals(selenium.getTitle(), "Select Window Popup");
		selenium.setTimeout("5000");
		selenium.click("link=Click to load new page");
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getTitle(), "Reload Page");
		selenium.setTimeout("30000");
		selenium.click("link=Click here");
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getTitle(), "Slow Loading Page");
		selenium.close();
		selenium.selectWindow("null");
	}
}
