package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestOpen.html.
 */
public class TestOpen extends SeleneseTestCase
{
   public void testOpen() throws Throwable {
		try {
			

/* Test Open */
			// open|../tests/html/test_open.html|
			selenium.open("/selenium-server/tests/html/test_open.html");
			// verifyLocation|*/tests/html/test_open.html|
			verifyEquals("*/tests/html/test_open.html", selenium.getLocation());

			/* Should really split these verifications into their own test file. */
			// verifyLocation|regexp:.*/tests/html/[Tt]est_open.html|
			verifyEquals("regexp:.*/tests/html/[Tt]est_open.html", selenium.getLocation());
			// verifyNotLocation|*/foo.html|
			verifyNotEquals("*/foo.html", selenium.getLocation());
			assertTrue(selenium.isTextPresent("glob:This is a test of the open command."));
			assertTrue(selenium.isTextPresent("This is a test of the open command."));
			assertTrue(selenium.isTextPresent("exact:This is a test of"));
			assertTrue(selenium.isTextPresent("regexp:This is a test of"));
			assertTrue(selenium.isTextPresent("regexp:T*his is a test of"));
			assertTrue(!selenium.isTextPresent("exact:XXXXThis is a test of"));
			assertTrue(!selenium.isTextPresent("regexp:ThXXXXXXXXXis is a test of"));
			// open|../tests/html/test_page.slow.html|
			selenium.open("/selenium-server/tests/html/test_page.slow.html");
			// verifyLocation|*/tests/html/test_page.slow.html|
			verifyEquals("*/tests/html/test_page.slow.html", selenium.getLocation());
			// verifyTitle|Slow Loading Page|
			verifyEquals("*Slow Loading Page", selenium.getTitle());

			// open|../tests/html/test_open.html|
			selenium.open("/selenium-server/tests/html/test_open.html");
			// open|../tests/html/test_open.html|
			selenium.open("/selenium-server/tests/html/test_open.html");
			// open|../tests/html/test_open.html|
			selenium.open("/selenium-server/tests/html/test_open.html");

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
