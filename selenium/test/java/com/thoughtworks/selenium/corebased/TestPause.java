package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestPause extends SeleneseTestNgHelper {
	@Test public void testPause() throws Exception {
		selenium.open("../tests/html/test_reload_onchange_page.html");
		//  Make sure we can pause even when the page doesn't change 
		Thread.sleep(100);
		verifyEquals(selenium.getTitle(), "Reload Page");
		verifyTrue(selenium.isElementPresent("theSelect"));
		selenium.select("theSelect", "Second Option");
		//  Make sure we can pause to wait for a page reload 
		//  Must pause longer than the slow-loading page takes (500ms) 
		Thread.sleep(5000);
		verifyEquals(selenium.getTitle(), "Slow Loading Page");
		verifyFalse(selenium.isElementPresent("theSelect"));
		verifyTrue(selenium.isElementPresent("theSpan"));
	}
}
