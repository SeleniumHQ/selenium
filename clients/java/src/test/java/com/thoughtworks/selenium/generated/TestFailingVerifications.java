package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestFailingVerifications.html.
 */
public class TestFailingVerifications extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Failing Verifications", "info");
  
/* Test Failing Verifications */
			// open|./tests/html/test_verifications.html|
			selenium.open("./tests/html/test_verifications.html");

		boolean sawThrow4 = false;
		try {
			selenium.assertLocation("/tests/html/not_test_verifications.html");
		}
		catch (Exception e) {
			sawThrow4 = true;
		}
		verifyTrue(sawThrow4);
		

		boolean sawThrow6 = false;
		try {
						// assertValue|theText|not the text value
			assertEquals("not the text value", selenium.getValue("theText"));
		}
		catch (Exception e) {
			sawThrow6 = true;
		}
		verifyTrue(sawThrow6);
		

		boolean sawThrow8 = false;
		try {
						// assertNotValue|theText|the text value
			assertNotEquals("the text value", selenium.getValue("theText"));
		}
		catch (Exception e) {
			sawThrow8 = true;
		}
		verifyTrue(sawThrow8);
		

		boolean sawThrow10 = false;
		try {
						// assertValue|theHidden|not the hidden value
			assertEquals("not the hidden value", selenium.getValue("theHidden"));
		}
		catch (Exception e) {
			sawThrow10 = true;
		}
		verifyTrue(sawThrow10);
		

		boolean sawThrow12 = false;
		try {
						// assertText|theSpan|this is not the span
			assertEquals("this is not the span", selenium.getText("theSpan"));
		}
		catch (Exception e) {
			sawThrow12 = true;
		}
		verifyTrue(sawThrow12);
		

		boolean sawThrow14 = false;
		try {
						// assertTextPresent|this is not the span|
			assertTrue(this.getText().indexOf("this is not the span")!=-1);
		}
		catch (Exception e) {
			sawThrow14 = true;
		}
		verifyTrue(sawThrow14);
		

		boolean sawThrow16 = false;
		try {
						// assertTextNotPresent|this is the span|
			assertFalse(this.getText().indexOf("this is the span")!=-1);
		}
		catch (Exception e) {
			sawThrow16 = true;
		}
		verifyTrue(sawThrow16);
		

		boolean sawThrow18 = false;
		try {
			selenium.assertElementPresent("notTheSpan");
		}
		catch (Exception e) {
			sawThrow18 = true;
		}
		verifyTrue(sawThrow18);
		

		boolean sawThrow20 = false;
		try {
			selenium.assertElementNotPresent("theSpan");
		}
		catch (Exception e) {
			sawThrow20 = true;
		}
		verifyTrue(sawThrow20);
		

		boolean sawThrow22 = false;
		try {
						// assertTable|theTable.1.0|a
			assertEquals("a", selenium.getTable("theTable.1.0"));
		}
		catch (Exception e) {
			sawThrow22 = true;
		}
		verifyTrue(sawThrow22);
		

		boolean sawThrow24 = false;
		try {
			selenium.assertSelected("theSelect", "index=2");
		}
		catch (Exception e) {
			sawThrow24 = true;
		}
		verifyTrue(sawThrow24);
		

		boolean sawThrow26 = false;
		try {
			selenium.assertSelected("theSelect", "value=opt*3");
		}
		catch (Exception e) {
			sawThrow26 = true;
		}
		verifyTrue(sawThrow26);
		

		boolean sawThrow28 = false;
		try {
			selenium.assertSelected("theSelect", "third option");
		}
		catch (Exception e) {
			sawThrow28 = true;
		}
		verifyTrue(sawThrow28);
		

		boolean sawThrow30 = false;
		try {
			String[] tmp2 = {"first\\\\,option", "second option"};
			// assertSelectOptions|theSelect|first\\\\,option,second option
			assertEquals(tmp2, selenium.getSelectOptions("theSelect"));
		}
		catch (Exception e) {
			sawThrow30 = true;
		}
		verifyTrue(sawThrow30);
		

		boolean sawThrow32 = false;
		try {
						// assertAttribute|theText@class|bar
			assertEquals("bar", selenium.getAttribute("theText@class"));
		}
		catch (Exception e) {
			sawThrow32 = true;
		}
		verifyTrue(sawThrow32);
		

		boolean sawThrow34 = false;
		try {
						// assertNotAttribute|theText@class|foo
			assertNotEquals("foo", selenium.getAttribute("theText@class"));
		}
		catch (Exception e) {
			sawThrow34 = true;
		}
		verifyTrue(sawThrow34);
		

		checkForVerificationErrors();
	}
}
