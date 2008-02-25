package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestOpenInTargetFrame.html.
 */
public class TestOpenInTargetFrame extends SeleneseTestCase
{
   public void testOpenInTargetFrame() throws Throwable {
		try {
			

/* TestOpenInTargetFrame */
			// open|../tests/html/test_open_in_target_frame.html|
			selenium.open("/selenium-server/tests/html/test_open_in_target_frame.html");
			// selectFrame|rightFrame|
			selenium.selectFrame("rightFrame");
			// click|link=Show new frame in leftFrame|
			selenium.click("link=Show new frame in leftFrame");

			/* we are forced to do a pause instead of clickandwait here,                for currently we can not detect target frame loading in ie yet */
			// pause|1500|
			pause(1500);
			assertTrue(selenium.isTextPresent("Show new frame in leftFrame"));
			// selectFrame|relative=top|
			selenium.selectFrame("relative=top");
			// selectFrame|leftFrame|
			selenium.selectFrame("leftFrame");
			assertTrue(selenium.isTextPresent("content loaded"));
			assertTrue(!selenium.isTextPresent("This is frame LEFT"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
