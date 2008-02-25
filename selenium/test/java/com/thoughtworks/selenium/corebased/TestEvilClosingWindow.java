package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestEvilClosingWindow.html.
 */
public class TestEvilClosingWindow extends SeleneseTestCase
{
   public void testEvilClosingWindow() throws Throwable {
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
			// verifyLocation|*/tests/html/test_select_window_popup.html|
			verifyEquals("*/tests/html/test_select_window_popup.html", selenium.getLocation());
			// close||
			selenium.close();

			boolean sawThrow9 = false;
			try {
							// assertLocation|*/tests/html/test_select_window_popup.html|
			assertEquals("*/tests/html/test_select_window_popup.html", selenium.getLocation());
			}
			catch (Throwable e) {
				sawThrow9 = true;
			}
			verifyTrue(sawThrow9);
			

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
