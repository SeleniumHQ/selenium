package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestVerifyEditable.html.
 */
public class TestVerifyEditable extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test verifyEditable", "info");
  
/* Test verifyEditable       */
		// open|./tests/html/test_editable.html|
		selenium.open("./tests/html/test_editable.html");

		boolean sawThrow4 = false;
		try {
			// originally verifyEditable|normal_text|
		selenium.assertEditable("normal_text");
		}
		catch (Throwable e) {
			sawThrow4 = true;
		}
		verifyFalse(sawThrow4);
		

		boolean sawThrow5 = false;
		try {
			// originally verifyEditable|normal_select|
		selenium.assertEditable("normal_select");
		}
		catch (Throwable e) {
			sawThrow5 = true;
		}
		verifyFalse(sawThrow5);
		

		boolean sawThrow6 = false;
		try {
			// originally verifyNotEditable|disabled_text|
		selenium.assertNotEditable("disabled_text");
		}
		catch (Throwable e) {
			sawThrow6 = true;
		}
		verifyFalse(sawThrow6);
		

		boolean sawThrow7 = false;
		try {
			// originally verifyNotEditable|disabled_select|
		selenium.assertNotEditable("disabled_select");
		}
		catch (Throwable e) {
			sawThrow7 = true;
		}
		verifyFalse(sawThrow7);
		

		boolean sawThrow8 = false;
		try {
			// originally verifyNotEditable|fake_input|
		selenium.assertNotEditable("fake_input");
		}
		catch (Throwable e) {
			sawThrow8 = true;
		}
		verifyFalse(sawThrow8);
		

		checkForVerificationErrors();
	}
}
