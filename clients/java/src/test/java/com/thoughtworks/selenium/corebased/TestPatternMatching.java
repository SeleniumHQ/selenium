package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestPatternMatching.html.
 */
public class TestPatternMatching extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Pattern Matching", "info");
  
/* Test Pattern Matching       */
		// open|./tests/html/test_verifications.html|
		selenium.open("./tests/html/test_verifications.html");

		/* check glob (wildcard) matching */
		// verifyValue|theText|*text*
		verifyEquals("*text*", selenium.getValue("theText"));
		// verifyValue|theHidden|* hidden value
		verifyEquals("* hidden value", selenium.getValue("theHidden"));
		// verifyText|theSpan|* span
		verifyEquals("* span", selenium.getText("theSpan"));

		boolean sawThrow9 = false;
		try {
			// originally verifySelected|theSelect|second *
		selenium.assertSelected("theSelect", "second *");
		}
		catch (Throwable e) {
			sawThrow9 = true;
		}
		verifyFalse(sawThrow9);
		
String[] tmp3 = {"first*", "second*", "third*"};
		// verifySelectOptions|theSelect|first*,second*,third*
		verifyEquals(tmp3, selenium.getSelectOptions("theSelect"));
		// verifyAttribute|theText@class|?oo
		verifyEquals("?oo", selenium.getAttribute("theText@class"));
		// verifyValue|theTextarea|Line 1*
		verifyEquals("Line 1*", selenium.getValue("theTextarea"));

		/* check regexp (wildcard) matching */
		// verifyValue|theText|regexp:^[a-z ]+$
		verifyEquals("regexp:^[a-z ]+$", selenium.getValue("theText"));
		// verifyValue|theHidden|regexp:dd
		verifyEquals("regexp:dd", selenium.getValue("theHidden"));
		// verifyText|theSpan|regexp:span$
		verifyEquals("regexp:span$", selenium.getText("theSpan"));

		boolean sawThrow18 = false;
		try {
			// originally verifySelected|theSelect|regexp:second .*
		selenium.assertSelected("theSelect", "regexp:second .*");
		}
		catch (Throwable e) {
			sawThrow18 = true;
		}
		verifyFalse(sawThrow18);
		
		// verifyAttribute|theText@class|regexp:^f
		verifyEquals("regexp:^f", selenium.getAttribute("theText@class"));

		/* check exact matching */
		// verifyValue|theText|exact:the text value
		verifyEquals("exact:the text value", selenium.getValue("theText"));

		boolean sawThrow23 = false;
		try {
			// originally verifySelected|theSelect|exact:second option
		selenium.assertSelected("theSelect", "exact:second option");
		}
		catch (Throwable e) {
			sawThrow23 = true;
		}
		verifyFalse(sawThrow23);
		

		/* check a mixture of strategies */
String[] tmp4 = {"regexp:^first.*?", "second option", "third.*"};
		// verifySelectOptions|theSelect|regexp:^first.*?,second option,third.*
		verifyEquals(tmp4, selenium.getSelectOptions("theSelect"));

		checkForVerificationErrors();
	}
}
