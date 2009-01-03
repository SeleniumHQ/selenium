package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestImplicitLocators extends SeleneseTestNgHelper {
	@Test public void testImplicitLocators() throws Exception {
		selenium.open("../tests/html/test_locators.html");
		verifyEquals(selenium.getText("id1"), "this is the first element");
		verifyEquals(selenium.getAttribute("id1@class"), "a1");
		verifyEquals(selenium.getText("name1"), "this is the second element");
		verifyEquals(selenium.getAttribute("name1@class"), "a2");
		verifyEquals(selenium.getText("document.links[1]"), "this is the second element");
		verifyEquals(selenium.getAttribute("document.links[1]@class"), "a2");
		verifyEquals(selenium.getAttribute("//img[contains(@src, 'banner.gif')]/@alt"), "banner");
		verifyEquals(selenium.getText("//body/a[2]"), "this is the second element");
	}
}
