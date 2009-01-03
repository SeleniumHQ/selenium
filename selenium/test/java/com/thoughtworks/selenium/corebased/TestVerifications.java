package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestVerifications extends SeleneseTestNgHelper {
	@Test public void testVerifications() throws Exception {
		selenium.open("../tests/html/test_verifications.html?foo=bar");
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_verifications\\.html[\\s\\S]*$"));
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_verifications\\.html[\\s\\S]foo=bar$"));
		verifyEquals(selenium.getValue("theText"), "the text value");
		verifyNotEquals("not the text value", selenium.getValue("theText"));
		verifyEquals(selenium.getValue("theHidden"), "the hidden value");
		verifyEquals(selenium.getText("theSpan"), "this is the span");
		verifyNotEquals("blah blah", selenium.getText("theSpan"));
		verifyTrue(selenium.isTextPresent("this is the span"));
		verifyFalse(selenium.isTextPresent("this is not the span"));
		verifyTrue(selenium.isElementPresent("theSpan"));
		verifyTrue(selenium.isElementPresent("theText"));
		verifyFalse(selenium.isElementPresent("unknown"));
		verifyEquals(selenium.getTable("theTable.0.0"), "th1");
		verifyEquals(selenium.getTable("theTable.1.0"), "a");
		verifyEquals(selenium.getTable("theTable.2.1"), "d");
		verifyEquals(selenium.getTable("theTable.3.1"), "f2");
		verifyEquals(selenium.getSelectedIndex("theSelect"), "1");;
		verifyEquals(selenium.getSelectedValue("theSelect"), "option2");;
		verifyEquals(selenium.getSelectedLabel("theSelect"), "second option");;
		verifyEquals(selenium.getSelectedLabel("theSelect"), "second option");;
		verifyEquals(selenium.getSelectedId("theSelect"), "o2");;
		verifyEquals(join(selenium.getSelectOptions("theSelect"), ','), "first option,second option,third,,option");
		verifyEquals(selenium.getAttribute("theText@class"), "foo");
		verifyNotEquals("fox", selenium.getAttribute("theText@class"));
		verifyEquals(selenium.getTitle(), "theTitle");
		verifyNotEquals("Blah Blah", selenium.getTitle());
	}
}
