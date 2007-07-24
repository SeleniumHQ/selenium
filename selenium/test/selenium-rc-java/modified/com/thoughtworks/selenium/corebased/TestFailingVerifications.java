package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestFailingVerifications.html.
 */
public class TestFailingVerifications extends SeleneseTestCase
{
   public void testFailingVerifications() throws Throwable {
		try {
			

/* Test Failing Verifications */
			// open|../tests/html/test_verifications.html|
			selenium.open("/selenium-server/tests/html/test_verifications.html");

			boolean sawThrow4 = false;
			try {
							// assertLocation|*/tests/html/not_test_verifications.html|
			assertEquals("*/tests/html/not_test_verifications.html", selenium.getLocation());
			}
			catch (Throwable e) {
				sawThrow4 = true;
			}
			verifyTrue(sawThrow4);
			

			boolean sawThrow6 = false;
			try {
							// assertValue|theText|not the text value
			assertEquals("not the text value", selenium.getValue("theText"));
			}
			catch (Throwable e) {
				sawThrow6 = true;
			}
			verifyTrue(sawThrow6);
			

			boolean sawThrow8 = false;
			try {
							// assertNotValue|theText|the text value
			assertNotEquals("the text value", selenium.getValue("theText"));
			}
			catch (Throwable e) {
				sawThrow8 = true;
			}
			verifyTrue(sawThrow8);
			

			boolean sawThrow10 = false;
			try {
							// assertValue|theHidden|not the hidden value
			assertEquals("not the hidden value", selenium.getValue("theHidden"));
			}
			catch (Throwable e) {
				sawThrow10 = true;
			}
			verifyTrue(sawThrow10);
			

			boolean sawThrow12 = false;
			try {
							// assertText|theSpan|this is not the span
			assertEquals("this is not the span", selenium.getText("theSpan"));
			}
			catch (Throwable e) {
				sawThrow12 = true;
			}
			verifyTrue(sawThrow12);
			

			boolean sawThrow14 = false;
			try {
							assertTrue(selenium.isTextPresent("this is not the span"));
			}
			catch (Throwable e) {
				sawThrow14 = true;
			}
			verifyTrue(sawThrow14);
			

			boolean sawThrow16 = false;
			try {
							assertTrue(!selenium.isTextPresent("this is the span"));
			}
			catch (Throwable e) {
				sawThrow16 = true;
			}
			verifyTrue(sawThrow16);
			

			boolean sawThrow18 = false;
			try {
							assertTrue(selenium.isElementPresent("notTheSpan"));
			}
			catch (Throwable e) {
				sawThrow18 = true;
			}
			verifyTrue(sawThrow18);
			

			boolean sawThrow20 = false;
			try {
							assertTrue(!selenium.isElementPresent("theSpan"));
			}
			catch (Throwable e) {
				sawThrow20 = true;
			}
			verifyTrue(sawThrow20);
			

			boolean sawThrow22 = false;
			try {
							// assertTable|theTable.2.0|a
			assertEquals("a", selenium.getTable("theTable.2.0"));
			}
			catch (Throwable e) {
				sawThrow22 = true;
			}
			verifyTrue(sawThrow22);
			

			boolean sawThrow24 = false;
			try {
							assertEquals("2", selenium.getSelectedIndex("theSelect"));
			}
			catch (Throwable e) {
				sawThrow24 = true;
			}
			verifyTrue(sawThrow24);
			

			boolean sawThrow26 = false;
			try {
							assertEquals("opt*3", selenium.getSelectedValue("theSelect"));
			}
			catch (Throwable e) {
				sawThrow26 = true;
			}
			verifyTrue(sawThrow26);
			

			boolean sawThrow28 = false;
			try {
							assertEquals("third option", selenium.getSelectedLabel("theSelect"));
			}
			catch (Throwable e) {
				sawThrow28 = true;
			}
			verifyTrue(sawThrow28);
			

			boolean sawThrow30 = false;
			try {
							String[] tmp1 = {"first\\\\,option", "second option"};
			// assertSelectOptions|theSelect|first\\\\,option,second option
			assertEquals(tmp1, selenium.getSelectOptions("theSelect"));
			}
			catch (Throwable e) {
				sawThrow30 = true;
			}
			verifyTrue(sawThrow30);
			

			boolean sawThrow32 = false;
			try {
							// assertAttribute|theText@class|bar
			assertEquals("bar", selenium.getAttribute("theText@class"));
			}
			catch (Throwable e) {
				sawThrow32 = true;
			}
			verifyTrue(sawThrow32);
			

			boolean sawThrow34 = false;
			try {
							// assertNotAttribute|theText@class|foo
			assertNotEquals("foo", selenium.getAttribute("theText@class"));
			}
			catch (Throwable e) {
				sawThrow34 = true;
			}
			verifyTrue(sawThrow34);
			

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
