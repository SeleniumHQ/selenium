package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.annotations.Test;

public class TestClickJavascriptHrefWithVoidChrome extends
    InternalSelenseTestNgBase {
	@Test(dataProvider = "system-properties") public void testClickJavascriptHrefWithVoidChrome() throws Exception {
		selenium.open("../tests/html/test_click_javascript_href_void_chrome.html");
		selenium.click("linkWithJavascriptVoidHref");
		verifyEquals(selenium.getAlert(), "onclick:voidHref");
		selenium.click("changeHref");
		verifyEquals(selenium.getAlert(), "changeHref");
		selenium.click("deleteElement");
		verifyFalse(selenium.isElementPresent("deleteElement"));
		selenium.click("id=e");
		verifyEquals(selenium.getAlert(), "e");
		verifyFalse(selenium.isElementPresent("id=e"));
	}
}
