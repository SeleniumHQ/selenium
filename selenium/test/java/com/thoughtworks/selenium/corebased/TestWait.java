package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestWait extends SeleneseTestNgHelper {
	@Test public void testWait() throws Exception {
		//  Link click 
		selenium.open("../tests/html/test_reload_onchange_page.html");
		selenium.click("theLink");
		selenium.waitForPageToLoad("30000");
		//  Page should reload 
		verifyEquals(selenium.getTitle(), "Slow Loading Page");
		selenium.open("../tests/html/test_reload_onchange_page.html");
		selenium.select("theSelect", "Second Option");
		selenium.waitForPageToLoad("30000");
		//  Page should reload 
		verifyEquals(selenium.getTitle(), "Slow Loading Page");
		//  Textbox with onblur 
		selenium.open("../tests/html/test_reload_onchange_page.html");
		selenium.type("theTextbox", "new value");
		selenium.fireEvent("theTextbox", "blur");
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getTitle(), "Slow Loading Page");
		//  Submit button 
		selenium.open("../tests/html/test_reload_onchange_page.html");
		selenium.click("theSubmit");
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getTitle(), "Slow Loading Page");
		selenium.click("slowPage_reload");
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getTitle(), "Slow Loading Page");
	}
}
