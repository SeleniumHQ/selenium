package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestPatternMatching.html.
 */
public class TestPatternMatching extends SeleneseTestCase
{
   public void testPatternMatching() throws Throwable {
		try {
			

/* Test Pattern Matching */
			// open|../tests/html/test_verifications.html|
			selenium.open("/selenium-server/tests/html/test_verifications.html");

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
						assertEquals("second *", selenium.getSelectedLabel("theSelect"));
			}
			catch (Throwable e) {
				sawThrow9 = true;
			}
			verifyFalse(sawThrow9);
			
			String[] tmp8 = {"first*", "second*", "third*"};
			// verifySelectOptions|theSelect|first*,second*,third*
			verifyEquals(tmp8, selenium.getSelectOptions("theSelect"));
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
						assertEquals("regexp:second .*", selenium.getSelectedLabel("theSelect"));
			}
			catch (Throwable e) {
				sawThrow18 = true;
			}
			verifyFalse(sawThrow18);
			
			// verifyAttribute|theText@class|regexp:^f
			verifyEquals("regexp:^f", selenium.getAttribute("theText@class"));
			// verifyValue|theText|regex:^[a-z ]+$
			verifyEquals("regex:^[a-z ]+$", selenium.getValue("theText"));
			// verifyValue|theHidden|regex:dd
			verifyEquals("regex:dd", selenium.getValue("theHidden"));
			// verifyText|theSpan|regex:span$
			verifyEquals("regex:span$", selenium.getText("theSpan"));

			boolean sawThrow23 = false;
			try {
				// originally verifySelected|theSelect|regex:second .*
						assertEquals("regex:second .*", selenium.getSelectedLabel("theSelect"));
			}
			catch (Throwable e) {
				sawThrow23 = true;
			}
			verifyFalse(sawThrow23);
			
			// verifyAttribute|theText@class|regex:^f
			verifyEquals("regex:^f", selenium.getAttribute("theText@class"));

			/* check exact matching */
			// verifyValue|theText|exact:the text value
			verifyEquals("exact:the text value", selenium.getValue("theText"));

			boolean sawThrow28 = false;
			try {
				// originally verifySelected|theSelect|exact:second option
						assertEquals("exact:second option", selenium.getSelectedLabel("theSelect"));
			}
			catch (Throwable e) {
				sawThrow28 = true;
			}
			verifyFalse(sawThrow28);
			

			/* check a mixture of strategies */
			String[] tmp9 = {"regexp:^first.*?", "second option", "third*"};
			// verifySelectOptions|theSelect|regexp:^first.*?,second option,third*
			verifyEquals(tmp9, selenium.getSelectOptions("theSelect"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
