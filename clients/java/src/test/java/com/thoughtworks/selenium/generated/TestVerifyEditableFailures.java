package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestVerifyEditableFailures.html.
 */
public class TestVerifyEditableFailures extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test verifyEditable", "info");
  
/* Test verifyEditable       */
		// open|./tests/html/test_editable.html|
		selenium.open("./tests/html/test_editable.html");

		boolean sawThrow4 = false;
		try {
			selenium.assertNotEditable("normal_text");
		}
		catch (Throwable e) {
			sawThrow4 = true;
		}
		verifyTrue(sawThrow4);
		

		boolean sawThrow6 = false;
		try {
			selenium.assertNotEditable("normal_select");
		}
		catch (Throwable e) {
			sawThrow6 = true;
		}
		verifyTrue(sawThrow6);
		

		boolean sawThrow8 = false;
		try {
			selenium.assertEditable("disabled_text");
		}
		catch (Throwable e) {
			sawThrow8 = true;
		}
		verifyTrue(sawThrow8);
		

		boolean sawThrow10 = false;
		try {
			selenium.assertEditable("disabled_select");
		}
		catch (Throwable e) {
			sawThrow10 = true;
		}
		verifyTrue(sawThrow10);
		

		boolean sawThrow12 = false;
		try {
			selenium.assertEditable("fake_input");
		}
		catch (Throwable e) {
			sawThrow12 = true;
		}
		verifyTrue(sawThrow12);
		

		checkForVerificationErrors();
	}
}
