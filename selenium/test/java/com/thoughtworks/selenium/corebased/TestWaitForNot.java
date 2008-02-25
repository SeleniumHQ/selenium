package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestWaitForNot.html.
 */
public class TestWaitForNot extends SeleneseTestCase
{
   public void testWaitForNot() throws Throwable {
		try {
			

/* Test WaitForValueNot */
			// open|../tests/html/test_async_event.html|
			selenium.open("/selenium-server/tests/html/test_async_event.html");
			// assertValue|theField|oldValue
			assertEquals("oldValue", selenium.getValue("theField"));
			// click|theButton|
			selenium.click("theButton");
			// assertValue|theField|oldValue
			assertEquals("oldValue", selenium.getValue("theField"));
			boolean sawCondition7 = false;
			for (int second = 0; second < 60; second++) {
				try {
					if (!seleniumEquals("regexp:oldValu[aei]", selenium.getValue("theField"))) {
						sawCondition7 = true;
						break;
					}
				}
				catch (Exception ignore) {
				}
				pause(1000);
			}
			assertTrue(sawCondition7);
			
			// verifyValue|theField|newValue
			verifyEquals("newValue", selenium.getValue("theField"));
			// assertText|theSpan|Some text
			assertEquals("Some text", selenium.getText("theSpan"));
			// click|theSpanButton|
			selenium.click("theSpanButton");
			// assertText|theSpan|Some text
			assertEquals("Some text", selenium.getText("theSpan"));
			boolean sawCondition12 = false;
			for (int second = 0; second < 60; second++) {
				try {
					if (!seleniumEquals("regexp:Some te[xyz]t", selenium.getText("theSpan"))) {
						sawCondition12 = true;
						break;
					}
				}
				catch (Exception ignore) {
				}
				pause(1000);
			}
			assertTrue(sawCondition12);
			
			// verifyText|theSpan|Some new text
			verifyEquals("Some new text", selenium.getText("theSpan"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
