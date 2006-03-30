package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestPause.html.
 */
public class TestPause extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Select and Pause", "info");
  
/* Test Select and Pause for Reload       */
			// open|./tests/html/test_reload_onchange_page.html|
			selenium.open("./tests/html/test_reload_onchange_page.html");

		/* Make sure we can pause even when the page doesn't change */
			// pause|100|
			pause(100);
			// verifyTitle|Reload Page
			verifyEquals("Reload Page", selenium.getTitle());

		boolean sawThrow8 = false;
		try {
			// originally verifyElementPresent|theSelect|
		selenium.assertElementPresent("theSelect");
		}
		catch (Exception e) {
			sawThrow8 = true;
		}
		verifyFalse(sawThrow8);
		
			// select|theSelect|Second Option
			selenium.select("theSelect", "Second Option");

		/* Make sure we can pause to wait for a page reload */

		/* Must pause longer than the slow-loading page takes (100ms) */
			// pause|1000|
			pause(1000);
			// verifyTitle|Slow Loading Page|
			verifyEquals("Slow Loading Page", selenium.getTitle());

		boolean sawThrow16 = false;
		try {
			// originally verifyElementNotPresent|theSelect|
		selenium.assertElementNotPresent("theSelect");
		}
		catch (Exception e) {
			sawThrow16 = true;
		}
		verifyFalse(sawThrow16);
		

		boolean sawThrow17 = false;
		try {
			// originally verifyElementPresent|theSpan|
		selenium.assertElementPresent("theSpan");
		}
		catch (Exception e) {
			sawThrow17 = true;
		}
		verifyFalse(sawThrow17);
		

		checkForVerificationErrors();
	}
}
