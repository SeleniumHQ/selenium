package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestModalDialogDialog.html.
 */
public class TestModalDialogDialog extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Modal Dialog Dialog", "info");
  
/* Test modal dialog dialog       */
selenium.assertLocation("/tests/html/test_modal_dialog_dialog.html");

		boolean sawThrow4 = false;
		try {
			// originally verifyElementPresent|close|
		selenium.assertElementPresent("close");
		}
		catch (Throwable e) {
			sawThrow4 = true;
		}
		verifyFalse(sawThrow4);
		
		// click|close|
		selenium.click("close");

		checkForVerificationErrors();
	}
}
