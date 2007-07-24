package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestFramesClickJavascriptHref.html.
 */
public class TestFramesClickJavascriptHref extends SeleneseTestCase
{
   public void testFramesClickJavascriptHref() throws Throwable {
		try {
			

/* TestFramesClickJavaScriptHrefInWrongFrame */
			// open|../tests/html/Frames.html|
			selenium.open("/selenium-server/tests/html/Frames.html");
			// selectFrame|mainFrame|
			selenium.selectFrame("mainFrame");
			// open|../tests/html/test_click_javascript_page.html|
			selenium.open("/selenium-server/tests/html/test_click_javascript_page.html");
			// selectFrame|relative=top|
			selenium.selectFrame("relative=top");
			// click|link|
			selenium.click("link");
			// verifyAlert|link clicked: foo|
			verifyEquals("link clicked: foo", selenium.getAlert());

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
