package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestConfirmations.html.
 */
public class TestConfirmations extends SeleneseTestCase
{
   public void testConfirmations() throws Throwable {
		try {
			

/* Test verify Confirmation */
			// open|../tests/html/test_confirm.html|
			selenium.open("/selenium-server/tests/html/test_confirm.html");
			// chooseCancelOnNextConfirmation||
			selenium.chooseCancelOnNextConfirmation();
			// click|confirmAndLeave|
			selenium.click("confirmAndLeave");
			// verifyConfirmationPresent||
			assertTrue(selenium.isConfirmationPresent());
			boolean sawCondition7 = false;
			for (int second = 0; second < 60; second++) {
				try {
					if ((selenium.isConfirmationPresent())) {
						sawCondition7 = true;
						break;
					}
				}
				catch (Exception ignore) {
				}
				pause(1000);
			}
			assertTrue(sawCondition7);
			
			// assertConfirmationPresent||
			assertTrue(selenium.isConfirmationPresent());
			// verifyConfirmation|You are about to go to a dummy page.|
			verifyEquals("You are about to go to a dummy page.", selenium.getConfirmation());
			// verifyTitle|Test Confirm|
			verifyEquals("*Test Confirm", selenium.getTitle());
			// clickAndWait|confirmAndLeave|
			selenium.click("confirmAndLeave");
			selenium.waitForPageToLoad("5000");
			// verifyConfirmation|*dummy page*|
			verifyEquals("*dummy page*", selenium.getConfirmation());
			// verifyTitle|Dummy Page|
			verifyEquals("*Dummy Page", selenium.getTitle());
			// open|../tests/html/test_confirm.html|
			selenium.open("/selenium-server/tests/html/test_confirm.html");
			// verifyTitle|Test Confirm|
			verifyEquals("*Test Confirm", selenium.getTitle());
			// chooseCancelOnNextConfirmation||
			selenium.chooseCancelOnNextConfirmation();
			// chooseOkOnNextConfirmation||
			selenium.chooseOkOnNextConfirmation();
			// clickAndWait|confirmAndLeave|
			selenium.click("confirmAndLeave");
			selenium.waitForPageToLoad("5000");
			// verifyConfirmation|*dummy page*|
			verifyEquals("*dummy page*", selenium.getConfirmation());
			// verifyTitle|Dummy Page|
			verifyEquals("*Dummy Page", selenium.getTitle());
			// open|../tests/html/test_confirm.html|
			selenium.open("/selenium-server/tests/html/test_confirm.html");

			boolean sawThrow22 = false;
			try {
							// assertConfirmation|This should fail - there are no confirmations|
			assertEquals("This should fail - there are no confirmations", selenium.getConfirmation());
			}
			catch (Throwable e) {
				sawThrow22 = true;
			}
			verifyTrue(sawThrow22);
			
			// clickAndWait|confirmAndLeave|
			selenium.click("confirmAndLeave");
			selenium.waitForPageToLoad("5000");

			boolean sawThrow25 = false;
			try {
							// assertConfirmation|this should fail - wrong confirmation|
			assertEquals("this should fail - wrong confirmation", selenium.getConfirmation());
			}
			catch (Throwable e) {
				sawThrow25 = true;
			}
			verifyTrue(sawThrow25);
			
			// open|../tests/html/test_confirm.html|
			selenium.open("/selenium-server/tests/html/test_confirm.html");
			// clickAndWait|confirmAndLeave|
			selenium.click("confirmAndLeave");
			selenium.waitForPageToLoad("5000");

			boolean sawThrow29 = false;
			try {
							// open|../tests/html/test_confirm.html|
			selenium.open("/selenium-server/tests/html/test_confirm.html");
			}
			catch (Throwable e) {
				sawThrow29 = true;
			}
			assertTrue(sawThrow29);
			

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
