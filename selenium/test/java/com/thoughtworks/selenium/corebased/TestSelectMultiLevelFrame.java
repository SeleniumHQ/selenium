package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestSelectMultiLevelFrame.html.
 */
public class TestSelectMultiLevelFrame extends SeleneseTestCase
{
   public void testSelectMultiLevelFrame() throws Throwable {
		try {
			

/* Test Multi-Level Frame */
			// open|../tests/html/test_multi_level_frame.html|
			selenium.open("/selenium-server/tests/html/test_multi_level_frame.html");

			/* Select first level frame */
			// selectFrame|frame2|
			selenium.selectFrame("frame2");
			// selectFrame|theFrame|
			selenium.selectFrame("theFrame");
			assertTrue(selenium.isTextPresent("Click here for next page via absolute link"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
