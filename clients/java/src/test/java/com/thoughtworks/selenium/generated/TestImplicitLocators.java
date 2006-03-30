package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestImplicitLocators.html.
 */
public class TestImplicitLocators extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Implicit Locators", "info");
  
/* Test Implicit Locators       */
			// open|./tests/html/test_locators.html|
			selenium.open("./tests/html/test_locators.html");
			// verifyText|id1|this is the first element
			verifyEquals("this is the first element", selenium.getText("id1"));
			// verifyAttribute|id1@class|a1
			verifyEquals("a1", selenium.getAttribute("id1@class"));
			// verifyText|name1|this is the second element
			verifyEquals("this is the second element", selenium.getText("name1"));
			// verifyAttribute|name1@class|a2
			verifyEquals("a2", selenium.getAttribute("name1@class"));
			// verifyText|document.links[1]|this is the second element
			verifyEquals("this is the second element", selenium.getText("document.links[1]"));
			// verifyAttribute|document.links[1]@class|a2
			verifyEquals("a2", selenium.getAttribute("document.links[1]@class"));
			// verifyAttribute|//img[contains(@src, 'banner.gif')]/@alt|banner
			verifyEquals("banner", selenium.getAttribute("//img[contains(@src, 'banner.gif')]/@alt"));
			// verifyText|//body/a[2]|this is the second element
			verifyEquals("this is the second element", selenium.getText("//body/a[2]"));

		checkForVerificationErrors();
	}
}
