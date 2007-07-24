package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestProxy.html.
 */
public class TestProxy extends SeleneseTestCase
{
   public void testProxy() throws Throwable {
		try {
			

/* Test Proxy */
			// open|http://www.yahoo.com|/
			selenium.open("http://www.yahoo.com");
			// type|fp|Selenium
			selenium.type("fp", "Selenium");
			// clickAndWait|st|
			selenium.click("st");
			selenium.waitForPageToLoad("5000");
			// open|http://www.google.com|/
			selenium.open("http://www.google.com");
			// type|q|Selenium
			selenium.type("q", "Selenium");
			// clickAndWait|btnG|
			selenium.click("btnG");
			selenium.waitForPageToLoad("5000");

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
	public void setUp() throws Exception {
		super.setUp("http://www.yahoo.com");
	}
}
