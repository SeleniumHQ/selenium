package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestStore extends SeleneseTestNgHelper {
	@Test public void testStore() throws Exception {
		selenium.open("../tests/html/test_verifications.html");
		String storedHiddenValue = selenium.getValue("theHidden");
		String storedSpanText = selenium.getText("theSpan");
		String storedTextClass = selenium.getAttribute("theText@class");
		String storedTitle = selenium.getTitle();
		String textVariable = "PLAIN TEXT";
		String javascriptVariable = selenium.getEval("'Pi ~= ' +\n (Math.round(Math.PI * 100) / 100)");
		selenium.open("../tests/html/test_store_value.html");
		selenium.type("theText", storedHiddenValue);
		verifyEquals(selenium.getValue("theText"), "the hidden value");
		selenium.type("theText", storedSpanText);
		verifyEquals(selenium.getValue("theText"), "this is the span");
		selenium.type("theText", storedTextClass);
		verifyEquals(selenium.getValue("theText"), "foo");
		selenium.type("theText", textVariable);
		verifyEquals(selenium.getValue("theText"), "PLAIN TEXT");
		selenium.type("theText", javascriptVariable);
		verifyEquals(selenium.getValue("theText"), "Pi ~= 3.14");
		selenium.type("theText", storedTitle);
		verifyEquals(selenium.getValue("theText"), "theTitle");
		//  Test multiple output variables in a single expression 
		selenium.type("theText", "'" + storedHiddenValue + "'_'" + storedSpanText + "'");
		verifyEquals(selenium.getValue("theText"), "'the hidden value'_'this is the span'");
		//  backward compatibility 
		selenium.open("../tests/html/test_just_text.html");
		String storedBodyText = selenium.getBodyText();
		selenium.open("../tests/html/test_store_value.html");
		verifyEquals(selenium.getValue("theText"), "");
		selenium.type("theText", storedBodyText);
		verifyEquals(selenium.getValue("theText"), "This is the entire text of the page.");
		verifyEquals(selenium.getExpression(storedBodyText), "This is the entire text of the page.");
	}
}
