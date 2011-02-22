package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;
import org.junit.Test;

public class TestRefresh extends InternalSelenseTestBase {
	@Test public void testRefresh() throws Exception {
		selenium.open("../tests/html/test_page.slow.html");
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_page\\.slow\\.html$"));
		verifyEquals(selenium.getTitle(), "Slow Loading Page");
		selenium.click("changeSpan");
		assertTrue(selenium.isTextPresent("Changed the text"));
		selenium.refresh();
		selenium.waitForPageToLoad("30000");
		assertFalse(selenium.isTextPresent("Changed the text"));
		selenium.click("changeSpan");
		assertTrue(selenium.isTextPresent("Changed the text"));
		selenium.click("slowRefresh");
		selenium.waitForPageToLoad("30000");
		assertFalse(selenium.isTextPresent("Changed the text"));
		selenium.click("changeSpan");
		assertTrue(selenium.isTextPresent("Changed the text"));
		selenium.click("id=slowRefreshJavascriptHref");
		selenium.waitForPageToLoad("30000");
		assertFalse(selenium.isTextPresent("Changed the text"));
		selenium.click("anchor");
		selenium.click("changeSpan");
		assertTrue(selenium.isTextPresent("Changed the text"));
		selenium.refresh();
		selenium.waitForPageToLoad("30000");
		assertFalse(selenium.isTextPresent("Changed the text"));
	}
}
