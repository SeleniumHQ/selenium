package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestHtmlSource.html.
 */
public class TestHtmlSource extends SeleneseTestCase
{
   public void testHtmlSource() throws Throwable {
		try {
			

/* Test HtmlSource */
			// open|../tests/html/test_html_source.html|
			selenium.open("/selenium-server/tests/html/test_html_source.html");
			// verifyHtmlSource|*Text is here*|
			verifyEquals("*Text is here*", selenium.getHtmlSource());
			// verifyNotHtmlSource|*can not be found*|
			verifyNotEquals("*can not be found*", selenium.getHtmlSource());

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
