package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestUIElementLocators extends SeleneseTestNgHelper {
	@Test public void testUIElementLocators() throws Exception {
		selenium.addScript("", "uimap");
		selenium.open("../tests/html/test_locators.html");
		verifyEquals(selenium.getText("ui=pageset1::linksWithId()"), "this is the first element");
		verifyEquals(selenium.getText("ui=pageset1::linksWithId(index=1)"), "this is the first element");
		verifyTrue(selenium.getText("ui=pageset1::linksWithId(index=2)").matches("^this is the[\\s\\S]*second[\\s\\S]*element$"));
		verifyEquals(selenium.getText("ui=pageset1::linksWithId(index=3)"), "this is the third element");
		verifyEquals(selenium.getText("ui=pageset1::fourthLink()"), "this is the fourth element");
		verifyEquals(selenium.getText("ui=pageset1::fifthLink()"), "this is the fifth element");
		verifyEquals(selenium.getText("ui=pageset1::linksWithId()->//span"), "element");
		verifyEquals(selenium.getText("ui=pageset2::cell(text=theHeaderText)"), "theHeaderText");
		verifyEquals(selenium.getText("ui=pageset2::cell(text=theCellText)"), "theCellText");
		verifyEquals(selenium.getEval("map.getUISpecifierString(selenium.browserbot.findElement('id=firstChild'), selenium.browserbot.getDocument())"), "ui=pageset3::anyDiv()->/child::span");
		selenium.removeScript("uimap");
	}
}
