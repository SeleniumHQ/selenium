package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestSubmit.html.
 */
public class TestSubmit extends SeleneseTestCase
{
   public void testSubmit() throws Throwable {
		try {
			

/* TestSubmit */
			// open|../tests/html/test_submit.html|
			selenium.open("/selenium-server/tests/html/test_submit.html");
			// submit|searchForm|
			selenium.submit("searchForm");
			// assertAlert|onsubmit called|
			assertEquals("onsubmit called", selenium.getAlert());
			// check|okayToSubmit|
			selenium.check("okayToSubmit");
			// submit|searchForm|
			selenium.submit("searchForm");
			// assertAlert|onsubmit called|
			assertEquals("onsubmit called", selenium.getAlert());
			// assertAlert|form submitted|
			assertEquals("form submitted", selenium.getAlert());

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
