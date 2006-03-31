package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestModalDialog.html.
 */
public class TestModalDialog extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Modal Dialog", "info");
  
/* TestModalDialog (Only works in IE)       */
		// open|./tests/html/test_modal_dialog.html|
		selenium.open("./tests/html/test_modal_dialog.html");
// skipped undocumented, unsupported op in >>>>>modalDialogTest//////./tests/TestModalDialogDialog.html//////<<<<<
		// click|modal|
		selenium.click("modal");
		// verifyAlert|no ways|
		verifyEquals("no ways", selenium.getAlert());
selenium.assertLocation("/tests/html/test_modal_dialog.html");

		checkForVerificationErrors();
	}
}
