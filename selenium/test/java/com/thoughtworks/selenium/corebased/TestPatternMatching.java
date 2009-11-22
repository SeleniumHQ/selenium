package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestPatternMatching extends SeleneseTestNgHelper {
	@Test public void testPatternMatching() throws Exception {
		selenium.open("../tests/html/test_verifications.html");
		verifyTrue(selenium.getValue("theText").matches("^[\\s\\S]*text[\\s\\S]*$"));
		verifyTrue(selenium.getValue("theHidden").matches("^[\\s\\S]* hidden value$"));
		verifyTrue(selenium.getText("theSpan").matches("^[\\s\\S]* span$"));
		verifyTrue(selenium.getSelectedLabel("theSelect").matches("^second [\\s\\S]*$"));;
		verifyTrue(join(selenium.getSelectOptions("theSelect"), ',').matches("^first[\\s\\S]*,second[\\s\\S]*,third[\\s\\S]*$"));
		verifyTrue(selenium.getAttribute("theText@class").matches("^[\\s\\S]oo$"));
		verifyTrue(selenium.getValue("theTextarea").matches("^Line 1[\\s\\S]*$"));
		verifyTrue(selenium.getValue("theText").matches("^[a-z ]+$"));
		verifyTrue(Pattern.compile("dd").matcher(selenium.getValue("theHidden")).find());
		verifyFalse(Pattern.compile("DD").matcher(selenium.getValue("theHidden")).find());
		verifyEquals(selenium.getValue("theHidden"), "regexpi:DD");
		verifyTrue(Pattern.compile("span$").matcher(selenium.getText("theSpan")).find());
		verifyTrue(Pattern.compile("second .*").matcher(selenium.getSelectedLabel("theSelect")).find());;
		verifyTrue(Pattern.compile("^f").matcher(selenium.getAttribute("theText@class")).find());
		verifyTrue(selenium.getValue("theText").matches("^[a-z ]+$"));
		verifyTrue(Pattern.compile("dd").matcher(selenium.getValue("theHidden")).find());
		verifyTrue(Pattern.compile("span$").matcher(selenium.getText("theSpan")).find());
		verifyTrue(Pattern.compile("second .*").matcher(selenium.getSelectedLabel("theSelect")).find());;
		verifyTrue(Pattern.compile("^f").matcher(selenium.getAttribute("theText@class")).find());
		verifyEquals(selenium.getValue("theText"), "the text value");
		verifyEquals(selenium.getSelectedLabel("theSelect"), "second option");;
		verifyTrue(Pattern.compile("^first.*?,second option,third*").matcher(join(selenium.getSelectOptions("theSelect"), ',')).find());
	}
}
