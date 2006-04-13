package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestSelect.html.
 */
public class TestSelect extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Select", "info");
  
/* Test Select       */
		// open|./tests/html/test_select.html|
		selenium.open("./tests/html/test_select.html");
selenium.assertSelected("theSelect", "Second Option");
		// select|theSelect|index=4
		selenium.select("theSelect", "index=4");

		boolean sawThrow6 = false;
		try {
			// originally verifySelected|theSelect|Fifth Option
		selenium.assertSelected("theSelect", "Fifth Option");
		}
		catch (Throwable e) {
			sawThrow6 = true;
		}
		verifyFalse(sawThrow6);
		
		// select|theSelect|Third Option
		selenium.select("theSelect", "Third Option");

		boolean sawThrow8 = false;
		try {
			// originally verifySelected|theSelect|Third Option
		selenium.assertSelected("theSelect", "Third Option");
		}
		catch (Throwable e) {
			sawThrow8 = true;
		}
		verifyFalse(sawThrow8);
		
		// select|theSelect|label=Fourth Option
		selenium.select("theSelect", "label=Fourth Option");

		boolean sawThrow10 = false;
		try {
			// originally verifySelected|theSelect|Fourth Option
		selenium.assertSelected("theSelect", "Fourth Option");
		}
		catch (Throwable e) {
			sawThrow10 = true;
		}
		verifyFalse(sawThrow10);
		
		// select|theSelect|value=option6
		selenium.select("theSelect", "value=option6");

		boolean sawThrow12 = false;
		try {
			// originally verifySelected|theSelect|Sixth Option
		selenium.assertSelected("theSelect", "Sixth Option");
		}
		catch (Throwable e) {
			sawThrow12 = true;
		}
		verifyFalse(sawThrow12);
		
		// select|theSelect|value=
		selenium.select("theSelect", "value=");

		boolean sawThrow14 = false;
		try {
			// originally verifySelected|theSelect|Empty Value Option
		selenium.assertSelected("theSelect", "Empty Value Option");
		}
		catch (Throwable e) {
			sawThrow14 = true;
		}
		verifyFalse(sawThrow14);
		
		// select|theSelect|id=o4
		selenium.select("theSelect", "id=o4");

		boolean sawThrow16 = false;
		try {
			// originally verifySelected|theSelect|Fourth Option
		selenium.assertSelected("theSelect", "Fourth Option");
		}
		catch (Throwable e) {
			sawThrow16 = true;
		}
		verifyFalse(sawThrow16);
		

		checkForVerificationErrors();
	}
}
