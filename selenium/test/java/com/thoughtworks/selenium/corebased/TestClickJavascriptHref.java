package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestClickJavascriptHref extends SeleneseTestNgHelper {
	@Test public void testClickJavascriptHref() throws Exception {
		selenium.open("../tests/html/test_click_javascript_page.html");
		selenium.click("link");
		verifyEquals(selenium.getAlert(), "link clicked: foo");
		selenium.click("linkWithMultipleJavascriptStatements");
		verifyEquals(selenium.getAlert(), "alert1");
		verifyEquals(selenium.getAlert(), "alert2");
		verifyEquals(selenium.getAlert(), "alert3");
		selenium.click("linkWithJavascriptVoidHref");
		verifyEquals(selenium.getAlert(), "onclick");
		verifyEquals(selenium.getTitle(), "Click Page 1");
		selenium.click("linkWithOnclickReturnsFalse");
		verifyEquals(selenium.getTitle(), "Click Page 1");
		selenium.click("enclosedImage");
		verifyEquals(selenium.getAlert(), "enclosedImage clicked");
	}
}
