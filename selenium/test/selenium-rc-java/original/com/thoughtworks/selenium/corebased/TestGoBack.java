package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestGoBack.html.
 */
public class TestGoBack extends SeleneseTestCase
{
   public void testGoBack() throws Throwable {
		try {
			

/* Test Back and Forward */
			// open|../tests/html/test_click_page1.html|
			selenium.open("/selenium-server/tests/html/test_click_page1.html");
			// verifyTitle|Click Page 1|
			verifyEquals("*Click Page 1", selenium.getTitle());

			/* Click a regular link */
			// clickAndWait|link|
			selenium.click("link");
			selenium.waitForPageToLoad("5000");
			// verifyTitle|Click Page Target|
			verifyEquals("*Click Page Target", selenium.getTitle());
			// goBackAndWait||
			selenium.goBack();
			selenium.waitForPageToLoad("5000");
			// verifyTitle|Click Page 1|
			verifyEquals("*Click Page 1", selenium.getTitle());

			/* history.forward() generates 'Permission Denied' in IE>>>>>goForward////////////<<<<<
			// verifyTitle|Click Page Target|
			verifyEquals("*Click Page Target", selenium.getTitle());
 */

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
