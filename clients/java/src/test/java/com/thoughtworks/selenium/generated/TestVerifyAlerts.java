package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestVerifyAlerts.html.
 */
public class TestVerifyAlerts extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Alert Verifification", "info");
  
/* Test Alert verifyment       */
			// open|./tests/html/test_verify_alert.html|
			selenium.open("./tests/html/test_verify_alert.html");
			// click|oneAlert|
			selenium.click("oneAlert");
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
		selenium.waitForPageToLoad("60000");
			// verifyAlert|I'm Melting! I'm Melting!|
			verifyEquals("I'm Melting! I'm Melting!", selenium.getAlert());

		checkForVerificationErrors();
	}
}
