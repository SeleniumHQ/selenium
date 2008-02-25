package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestEval.html.
 */
public class TestEval extends SeleneseTestCase
{
   public void testEval() throws Throwable {
		try {
			

/* Test Eval */
			// open|../tests/html/test_open.html|
			selenium.open("/selenium-server/tests/html/test_open.html");
			// assertEval|window.document.title|Open Test
			assertEquals("Open Test", selenium.getEval("window.document.title"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
