package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestModalDialog extends SeleneseTestNgHelper {
	@Test public void testModalDialog() throws Exception {
		selenium.open("../tests/html/test_modal_dialog.html");
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_modal_dialog\\.html$"));
		verifyEquals(selenium.getTitle(), "Modal Dialog Host Window");
		verifyEquals(selenium.getValue("changeText"), "before modal dialog");
		selenium.click("modal");
		// selenium.waitForPopup("Modal Dialog Popup", "5000");
		selenium.selectWindow("Modal Dialog Popup");
		verifyEquals(selenium.getTitle(), "Modal Dialog Popup");
		selenium.click("change");
		selenium.click("close");
		selenium.selectWindow("Modal Dialog Host Window");
		verifyEquals(selenium.getValue("changeText"), "after modal dialog");
		verifyEquals(selenium.getTitle(), "Modal Dialog Popup");
	}
}
