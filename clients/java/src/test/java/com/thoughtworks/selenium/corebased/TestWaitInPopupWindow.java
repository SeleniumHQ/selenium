package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestWaitInPopupWindow.html.
 */
public class TestWaitInPopupWindow extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test SelectWindow", "info");
  
/* Test selectWindow       */
		// open|./tests/html/test_select_window.html|
		selenium.open("./tests/html/test_select_window.html");
		// click|popupPage|
		selenium.click("popupPage");
		// pause|500
		pause(500);
		// selectWindow|myPopupWindow|
		selenium.selectWindow("myPopupWindow");
		// verifyTitle|Select Window Popup|
		verifyEquals("Select Window Popup", selenium.getTitle());

		/* Check page transitions in popup window */

		/* quick loading page */
		// clickAndWait|link=Click to load new page|
		selenium.click("link=Click to load new page");
		selenium.waitForPageToLoad("60000");
		// verifyTitle|Reload Page|
		verifyEquals("Reload Page", selenium.getTitle());

		/* Slow loading page */
		// clickAndWait|link=Click here|
		selenium.click("link=Click here");
		selenium.waitForPageToLoad("60000");
		// verifyTitle|Slow Loading Page|
		verifyEquals("Slow Loading Page", selenium.getTitle());
		// close||
		selenium.close();
		// selectWindow|null|
		selenium.selectWindow("null");

		checkForVerificationErrors();
	}
}
