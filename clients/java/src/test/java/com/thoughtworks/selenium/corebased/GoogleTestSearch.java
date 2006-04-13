package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/GoogleTestSearch.html.
 */
public class GoogleTestSearch extends SeleneseTestCase
{
    public void setUp() throws Exception {
        super.setUp("http://www.google.com");
    }
   public void test() throws Throwable {
		selenium.setContext("Test Open", "info");
  
/* Google Test Search       */
		// open|http://www.google.com|
		selenium.open("http://www.google.com");
		// verifyTitle|Google|
		verifyEquals("Google", selenium.getTitle());
		// type|q|Selenium OpenQA
		selenium.type("q", "Selenium OpenQA");
		// verifyValue|q|Selenium OpenQA
		verifyEquals("Selenium OpenQA", selenium.getValue("q"));
		// clickAndWait|btnG|
		selenium.click("btnG");
		selenium.waitForPageToLoad("2500");
		// verifyTextPresent|openqa.org|
		verifyTrue(this.getText().indexOf("openqa.org")!=-1);
		// verifyTitle|Selenium OpenQA - Google Search|
		verifyEquals("Selenium OpenQA - Google Search", selenium.getTitle());

		checkForVerificationErrors();
	}
}
