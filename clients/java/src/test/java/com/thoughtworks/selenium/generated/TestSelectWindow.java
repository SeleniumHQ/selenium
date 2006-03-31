package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestSelectWindow.html.
 */
public class TestSelectWindow extends SeleneseTestCase
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
selenium.assertLocation("/tests/html/test_select_window_popup.html");
		// verifyTitle|Select Window Popup|
		verifyEquals("Select Window Popup", selenium.getTitle());
		// close||
		selenium.close();
		// selectWindow|null|
		selenium.selectWindow("null");
selenium.assertLocation("/tests/html/test_select_window.html");

		/* Select an anonymous window (one that isn't assigned to a variable) */
		// click|popupAnonymous|
		selenium.click("popupAnonymous");
		// pause|500
		pause(500);
		// selectWindow|anonymouspopup|
		selenium.selectWindow("anonymouspopup");
selenium.assertLocation("/tests/html/test_select_window_popup.html");
		// click|closePage|
		selenium.click("closePage");

		/* Leave the test in a selected window - the next test should begin in the main window */

		checkForVerificationErrors();
	}
}
