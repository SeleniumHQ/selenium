package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;
import org.junit.Test;

public class TestXPathLocatorInXHtml extends InternalSelenseTestBase {
	@Test public void testXPathLocatorInXHtml() throws Exception {
		selenium.open("../tests/html/test_locators.xhtml");
		verifyTrue(selenium.isElementPresent("xpath=//x:body"));
	}
}
