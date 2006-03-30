package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestVisibilityFailures.html.
 */
public class TestVisibilityFailures extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Visiblity", "info");
  
/* Test Visiblity       */
			// open|./tests/html/test_visibility.html|
			selenium.open("./tests/html/test_visibility.html");

		boolean sawThrow4 = false;
		try {
			selenium.assertNotVisible("visibleParagraph");
		}
		catch (Exception e) {
			sawThrow4 = true;
		}
		verifyTrue(sawThrow4);
		

		boolean sawThrow6 = false;
		try {
			selenium.assertVisible("hiddenParagraph");
		}
		catch (Exception e) {
			sawThrow6 = true;
		}
		verifyTrue(sawThrow6);
		

		boolean sawThrow8 = false;
		try {
			selenium.assertVisible("suppressedParagraph");
		}
		catch (Exception e) {
			sawThrow8 = true;
		}
		verifyTrue(sawThrow8);
		

		boolean sawThrow10 = false;
		try {
			selenium.assertVisible("classSuppressedParagraph");
		}
		catch (Exception e) {
			sawThrow10 = true;
		}
		verifyTrue(sawThrow10);
		

		boolean sawThrow12 = false;
		try {
			selenium.assertVisible("jsClassSuppressedParagraph");
		}
		catch (Exception e) {
			sawThrow12 = true;
		}
		verifyTrue(sawThrow12);
		

		boolean sawThrow14 = false;
		try {
			selenium.assertVisible("hiddenSubElement");
		}
		catch (Exception e) {
			sawThrow14 = true;
		}
		verifyTrue(sawThrow14);
		

		boolean sawThrow16 = false;
		try {
			selenium.assertVisible("suppressedSubElement");
		}
		catch (Exception e) {
			sawThrow16 = true;
		}
		verifyTrue(sawThrow16);
		

		boolean sawThrow18 = false;
		try {
			selenium.assertVisible("jsHiddenParagraph");
		}
		catch (Exception e) {
			sawThrow18 = true;
		}
		verifyTrue(sawThrow18);
		

		boolean sawThrow20 = false;
		try {
			selenium.assertVisible("nonExistantElement");
		}
		catch (Exception e) {
			sawThrow20 = true;
		}
		verifyTrue(sawThrow20);
		

		checkForVerificationErrors();
	}
}
