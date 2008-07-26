package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from C:\svn\selenium\rc\trunk\clients\java\target\selenium-server\tests/TestBasicAuth.html.
 */
public class TestBasicAuth extends SeleneseTestCase
{
	
   public void testBasicAuth() throws Throwable {
		try {
			

/* TestBasicAuth */
			// open|http://alice:foo@localhost:4444/selenium-server/tests/html/basicAuth/index.html|
			selenium.open("http://alice:foo@localhost:4444/selenium-server/tests/html/basicAuth/index.html");
			// assertTitle|welcome|
			assertEquals("*Welcome", selenium.getTitle());

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
	public void setUp() throws Exception {
		super.setUp("http://localhost:4444");
	}
}
