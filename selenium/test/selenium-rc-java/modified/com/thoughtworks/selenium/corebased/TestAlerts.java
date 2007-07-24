package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestAlerts.html.
 */
public class TestAlerts extends SeleneseTestCase
{
   public void testAlerts() throws Throwable {
		try {
			

/* Test Alert verifyment */
			// open|../tests/html/test_verify_alert.html|
			selenium.open("/selenium-server/tests/html/test_verify_alert.html");
			// verifyAlertNotPresent||
			assertTrue(!selenium.isAlertPresent());
			// assertAlertNotPresent||
			assertTrue(!selenium.isAlertPresent());
			// click|oneAlert|
			selenium.click("oneAlert");
			// verifyAlertPresent||
			assertTrue(selenium.isAlertPresent());
			boolean sawCondition8 = false;
			for (int second = 0; second < 60; second++) {
				try {
					if ((selenium.isAlertPresent())) {
						sawCondition8 = true;
						break;
					}
				}
				catch (Exception ignore) {
				}
				pause(1000);
			}
			assertTrue(sawCondition8);
			
			// assertAlertPresent||
			assertTrue(selenium.isAlertPresent());
			// verifyAlert|Store Below 494 degrees K!|
			verifyEquals("Store Below 494 degrees K!", selenium.getAlert());
			// click|oneAlert|
			selenium.click("oneAlert");
			// storeAlert|myVar|
			String myVar = selenium.getAlert();
			// verifyExpression|${myVar}|Store Below 494 degrees K!
			verifyEquals(myVar, "Store Below 494 degrees K!");
			// click|twoAlerts|
			selenium.click("twoAlerts");
			// verifyAlert|* 220 degrees C!|
			verifyEquals("* 220 degrees C!", selenium.getAlert());
			// verifyAlert|regexp:^Store Below 429 degrees F!|
			verifyEquals("regexp:^Store Below 429 degrees F!", selenium.getAlert());
			// clickAndWait|alertAndLeave|
			selenium.click("alertAndLeave");
			selenium.waitForPageToLoad("30000");
			// verifyAlert|I'm Melting! I'm Melting!|
			verifyEquals("I'm Melting! I'm Melting!", selenium.getAlert());
			// open|../tests/html/test_verify_alert.html|
			selenium.open("/selenium-server/tests/html/test_verify_alert.html");

			boolean sawThrow20 = false;
			try {
							// assertAlert|noAlert|
			assertEquals("noAlert", selenium.getAlert());
			}
			catch (Throwable e) {
				sawThrow20 = true;
			}
			verifyTrue(sawThrow20);
			
			// click|oneAlert|
			selenium.click("oneAlert");

			boolean sawThrow23 = false;
			try {
							// assertAlert|wrongAlert|
			assertEquals("wrongAlert", selenium.getAlert());
			}
			catch (Throwable e) {
				sawThrow23 = true;
			}
			verifyTrue(sawThrow23);
			
			// click|twoAlerts|
			selenium.click("twoAlerts");

			boolean sawThrow26 = false;
			try {
							// assertAlert|Store Below 429 degrees F!|
			assertEquals("Store Below 429 degrees F!", selenium.getAlert());
			}
			catch (Throwable e) {
				sawThrow26 = true;
			}
			verifyTrue(sawThrow26);
			

			boolean sawThrow28 = false;
			try {
							// assertAlert|Store Below 220 degrees C!|
			assertEquals("Store Below 220 degrees C!", selenium.getAlert());
			}
			catch (Throwable e) {
				sawThrow28 = true;
			}
			verifyTrue(sawThrow28);
			
			// click|oneAlert|
			selenium.click("oneAlert");

			boolean sawThrow31 = false;
			try {
							// open|../tests/html/test_assert_alert.html|
			selenium.open("/selenium-server/tests/html/test_assert_alert.html");
			}
			catch (Throwable e) {
				sawThrow31 = true;
			}
			assertTrue(sawThrow31);
			

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
