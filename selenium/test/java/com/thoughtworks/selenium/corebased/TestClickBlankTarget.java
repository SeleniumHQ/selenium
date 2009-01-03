package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestClickBlankTarget extends SeleneseTestNgHelper {
	@Test public void testClickBlankTarget() throws Exception {
		selenium.open("../tests/html/Frames.html");
		selenium.selectFrame("bottomFrame");
		selenium.click("changeBlank");
		selenium.waitForPopUp("_blank", "10000");
		selenium.selectWindow("_blank");
		selenium.click("changeSpan");
		selenium.close();
		selenium.selectWindow("null");
		selenium.click("changeBlank");
		selenium.waitForPopUp("_blank", "10000");
		selenium.selectWindow("_blank");
		selenium.click("changeSpan");
		selenium.close();
		selenium.selectWindow("null");
		selenium.selectFrame("bottomFrame");
		selenium.submit("formBlank");
		selenium.waitForPopUp("_blank", "10000");
		selenium.selectWindow("_blank");
		selenium.click("changeSpan");
		selenium.close();
		selenium.selectWindow("null");
		selenium.open("../tests/html/test_select_window.html");
		selenium.click("popupBlank");
		selenium.waitForPopUp("_blank", "10000");
		selenium.selectWindow("_blank");
		verifyEquals(selenium.getTitle(), "Select Window Popup");
		selenium.close();
	}
}
