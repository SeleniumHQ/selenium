package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestSelectWindowTitle extends SeleneseTestNgHelper {
	@Test public void testSelectWindowTitle() throws Exception {
		selenium.open("../tests/html/test_select_window.html");
		selenium.click("popupPage");
		selenium.waitForPopUp("myPopupWindow", "5000");
		selenium.selectWindow("Select Window Popup");
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_select_window_popup\\.html$"));
		verifyEquals(selenium.getTitle(), "Select Window Popup");
		verifyTrue(join(selenium.getAllWindowNames(), ',').matches("^[\\s\\S]*,[\\s\\S]*$"));
		verifyTrue(Pattern.compile("myPopupWindow").matcher(join(selenium.getAllWindowNames(), ',')).find());
		selenium.close();
		selenium.selectWindow("null");
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_select_window\\.html$"));
		selenium.click("popupPage");
		selenium.waitForPopUp("myPopupWindow", "5000");
		selenium.selectWindow("myPopupWindow");
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_select_window_popup\\.html$"));
		selenium.close();
		selenium.selectWindow("null");
		selenium.click("popupAnonymous");
		selenium.waitForPopUp("anonymouspopup", "5000");
		selenium.selectWindow("anonymouspopup");
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_select_window_popup\\.html$"));
		selenium.click("closePage");
		selenium.selectWindow("null");
		selenium.click("popupAnonymous");
		selenium.waitForPopUp("anonymouspopup", "5000");
		selenium.selectWindow("anonymouspopup");
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_select_window_popup\\.html$"));
		selenium.click("closePage2");
	}
}
