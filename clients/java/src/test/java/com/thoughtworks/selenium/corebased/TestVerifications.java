package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestVerifications.html.
 */
public class TestVerifications extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Verifications", "info");
  
/* Test Verifications       */
		// open|./tests/html/test_verifications.html?foo=bar|
		selenium.open("./tests/html/test_verifications.html?foo=bar");
selenium.assertLocation("/tests/html/test_verifications.html");
selenium.assertLocation("/tests/html/test_verifications.html?foo=bar");
		// verifyValue|theText|the text value
		verifyEquals("the text value", selenium.getValue("theText"));
		// verifyNotValue|theText|not the text value
		verifyNotEquals("not the text value", selenium.getValue("theText"));
		// verifyValue|theHidden|the hidden value
		verifyEquals("the hidden value", selenium.getValue("theHidden"));
		// verifyText|theSpan|this is the span
		verifyEquals("this is the span", selenium.getText("theSpan"));
		// verifyNotText|theSpan|blah blah
		verifyNotEquals("blah blah", selenium.getText("theSpan"));
		// verifyTextPresent|this is the span|
		verifyTrue(this.getText().indexOf("this is the span")!=-1);
		// verifyTextNotPresent|this is not the span|
		verifyFalse(this.getText().indexOf("this is not the span")!=-1);

		boolean sawThrow13 = false;
		try {
			// originally verifyElementPresent|theSpan|
		selenium.assertElementPresent("theSpan");
		}
		catch (Throwable e) {
			sawThrow13 = true;
		}
		verifyFalse(sawThrow13);
		

		boolean sawThrow14 = false;
		try {
			// originally verifyElementPresent|theText|
		selenium.assertElementPresent("theText");
		}
		catch (Throwable e) {
			sawThrow14 = true;
		}
		verifyFalse(sawThrow14);
		

		boolean sawThrow15 = false;
		try {
			// originally verifyElementNotPresent|unknown|
		selenium.assertElementNotPresent("unknown");
		}
		catch (Throwable e) {
			sawThrow15 = true;
		}
		verifyFalse(sawThrow15);
		
		// verifyTable|theTable.1.0|c
		verifyEquals("c", selenium.getTable("theTable.1.0"));

		boolean sawThrow17 = false;
		try {
			// originally verifySelected|theSelect|index=1
		selenium.assertSelected("theSelect", "index=1");
		}
		catch (Throwable e) {
			sawThrow17 = true;
		}
		verifyFalse(sawThrow17);
		

		boolean sawThrow18 = false;
		try {
			// originally verifySelected|theSelect|value=option2
		selenium.assertSelected("theSelect", "value=option2");
		}
		catch (Throwable e) {
			sawThrow18 = true;
		}
		verifyFalse(sawThrow18);
		

		/* This is an example of why you can't just find the first option that           matches and then verify that it is the selected option. */

		boolean sawThrow21 = false;
		try {
			// originally verifySelected|theSelect|value=opt*
		selenium.assertSelected("theSelect", "value=opt*");
		}
		catch (Throwable e) {
			sawThrow21 = true;
		}
		verifyFalse(sawThrow21);
		

		boolean sawThrow22 = false;
		try {
			// originally verifySelected|theSelect|label=second option
		selenium.assertSelected("theSelect", "label=second option");
		}
		catch (Throwable e) {
			sawThrow22 = true;
		}
		verifyFalse(sawThrow22);
		

		boolean sawThrow23 = false;
		try {
			// originally verifySelected|theSelect|second option
		selenium.assertSelected("theSelect", "second option");
		}
		catch (Throwable e) {
			sawThrow23 = true;
		}
		verifyFalse(sawThrow23);
		

		boolean sawThrow24 = false;
		try {
			// originally verifySelected|theSelect|id=o2
		selenium.assertSelected("theSelect", "id=o2");
		}
		catch (Throwable e) {
			sawThrow24 = true;
		}
		verifyFalse(sawThrow24);
		
String[] tmp1 = {"first option", "second option", "third\\,\\,option"};
		// verifySelectOptions|theSelect|first option,second option,third\\,\\,option
		verifyEquals(tmp1, selenium.getSelectOptions("theSelect"));
		// verifyAttribute|theText@class|foo
		verifyEquals("foo", selenium.getAttribute("theText@class"));
		// verifyNotAttribute|theText@class|fox
		verifyNotEquals("fox", selenium.getAttribute("theText@class"));
		// verifyTitle|theTitle|
		verifyEquals("theTitle", selenium.getTitle());
		// verifyNotTitle|Blah Blah|
		verifyNotEquals("Blah Blah", selenium.getTitle());

		checkForVerificationErrors();
	}
}
