package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from Z:\shared\p4\Dev\selenium-rc_svn\trunk\rc\clients\java\target\selenium-server\tests/TestRefresh.html.
 */
public class TestRefresh extends SeleneseTestCase
{
   public void testRefresh() throws Throwable {
		try {

/* Test Refresh */
			// open|../tests/html/test_page.slow.html|
			selenium.open("/selenium-server/tests/html/test_page.slow.html");
			// verifyLocation|*/tests/html/test_page.slow.html|
			verifyEquals("*/tests/html/test_page.slow.html", selenium.getLocation());
			// verifyTitle|Slow Loading Page|
			verifyEquals("*Slow Loading Page", selenium.getTitle());
			// click|changeSpan|
			selenium.click("changeSpan");
			assertTrue(selenium.isTextPresent("Changed the text"));
			// refreshAndWait||
			selenium.refresh();
			selenium.waitForPageToLoad("5000");
			assertTrue(!selenium.isTextPresent("Changed the text"));
			// click|changeSpan|
			selenium.click("changeSpan");
			assertTrue(selenium.isTextPresent("Changed the text"));
			// clickAndWait|slowRefresh|
			selenium.click("slowRefresh");
			selenium.waitForPageToLoad("5000");
			assertTrue(!selenium.isTextPresent("Changed the text"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
