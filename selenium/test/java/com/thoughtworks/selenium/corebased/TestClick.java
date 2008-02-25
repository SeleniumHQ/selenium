package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestClick.html.
 */
public class TestClick extends SeleneseTestCase
{
   public void testClick() throws Throwable {
		try {
			

/* Test Click */
			// open|../tests/html/test_click_page1.html|
			selenium.open("/selenium-server/tests/html/test_click_page1.html");
			// verifyText|link|Click here for next page
			verifyEquals("Click here for next page", selenium.getText("link"));
			// clickAndWait|link|
			selenium.click("link");
			selenium.waitForPageToLoad("30000");
			// verifyTitle|Click Page Target|
			verifyEquals("*Click Page Target", selenium.getTitle());
			// clickAndWait|previousPage|
			selenium.click("previousPage");
			selenium.waitForPageToLoad("30000");
			// verifyTitle|Click Page 1|
			verifyEquals("*Click Page 1", selenium.getTitle());
			// clickAndWait|linkWithEnclosedImage|
			selenium.click("linkWithEnclosedImage");
			selenium.waitForPageToLoad("30000");
			// verifyTitle|Click Page Target|
			verifyEquals("*Click Page Target", selenium.getTitle());
			// clickAndWait|previousPage|
			selenium.click("previousPage");
			selenium.waitForPageToLoad("30000");
			// clickAndWait|enclosedImage|
			selenium.click("enclosedImage");
			selenium.waitForPageToLoad("30000");
			// verifyTitle|Click Page Target|
			verifyEquals("*Click Page Target", selenium.getTitle());
			// clickAndWait|previousPage|
			selenium.click("previousPage");
			selenium.waitForPageToLoad("30000");
			// clickAndWait|extraEnclosedImage|
			selenium.click("extraEnclosedImage");
			selenium.waitForPageToLoad("30000");
			// verifyTitle|Click Page Target|
			verifyEquals("*Click Page Target", selenium.getTitle());
			// clickAndWait|previousPage|
			selenium.click("previousPage");
			selenium.waitForPageToLoad("30000");
			// click|linkToAnchorOnThisPage|
			selenium.click("linkToAnchorOnThisPage");
			// verifyTitle|Click Page 1|
			verifyEquals("*Click Page 1", selenium.getTitle());

			boolean sawThrow20 = false;
			try {
							// waitForPageToLoad|500|
			selenium.waitForPageToLoad("500");
			}
			catch (Throwable e) {
				sawThrow20 = true;
			}
			assertTrue(sawThrow20);
			

			// click|linkWithOnclickReturnsFalse|
			selenium.click("linkWithOnclickReturnsFalse");
			// pause|300
			pause(300);
			// verifyTitle|Click Page 1|
			verifyEquals("*Click Page 1", selenium.getTitle());

			// open|../tests/html/test_click_page1.html|
			selenium.open("/selenium-server/tests/html/test_click_page1.html");
			// doubleClick|doubleClickable|
			selenium.doubleClick("doubleClickable");
			// assertAlert|double clicked!|
			assertEquals("double clicked!", selenium.getAlert());

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
