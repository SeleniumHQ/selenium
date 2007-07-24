package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestSelectWindowTitle.html.
 */
public class TestSelectWindowTitle extends SeleneseTestCase
{
   public void testSelectWindowTitle() throws Throwable {
		try {
			

/* Test selectWindow by title */
			// open|../tests/html/test_select_window.html|
			selenium.open("/selenium-server/tests/html/test_select_window.html");
			// click|popupPage|
			selenium.click("popupPage");
			// waitForPopUp|myPopupWindow|5000
			selenium.waitForPopUp("myPopupWindow", "5000");
			// selectWindow|Select Window Popup|
			selenium.selectWindow("Select Window Popup");
			// verifyLocation|*/tests/html/test_select_window_popup.html|
			verifyEquals("*/tests/html/test_select_window_popup.html", selenium.getLocation());
			// verifyTitle|Select Window Popup|
			verifyEquals("*Select Window Popup", selenium.getTitle());
			// verifyAllWindowNames|*,*|
			verifyEquals("*,*", selenium.getAllWindowNames());
			// verifyAllWindowNames|regexp:myPopupWindow|
			verifyEquals("regexp:myPopupWindow", selenium.getAllWindowNames());
			// close||
			selenium.close();
			// selectWindow|null|
			selenium.selectWindow("null");
			// verifyLocation|*/tests/html/test_select_window.html|
			verifyEquals("*/tests/html/test_select_window.html", selenium.getLocation());
			// click|popupPage|
			selenium.click("popupPage");
			// waitForPopUp|myPopupWindow|5000
			selenium.waitForPopUp("myPopupWindow", "5000");
			// selectWindow|myPopupWindow|
			selenium.selectWindow("myPopupWindow");
			// verifyLocation|*/tests/html/test_select_window_popup.html|
			verifyEquals("*/tests/html/test_select_window_popup.html", selenium.getLocation());
			// close||
			selenium.close();
			// selectWindow|null|
			selenium.selectWindow("null");
			// click|popupAnonymous|
			selenium.click("popupAnonymous");
			// waitForPopUp|anonymouspopup|5000
			selenium.waitForPopUp("anonymouspopup", "5000");
			// selectWindow|anonymouspopup|
			selenium.selectWindow("anonymouspopup");
			// verifyLocation|*/tests/html/test_select_window_popup.html|
			verifyEquals("*/tests/html/test_select_window_popup.html", selenium.getLocation());
			// click|closePage|
			selenium.click("closePage");
			// selectWindow|null|
			selenium.selectWindow("null");
			// click|popupAnonymous|
			selenium.click("popupAnonymous");
			// waitForPopUp|anonymouspopup|5000
			selenium.waitForPopUp("anonymouspopup", "5000");
			// selectWindow|anonymouspopup|
			selenium.selectWindow("anonymouspopup");
			// verifyLocation|*/tests/html/test_select_window_popup.html|
			verifyEquals("*/tests/html/test_select_window_popup.html", selenium.getLocation());
			// click|closePage2|
			selenium.click("closePage2");

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
