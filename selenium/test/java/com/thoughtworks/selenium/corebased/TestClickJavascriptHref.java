package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestClickJavascriptHref.html.
 */
public class TestClickJavascriptHref extends SeleneseTestCase
{
   public void testClickJavascriptHref() throws Throwable {
		try {
			

/* TestClickJavaScriptHref */
			// open|../tests/html/test_click_javascript_page.html|
			selenium.open("/selenium-server/tests/html/test_click_javascript_page.html");
			// click|link|
			selenium.click("link");
			// verifyAlert|link clicked: foo|
			verifyEquals("link clicked: foo", selenium.getAlert());
			// click|linkWithMultipleJavascriptStatements|
			selenium.click("linkWithMultipleJavascriptStatements");
			// verifyAlert|alert1|
			verifyEquals("alert1", selenium.getAlert());
			// verifyAlert|alert2|
			verifyEquals("alert2", selenium.getAlert());
			// verifyAlert|alert3|
			verifyEquals("alert3", selenium.getAlert());
			// click|linkWithJavascriptVoidHref|
			selenium.click("linkWithJavascriptVoidHref");
			// verifyAlert|onclick
			verifyEquals("onclick", selenium.getAlert());
			// verifyTitle|Click Page 1|
			verifyEquals("*Click Page 1", selenium.getTitle());
			// click|linkWithOnclickReturnsFalse|
			selenium.click("linkWithOnclickReturnsFalse");
			// verifyTitle|Click Page 1|
			verifyEquals("*Click Page 1", selenium.getTitle());
			// click|enclosedImage|
			selenium.click("enclosedImage");
			// verifyAlert|enclosedImage clicked|
			verifyEquals("enclosedImage clicked", selenium.getAlert());

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
