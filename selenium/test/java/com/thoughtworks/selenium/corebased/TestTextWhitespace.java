package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestTextWhitespace extends SeleneseTestNgHelper {
	@Test public void testTextWhitespace() throws Exception {
		selenium.open("../tests/html/test_text_content.html");
		verifyEquals(selenium.getText("nonTextMarkup"), "There is non-visible and visible markup here that doesn't change the text content");
		//  Match exactly the same space characters 
		verifyEquals(selenium.getText("spaces"), "1 space|2 space|3 space|1 nbsp|2  nbsp|3   nbsp|2  space_nbsp|2  nbsp_space|3   space_nbsp_space|3   nbsp_space_nbsp");
		verifyEquals(selenium.getText("tabcharacter"), "tab character between");
		verifyEquals(selenium.getText("nonVisibleNewlines"), "non visible newlines between");
		verifyTrue(Pattern.compile("visible\\s*newlines\\s*between").matcher(selenium.getText("visibleNewlines")).find());
		verifyNotEquals("visible newlines between", selenium.getText("visibleNewlines"));
		verifyTrue(selenium.getText("paragraphs").matches("^First paragraph[\\s\\S]*Second paragraph$"));
		verifyNotEquals("First paragraph Second paragraph", selenium.getText("paragraphs"));
		verifyTrue(selenium.getText("preformatted").matches("^preformatted[\\s\\S]*newline$"));
		verifyNotEquals("preformatted newline", selenium.getText("preformatted"));
		verifyTrue(selenium.getText("mixedMarkup").matches("^visible[\\s\\S]*newlines and markup and non-visible newlines and markup[\\s\\S]*With[\\s\\S]*a paragraph[\\s\\S]*and[\\s\\S]*pre[\\s\\S]*formatted[\\s\\S]*text$"));
	}
}
