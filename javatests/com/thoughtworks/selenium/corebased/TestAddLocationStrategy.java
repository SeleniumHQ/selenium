package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.annotations.Test;

public class TestAddLocationStrategy extends InternalSelenseTestNgBase {
  @Test(dataProvider = "system-properties")
	 public void testAddLocationStrategy() throws Exception {
		selenium.open("../tests/html/test_click_page1.html");
		selenium.addLocationStrategy("foo", "return inDocument.getElementById(locator);");
		assertTrue(selenium.isElementPresent("foo=link"));
		selenium.refresh();
		selenium.waitForPageToLoad("30000");
		assertTrue(selenium.isElementPresent("foo=link"));
		try { selenium.addLocationStrategy("bar", "[[[;"); fail("expected failure"); } catch (Throwable e) {}
		selenium.addLocationStrategy("bar", "thisVariableDoesNotExist;");
		try { assertTrue(selenium.isElementPresent("bar=link")); fail("expected failure"); } catch (Throwable e) {}
	}
}
