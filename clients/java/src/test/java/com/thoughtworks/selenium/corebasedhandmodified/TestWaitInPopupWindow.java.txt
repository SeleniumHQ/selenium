package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from Z:\shared\p4\Dev\selenium-rc_svn\trunk\core\tests/TestWaitInPopupWindow.html.
 */
public class TestWaitInPopupWindow extends SeleneseTestCase
{
   public void testWaitInPopupWindow() throws Throwable {
   	try {

/* Test selectWindow */
		// open|../tests/html/test_select_window.html|
		selenium.open("/selenium-server/tests/html/test_select_window.html");
		// click|popupPage|
		selenium.click("popupPage");
		// waitForPopUp|myPopupWindow|5000
		selenium.waitForPopUp("myPopupWindow", "5000");
		// selectWindow|myPopupWindow|
		selenium.selectWindow("myPopupWindow");
		// verifyTitle|Select Window Popup|
		verifyEquals("*Select Window Popup", selenium.getTitle());

		// clickAndWait|link=Click to load new page|
		selenium.click("link=Click to load new page");
		selenium.waitForPageToLoad("30000");
		// verifyTitle|Reload Page|
		verifyEquals("*Reload Page", selenium.getTitle());

		// clickAndWait|link=Click here|
		selenium.click("link=Click here");
        selenium.waitForPageToLoad("30000");
		// verifyTitle|Slow Loading Page|
		verifyEquals("*Slow Loading Page", selenium.getTitle());
		// close||
		selenium.close();
		// selectWindow|null|
		selenium.selectWindow("null");

		checkForVerificationErrors();
            }
            finally {
            	clearVerificationErrors();
            }
	}
}
