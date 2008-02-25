package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestPrompt.html.
 */
public class TestPrompt extends SeleneseTestCase
{
   public void testPrompt() throws Throwable {
		try {
			

/* Test verify Prompting */
			// open|../tests/html/test_prompt.html|
			selenium.open("/selenium-server/tests/html/test_prompt.html");
			// verifyPromptNotPresent||
			assertTrue(!selenium.isPromptPresent());
			// assertPromptNotPresent||
			assertTrue(!selenium.isPromptPresent());
			// answerOnNextPrompt|no|
			selenium.answerOnNextPrompt("no");
			// click|promptAndLeave|
			selenium.click("promptAndLeave");
			// verifyPromptPresent||
			assertTrue(selenium.isPromptPresent());
			boolean sawCondition9 = false;
			for (int second = 0; second < 60; second++) {
				try {
					if ((selenium.isPromptPresent())) {
						sawCondition9 = true;
						break;
					}
				}
				catch (Exception ignore) {
				}
				pause(1000);
			}
			assertTrue(sawCondition9);
			
			// assertPromptPresent||
			assertTrue(selenium.isPromptPresent());
			// verifyPrompt|Type 'yes' and click OK|
			verifyEquals("Type 'yes' and click OK", selenium.getPrompt());
			// verifyTitle|Test Prompt|
			verifyEquals("*Test Prompt", selenium.getTitle());
			// answerOnNextPrompt|yes|
			selenium.answerOnNextPrompt("yes");
			// clickAndWait|promptAndLeave|
			selenium.click("promptAndLeave");
			selenium.waitForPageToLoad("5000");
			// verifyPrompt|*'yes'*|
			verifyEquals("*'yes'*", selenium.getPrompt());
			// verifyTitle|Dummy Page|
			verifyEquals("*Dummy Page", selenium.getTitle());

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
