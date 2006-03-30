package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestWaitFor.html.
 */
public class TestWaitFor extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test WaitFor", "info");
  
/* Test WaitForValue       */
			// open|./tests/html/test_async_event.html|
			selenium.open("./tests/html/test_async_event.html");
			// assertValue|theField|oldValue
			assertEquals("oldValue", selenium.getValue("theField"));
			// click|theButton|
			selenium.click("theButton");
			// assertValue|theField|oldValue
			assertEquals("oldValue", selenium.getValue("theField"));
			// waitForValue|theField|regexp:n[aeiou]wValue
			assertEquals("regexp:n[aeiou]wValue", selenium.getValue("theField"));
			// verifyValue|theField|newValue
			verifyEquals("newValue", selenium.getValue("theField"));
			// assertText|theSpan|Some text
			assertEquals("Some text", selenium.getText("theSpan"));
			// click|theSpanButton|
			selenium.click("theSpanButton");
			// assertText|theSpan|Some text
			assertEquals("Some text", selenium.getText("theSpan"));
			// waitForText|theSpan|regexp:Some n[aeiou]w text
			assertEquals("regexp:Some n[aeiou]w text", selenium.getText("theSpan"));
			// verifyText|theSpan|Some new text
			verifyEquals("Some new text", selenium.getText("theSpan"));
			// click|theAlertButton|
			selenium.click("theAlertButton");
			// waitForAlert|regexp:An [aeiou]lert|
			assertEquals("regexp:An [aeiou]lert", selenium.getAlert());
			// open|./tests/html/test_reload_onchange_page.html|
			selenium.open("./tests/html/test_reload_onchange_page.html");
			// click|theLink|
			selenium.click("theLink");
			// waitForTitle|Slow Loading Page|
			assertEquals("Slow Loading Page", selenium.getTitle());
			// verifyTitle|Slow Loading Page|
			verifyEquals("Slow Loading Page", selenium.getTitle());

		checkForVerificationErrors();
	}
}
