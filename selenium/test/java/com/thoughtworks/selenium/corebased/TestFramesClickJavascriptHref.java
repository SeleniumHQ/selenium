package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestFramesClickJavascriptHref extends SeleneseTestNgHelper {
	@Test public void testFramesClickJavascriptHref() throws Exception {
		selenium.open("../tests/html/Frames.html");
		selenium.selectFrame("mainFrame");
		selenium.open("../tests/html/test_click_javascript_page.html");
		selenium.selectFrame("relative=top");
		selenium.click("link");
		verifyEquals(selenium.getAlert(), "link clicked: foo");
	}
}
