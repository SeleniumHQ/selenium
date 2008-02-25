package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestFramesOpen.html.
 */
public class TestFramesOpen extends SeleneseTestCase
{
   public void testFramesOpen() throws Throwable {
		try {
			

/* TestFramesOpen */
			// open|../tests/html/Frames.html|
			selenium.open("/selenium-server/tests/html/Frames.html");
			// selectFrame|mainFrame|
			selenium.selectFrame("mainFrame");
			// verifyLocation|*/tests/html/test_open.html|
			verifyEquals("*/tests/html/test_open.html", selenium.getLocation());
			assertTrue(selenium.isTextPresent("This is a test of the open command."));
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
