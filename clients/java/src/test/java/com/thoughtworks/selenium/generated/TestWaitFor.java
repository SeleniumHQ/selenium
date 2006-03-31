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
		boolean sawCondition7 = false;
		for (int second = 0; second < 60; second++) {
			if (seleniumEquals("newValue", selenium.getValue("theField"))) {
				sawCondition7 = true;
				break;
			}
			pause(1000);
		}
		assertTrue(sawCondition7);
		
		// verifyValue|theField|regexp:n[aeiou]wValue
		verifyEquals("regexp:n[aeiou]wValue", selenium.getValue("theField"));
		// assertText|theSpan|Some text
		assertEquals("Some text", selenium.getText("theSpan"));
		// click|theSpanButton|
		selenium.click("theSpanButton");
		// assertText|theSpan|Some text
		assertEquals("Some text", selenium.getText("theSpan"));
		boolean sawCondition12 = false;
		for (int second = 0; second < 60; second++) {
			if (seleniumEquals("regexp:Some n[aeiou]w text", selenium.getText("theSpan"))) {
				sawCondition12 = true;
				break;
			}
			pause(1000);
		}
		assertTrue(sawCondition12);
		
		// verifyText|theSpan|Some new text
		verifyEquals("Some new text", selenium.getText("theSpan"));
		// click|theAlertButton|
		selenium.click("theAlertButton");
		boolean sawCondition15 = false;
		for (int second = 0; second < 60; second++) {
			if (seleniumEquals("regexp:An [aeiou]lert", selenium.getAlert())) {
				sawCondition15 = true;
				break;
			}
			pause(1000);
		}
		assertTrue(sawCondition15);
		
		// open|./tests/html/test_reload_onchange_page.html|
		selenium.open("./tests/html/test_reload_onchange_page.html");
		// click|theLink|
		selenium.click("theLink");
		boolean sawCondition18 = false;
		for (int second = 0; second < 60; second++) {
			if (seleniumEquals("Slow Loading Page", selenium.getTitle())) {
				sawCondition18 = true;
				break;
			}
			pause(1000);
		}
		assertTrue(sawCondition18);
		
		// verifyTitle|Slow Loading Page|
		verifyEquals("Slow Loading Page", selenium.getTitle());

		checkForVerificationErrors();
	}
}
