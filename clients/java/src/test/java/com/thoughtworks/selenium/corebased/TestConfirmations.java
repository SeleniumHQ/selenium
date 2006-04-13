package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestConfirmations.html.
 */
public class TestConfirmations extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Confirmation Verifification", "info");
  
/* Test verify Confirmation       */
		// open|./tests/html/test_confirm.html|
		selenium.open("./tests/html/test_confirm.html");
		// chooseCancelOnNextConfirmation||
		selenium.chooseCancelOnNextConfirmation();
		// click|confirmAndLeave|
		selenium.click("confirmAndLeave");
		// verifyConfirmation|You are about to go to a dummy page.|
		verifyEquals("You are about to go to a dummy page.", selenium.getConfirmation());
		// verifyTitle|Test Confirm|
		verifyEquals("Test Confirm", selenium.getTitle());
		// clickAndWait|confirmAndLeave|
		selenium.click("confirmAndLeave");
		selenium.waitForPageToLoad("60000");
		// verifyConfirmation|*dummy page*|
		verifyEquals("*dummy page*", selenium.getConfirmation());
		// verifyTitle|Dummy Page|
		verifyEquals("Dummy Page", selenium.getTitle());

		checkForVerificationErrors();
	}
}
