package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestWait.html.
 */
public class TestWait extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Select and Pause", "info");
  
/* Test AndWait commands for Reload       */

		/* Link click */
		// open|./tests/html/test_reload_onchange_page.html|
		selenium.open("./tests/html/test_reload_onchange_page.html");
		// clickAndWait|theLink|
		selenium.click("theLink");
		selenium.waitForPageToLoad("60000");

		/* Page should reload */
		// verifyTitle|Slow Loading Page|
		verifyEquals("Slow Loading Page", selenium.getTitle());
		// open|./tests/html/test_reload_onchange_page.html|
		selenium.open("./tests/html/test_reload_onchange_page.html");
		// selectAndWait|theSelect|Second Option
		selenium.select("theSelect", "Second Option");
		selenium.waitForPageToLoad("60000");

		/* Page should reload */
		// verifyTitle|Slow Loading Page|
		verifyEquals("Slow Loading Page", selenium.getTitle());

		/* Textbox with onblur */
		// open|./tests/html/test_reload_onchange_page.html|
		selenium.open("./tests/html/test_reload_onchange_page.html");
		// typeAndWait|theTextbox|new value
		selenium.type("theTextbox", "new value");
		selenium.waitForPageToLoad("60000");
		// verifyTitle|Slow Loading Page|
		verifyEquals("Slow Loading Page", selenium.getTitle());

		/* Submit button */
		// open|./tests/html/test_reload_onchange_page.html|
		selenium.open("./tests/html/test_reload_onchange_page.html");
		// clickAndWait|theSubmit|
		selenium.click("theSubmit");
		selenium.waitForPageToLoad("60000");
		// verifyTitle|Slow Loading Page|
		verifyEquals("Slow Loading Page", selenium.getTitle());
		// clickAndWait|slowPage_reload|
		selenium.click("slowPage_reload");
		selenium.waitForPageToLoad("60000");
		// verifyTitle|Slow Loading Page|
		verifyEquals("Slow Loading Page", selenium.getTitle());

		checkForVerificationErrors();
	}
}
