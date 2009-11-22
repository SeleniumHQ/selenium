package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestXPathLocatorInXHtml extends SeleneseTestNgHelper {
	@Test public void testXPathLocatorInXHtml() throws Exception {
		selenium.open("../tests/html/test_locators.xhtml");
		verifyTrue(selenium.isElementPresent("xpath=//x:body"));
	}
}
