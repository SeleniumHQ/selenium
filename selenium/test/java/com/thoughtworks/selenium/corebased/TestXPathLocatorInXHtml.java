package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.SeleneseTestNgHelper;
import org.testng.annotations.Test;

public class TestXPathLocatorInXHtml extends SeleneseTestNgHelper {
	@Test public void testXPathLocatorInXHtml() throws Exception {
		selenium.open("../tests/html/test_locators.xhtml");
		verifyTrue(selenium.isElementPresent("xpath=//x:body"));
	}
}
