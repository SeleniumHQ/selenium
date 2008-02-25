package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestVerifications.html.
 */
public class TestVerifications extends SeleneseTestCase
{
   public void testVerifications() throws Throwable {
		try {
			

/* Test Verifications */
			// open|../tests/html/test_verifications.html?foo=bar|
			selenium.open("/selenium-server/tests/html/test_verifications.html?foo=bar");
			// verifyLocation|*/tests/html/test_verifications.html*|
			verifyEquals("*/tests/html/test_verifications.html*", selenium.getLocation());
			// verifyLocation|*/tests/html/test_verifications.html?foo=bar|
			verifyEquals("*/tests/html/test_verifications.html?foo=bar", selenium.getLocation());
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
			assertTrue(selenium.isTextPresent("this is the span"));
			assertTrue(!selenium.isTextPresent("this is not the span"));

			boolean sawThrow13 = false;
			try {
				// originally verifyElementPresent|theSpan|
						assertTrue(selenium.isElementPresent("theSpan"));
			}
			catch (Throwable e) {
				sawThrow13 = true;
			}
			verifyFalse(sawThrow13);
			

			boolean sawThrow14 = false;
			try {
				// originally verifyElementPresent|theText|
						assertTrue(selenium.isElementPresent("theText"));
			}
			catch (Throwable e) {
				sawThrow14 = true;
			}
			verifyFalse(sawThrow14);
			

			boolean sawThrow15 = false;
			try {
				// originally verifyElementNotPresent|unknown|
						assertTrue(!selenium.isElementPresent("unknown"));
			}
			catch (Throwable e) {
				sawThrow15 = true;
			}
			verifyFalse(sawThrow15);
			
			// verifyTable|theTable.0.0|th1
			verifyEquals("th1", selenium.getTable("theTable.0.0"));
			// verifyTable|theTable.1.0|a
			verifyEquals("a", selenium.getTable("theTable.1.0"));
			// verifyTable|theTable.2.1|d
			verifyEquals("d", selenium.getTable("theTable.2.1"));
			// verifyTable|theTable.3.1|f2
			verifyEquals("f2", selenium.getTable("theTable.3.1"));

			boolean sawThrow20 = false;
			try {
				// originally verifySelected|theSelect|index=1
						assertEquals("1", selenium.getSelectedIndex("theSelect"));
			}
			catch (Throwable e) {
				sawThrow20 = true;
			}
			verifyFalse(sawThrow20);
			

			boolean sawThrow21 = false;
			try {
				// originally verifySelected|theSelect|value=option2
						assertEquals("option2", selenium.getSelectedValue("theSelect"));
			}
			catch (Throwable e) {
				sawThrow21 = true;
			}
			verifyFalse(sawThrow21);
			

			boolean sawThrow22 = false;
			try {
				// originally verifySelected|theSelect|label=second option
						assertEquals("second option", selenium.getSelectedLabel("theSelect"));
			}
			catch (Throwable e) {
				sawThrow22 = true;
			}
			verifyFalse(sawThrow22);
			

			boolean sawThrow23 = false;
			try {
				// originally verifySelected|theSelect|second option
						assertEquals("second option", selenium.getSelectedLabel("theSelect"));
			}
			catch (Throwable e) {
				sawThrow23 = true;
			}
			verifyFalse(sawThrow23);
			

			boolean sawThrow24 = false;
			try {
				// originally verifySelected|theSelect|id=o2
						assertEquals("o2", selenium.getSelectedId("theSelect"));
			}
			catch (Throwable e) {
				sawThrow24 = true;
			}
			verifyFalse(sawThrow24);
			
			String[] tmp13 = {"first option", "second option", "third,,option"};
			// verifySelectOptions|theSelect|first option,second option,third\\,\\,option
			verifyEquals(tmp13, selenium.getSelectOptions("theSelect"));
			// verifyAttribute|theText@class|foo
			verifyEquals("foo", selenium.getAttribute("theText@class"));
			// verifyNotAttribute|theText@class|fox
			verifyNotEquals("fox", selenium.getAttribute("theText@class"));
			// verifyTitle|theTitle|
			verifyEquals("*theTitle", selenium.getTitle());
			// verifyNotTitle|Blah Blah|
			verifyNotEquals("*Blah Blah", selenium.getTitle());

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
