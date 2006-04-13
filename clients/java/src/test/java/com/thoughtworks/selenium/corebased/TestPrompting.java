package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestPrompting.html.
 */
public class TestPrompting extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Prompting Verifification", "info");
  
/* Test verify Prompting       */
		// open|./tests/html/test_prompt.html|
		selenium.open("./tests/html/test_prompt.html");
		// answerOnNextPrompt|no|
		selenium.answerOnNextPrompt("no");
		// click|promptAndLeave|
		selenium.click("promptAndLeave");
		// verifyPrompt|Type 'yes' and click OK|
		verifyEquals("Type 'yes' and click OK", selenium.getPrompt());
		// verifyTitle|Test Prompt|
		verifyEquals("Test Prompt", selenium.getTitle());
		// answerOnNextPrompt|yes|
		selenium.answerOnNextPrompt("yes");
		// clickAndWait|promptAndLeave|
		selenium.click("promptAndLeave");
		selenium.waitForPageToLoad("60000");
		// verifyPrompt|*'yes'*|
		verifyEquals("*'yes'*", selenium.getPrompt());
		// verifyTitle|Dummy Page|
		verifyEquals("Dummy Page", selenium.getTitle());

		checkForVerificationErrors();
	}
}
