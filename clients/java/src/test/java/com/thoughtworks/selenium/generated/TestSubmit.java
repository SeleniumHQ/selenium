package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestSubmit.html.
 */
public class TestSubmit extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("TestSubmit", "info");
  
/* TestSubmit       */
			// open|./tests/html/test_submit.html|
			selenium.open("./tests/html/test_submit.html");
			// submit|searchForm|
			selenium.submit("searchForm");
			// assertAlert|onsubmit called|
			assertEquals("onsubmit called", selenium.getAlert());
			// check|okayToSubmit|
			selenium.check("okayToSubmit");
			// submit|searchForm|
			selenium.submit("searchForm");
			// assertAlert|onsubmit called|
			assertEquals("onsubmit called", selenium.getAlert());
			// assertAlert|form submitted|
			assertEquals("form submitted", selenium.getAlert());

		checkForVerificationErrors();
	}
}
