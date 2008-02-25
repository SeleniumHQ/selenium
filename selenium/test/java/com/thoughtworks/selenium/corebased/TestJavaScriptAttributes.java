package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestJavaScriptAttributes.html.
 */
public class TestJavaScriptAttributes extends SeleneseTestCase
{
   public void testJavaScriptAttributes() throws Throwable {
		try {
			

/* TestJavaScriptAttributes */
			// open|../tests/html/test_javascript_attributes.html|
			selenium.open("/selenium-server/tests/html/test_javascript_attributes.html");
			// click|//a[@onclick="alert('foo')"]|
			selenium.click("//a[@onclick=\"alert('foo')\"]");
			// assertAlert|foo|
			assertEquals("foo", selenium.getAlert());

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
