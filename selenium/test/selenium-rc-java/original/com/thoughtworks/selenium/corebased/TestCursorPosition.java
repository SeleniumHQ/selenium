package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestCursorPosition.html.
 */
public class TestCursorPosition extends SeleneseTestCase
{
   public void testCursorPosition() throws Throwable {
		try {
			

/* TestCursorPosition */
			// open|../tests/html/test_type_page1.html|
			selenium.open("/selenium-server/tests/html/test_type_page1.html");

			boolean sawThrow4 = false;
			try {
							// assertCursorPosition|username|8
			assertEquals("8", selenium.getCursorPosition("username"));
			}
			catch (Throwable e) {
				sawThrow4 = true;
			}
			verifyTrue(sawThrow4);
			
			// windowFocus||
			selenium.windowFocus();
			// verifyValue|username|
			verifyEquals("", selenium.getValue("username"));
			// type|username|TestUser
			selenium.type("username", "TestUser");
			// setCursorPosition|username|0
			selenium.setCursorPosition("username", "0");
			// verifyCursorPosition|username|0
			verifyEquals("0", selenium.getCursorPosition("username"));
			// setCursorPosition|username|-1
			selenium.setCursorPosition("username", "-1");
			// verifyCursorPosition|username|8
			verifyEquals("8", selenium.getCursorPosition("username"));
			// refreshAndWait||
			selenium.refresh();
			selenium.waitForPageToLoad("5000");

			boolean sawThrow14 = false;
			try {
							// assertCursorPosition|username|8
			assertEquals("8", selenium.getCursorPosition("username"));
			}
			catch (Throwable e) {
				sawThrow14 = true;
			}
			verifyTrue(sawThrow14);
			

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
