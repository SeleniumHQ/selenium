package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestProxy.html.
 */
public class TestProxy extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Proxy", "info");
  
/* Test Proxy       */
		// open|http://www.yahoo.com|/
		selenium.open("http://www.yahoo.com");
		// type|fp|Selenium
		selenium.type("fp", "Selenium");
		// clickAndWait|st|
		selenium.click("st");
		selenium.waitForPageToLoad("60000");
		// open|http://www.google.com|/
		selenium.open("http://www.google.com");
		// type|q|Selenium
		selenium.type("q", "Selenium");
		// clickAndWait|btnG|
		selenium.click("btnG");
		selenium.waitForPageToLoad("60000");

		checkForVerificationErrors();
	}
}
