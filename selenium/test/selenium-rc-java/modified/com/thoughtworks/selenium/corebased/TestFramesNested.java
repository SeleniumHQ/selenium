package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestFramesNested.html.
 */
public class TestFramesNested extends SeleneseTestCase
{
   public void testFramesNested() throws Throwable {
		try {
			

/* TestFramesNested */
			// open|../tests/html/NestedFrames.html|
			selenium.open("/selenium-server/tests/html/NestedFrames.html");
			// verifyTitle|NestedFrames|
			verifyEquals("*NestedFrames", selenium.getTitle());
			assertTrue(!selenium.isTextPresent("This is a test"));
			// selectFrame|mainFrame|
			selenium.selectFrame("mainFrame");
			// verifyTitle|NestedFrames2|
			verifyEquals("*NestedFrames2", selenium.getTitle());
			// selectFrame|mainFrame|
			selenium.selectFrame("mainFrame");
			// verifyTitle|AUT|
			verifyEquals("*AUT", selenium.getTitle());
			// selectFrame|mainFrame|
			selenium.selectFrame("mainFrame");
			// verifyLocation|*/tests/html/test_open.html|
			verifyEquals("*/tests/html/test_open.html", selenium.getLocation());
			assertTrue(selenium.isTextPresent("This is a test"));
			// selectFrame|relative=up|
			selenium.selectFrame("relative=up");
			// verifyTitle|AUT|
			verifyEquals("*AUT", selenium.getTitle());
			assertTrue(!selenium.isTextPresent("This is a test"));
			// selectFrame|relative=top|
			selenium.selectFrame("relative=top");
			// verifyTitle|NestedFrames|
			verifyEquals("*NestedFrames", selenium.getTitle());
			// selectFrame|dom=window.frames[1]|
			selenium.selectFrame("dom=window.frames[1]");
			// verifyTitle|NestedFrames2|
			verifyEquals("*NestedFrames2", selenium.getTitle());
			// selectFrame|relative=top|
			selenium.selectFrame("relative=top");
			// verifyTitle|NestedFrames|
			verifyEquals("*NestedFrames", selenium.getTitle());
			// selectFrame|foo|
			selenium.selectFrame("foo");
			// verifyTitle|NestedFrames2|
			verifyEquals("*NestedFrames2", selenium.getTitle());
			// selectFrame|relative=top|
			selenium.selectFrame("relative=top");
			// verifyTitle|NestedFrames|
			verifyEquals("*NestedFrames", selenium.getTitle());
			// selectFrame|dom=window.frames["mainFrame"].frames["mainFrame"]|
			selenium.selectFrame("dom=window.frames[\"mainFrame\"].frames[\"mainFrame\"]");
			// verifyTitle|AUT|
			verifyEquals("*AUT", selenium.getTitle());

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
