package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestFramesSpecialTargets.html.
 */
public class TestFramesSpecialTargets extends SeleneseTestCase
{
   public void testFramesSpecialTargets() throws Throwable {
		try {
			

/* TestFramesSpecialTargets */
			// openWindow|../tests/html/Frames.html|SpecialTargets
			selenium.openWindow("../tests/html/Frames.html", "SpecialTargets");
			// waitForPopUp|SpecialTargets|10000
			selenium.waitForPopUp("SpecialTargets", "10000");
			// selectWindow|SpecialTargets|
			selenium.selectWindow("SpecialTargets");
			// selectFrame|bottomFrame|
			selenium.selectFrame("bottomFrame");
			// clickAndWait|changeTop|
			selenium.click("changeTop");
			selenium.waitForPageToLoad("5000");
			// click|changeSpan|
			selenium.click("changeSpan");
			// open|../tests/html/Frames.html|
			selenium.open("/selenium-server/tests/html/Frames.html");
			// selectFrame|bottomFrame|
			selenium.selectFrame("bottomFrame");
			// clickAndWait|changeParent|
			selenium.click("changeParent");
			selenium.waitForPageToLoad("5000");
			// click|changeSpan|
			selenium.click("changeSpan");
			// close||
			selenium.close();

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
