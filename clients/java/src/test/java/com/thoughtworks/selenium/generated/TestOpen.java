package com.thoughtworks.selenium.generated;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestOpen.html.
 */
public class TestOpen extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Open", "info");
  
/* Test Open       */
			// open|./tests/html/test_open.html|
			selenium.open("./tests/html/test_open.html");
selenium.assertLocation("/tests/html/test_open.html");

		/* Should really split these verifications into their own test file. */
			// verifyAbsoluteLocation|regexp:.*/tests/html/[Tt]est_open.html|
			verifyEquals("regexp:.*/tests/html/[Tt]est_open.html", selenium.getAbsoluteLocation());
			// verifyNotAbsoluteLocation|*/foo.html|
			verifyNotEquals("*/foo.html", selenium.getAbsoluteLocation());
			// verifyTextPresent|This is a test of the open command.      |
			verifyTrue(this.getText().indexOf("This is a test of the open command.      ")!=-1);
			// open|./tests/html/test_slowloading_page.html|
			selenium.open("./tests/html/test_slowloading_page.html");
selenium.assertLocation("/tests/html/test_slowloading_page.html");
			// verifyTitle|Slow Loading Page      |
			verifyEquals("Slow Loading Page      ", selenium.getTitle());

		checkForVerificationErrors();
	}
}
