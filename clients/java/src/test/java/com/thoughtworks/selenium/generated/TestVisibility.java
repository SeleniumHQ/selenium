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
		catch (Exception e) {
			sawThrow4 = true;
		}
		verifyFalse(sawThrow4);
		

		boolean sawThrow5 = false;
		try {
			// originally verifyNotVisible|hiddenParagraph|
		selenium.assertNotVisible("hiddenParagraph");
		}
		catch (Exception e) {
			sawThrow5 = true;
		}
		verifyFalse(sawThrow5);
		

		boolean sawThrow6 = false;
		try {
			// originally verifyNotVisible|suppressedParagraph|
		selenium.assertNotVisible("suppressedParagraph");
		}
		catch (Exception e) {
			sawThrow6 = true;
		}
		verifyFalse(sawThrow6);
		

		boolean sawThrow7 = false;
		try {
			// originally verifyNotVisible|classSuppressedParagraph|
		selenium.assertNotVisible("classSuppressedParagraph");
		}
		catch (Exception e) {
			sawThrow7 = true;
		}
		verifyFalse(sawThrow7);
		

		boolean sawThrow8 = false;
		try {
			// originally verifyNotVisible|jsClassSuppressedParagraph|
		selenium.assertNotVisible("jsClassSuppressedParagraph");
		}
		catch (Exception e) {
			sawThrow8 = true;
		}
		verifyFalse(sawThrow8);
		

		boolean sawThrow9 = false;
		try {
			// originally verifyNotVisible|hiddenSubElement|
		selenium.assertNotVisible("hiddenSubElement");
		}
		catch (Exception e) {
			sawThrow9 = true;
		}
		verifyFalse(sawThrow9);
		

		boolean sawThrow10 = false;
		try {
			// originally verifyVisible|visibleSubElement|
		selenium.assertVisible("visibleSubElement");
		}
		catch (Exception e) {
			sawThrow10 = true;
		}
		verifyFalse(sawThrow10);
		

		boolean sawThrow11 = false;
		try {
			// originally verifyNotVisible|suppressedSubElement|
		selenium.assertNotVisible("suppressedSubElement");
		}
		catch (Exception e) {
			sawThrow11 = true;
		}
		verifyFalse(sawThrow11);
		

		boolean sawThrow12 = false;
		try {
			// originally verifyNotVisible|jsHiddenParagraph|
		selenium.assertNotVisible("jsHiddenParagraph");
		}
		catch (Exception e) {
			sawThrow12 = true;
		}
		verifyFalse(sawThrow12);
		

		boolean sawThrow13 = false;
		try {
			// originally verifyNotVisible|nonExistantElement|
		selenium.assertNotVisible("nonExistantElement");
		}
		catch (Exception e) {
			sawThrow13 = true;
		}
		verifyFalse(sawThrow13);
		

		checkForVerificationErrors();
	}
}
