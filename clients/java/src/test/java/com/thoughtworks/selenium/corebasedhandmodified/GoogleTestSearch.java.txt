package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/shared/p4/Dev/selenium-rc_svn/trunk/core/javascript/tests/GoogleTestSearch.html.
 */
public class GoogleTestSearch extends SeleneseTestCase
{
   public void testGoogleTestSearch() throws Throwable {
   	try {

/* Google Test Search */
		// open|http://www.google.com|
		selenium.open("http://www.google.com/webhp");
		// verifyTitle|Google|
		verifyEquals("*Google", selenium.getTitle());
		// type|q|Selenium OpenQA
		selenium.type("q", "Selenium OpenQA");
		// verifyValue|q|Selenium OpenQA
		verifyEquals("Selenium OpenQA", selenium.getValue("q"));
		// clickAndWait|btnG|
		selenium.click("btnG");
		selenium.waitForPageToLoad("30000");
		assertTrue(selenium.isTextPresent("openqa.org"));
		// verifyTitle|Selenium OpenQA - Google Search|
		verifyEquals("*Selenium OpenQA - Google Search", selenium.getTitle());

		checkForVerificationErrors();
            }
            finally {
            	clearVerificationErrors();
            }
	}
	public void setUp() throws Exception {
		super.setUp("http://www.google.com");
	}
}
