package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestVisibility.html.
 */
public class TestVisibility extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Visiblity", "info");
  
/* Test Visiblity       */
		// open|./tests/html/test_visibility.html|
		selenium.open("./tests/html/test_visibility.html");

		boolean sawThrow4 = false;
		try {
			// originally verifyVisible|visibleParagraph|
		selenium.assertVisible("visibleParagraph");
		}
		catch (Throwable e) {
			sawThrow4 = true;
		}
		verifyFalse(sawThrow4);
		

		boolean sawThrow5 = false;
		try {
			// originally verifyNotVisible|hiddenParagraph|
		selenium.assertNotVisible("hiddenParagraph");
		}
		catch (Throwable e) {
			sawThrow5 = true;
		}
		verifyFalse(sawThrow5);
		

		boolean sawThrow6 = false;
		try {
			// originally verifyNotVisible|suppressedParagraph|
		selenium.assertNotVisible("suppressedParagraph");
		}
		catch (Throwable e) {
			sawThrow6 = true;
		}
		verifyFalse(sawThrow6);
		

		boolean sawThrow7 = false;
		try {
			// originally verifyNotVisible|classSuppressedParagraph|
		selenium.assertNotVisible("classSuppressedParagraph");
		}
		catch (Throwable e) {
			sawThrow7 = true;
		}
		verifyFalse(sawThrow7);
		

		boolean sawThrow8 = false;
		try {
			// originally verifyNotVisible|jsClassSuppressedParagraph|
		selenium.assertNotVisible("jsClassSuppressedParagraph");
		}
		catch (Throwable e) {
			sawThrow8 = true;
		}
		verifyFalse(sawThrow8);
		

		boolean sawThrow9 = false;
		try {
			// originally verifyNotVisible|hiddenSubElement|
		selenium.assertNotVisible("hiddenSubElement");
		}
		catch (Throwable e) {
			sawThrow9 = true;
		}
		verifyFalse(sawThrow9);
		

		boolean sawThrow10 = false;
		try {
			// originally verifyVisible|visibleSubElement|
		selenium.assertVisible("visibleSubElement");
		}
		catch (Throwable e) {
			sawThrow10 = true;
		}
		verifyFalse(sawThrow10);
		

		boolean sawThrow11 = false;
		try {
			// originally verifyNotVisible|suppressedSubElement|
		selenium.assertNotVisible("suppressedSubElement");
		}
		catch (Throwable e) {
			sawThrow11 = true;
		}
		verifyFalse(sawThrow11);
		

		boolean sawThrow12 = false;
		try {
			// originally verifyNotVisible|jsHiddenParagraph|
		selenium.assertNotVisible("jsHiddenParagraph");
		}
		catch (Throwable e) {
			sawThrow12 = true;
		}
		verifyFalse(sawThrow12);
		

		boolean sawThrow13 = false;
		try {
			// originally verifyNotVisible|nonExistantElement|
		selenium.assertNotVisible("nonExistantElement");
		}
		catch (Throwable e) {
			sawThrow13 = true;
		}
		verifyFalse(sawThrow13);
		

		checkForVerificationErrors();
	}
}
