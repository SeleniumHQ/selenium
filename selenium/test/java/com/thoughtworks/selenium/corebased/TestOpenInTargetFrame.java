package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestOpenInTargetFrame extends SeleneseTestNgHelper {
	@Test public void testOpenInTargetFrame() throws Exception {
		selenium.open("../tests/html/test_open_in_target_frame.html");
		selenium.selectFrame("rightFrame");
		selenium.click("link=Show new frame in leftFrame");
		//  we are forced to do a pause instead of clickandwait here,
		//                 for currently we can not detect target frame loading in ie yet 
		Thread.sleep(1500);
		verifyTrue(selenium.isTextPresent("Show new frame in leftFrame"));
		selenium.selectFrame("relative=top");
		selenium.selectFrame("leftFrame");
		verifyTrue(selenium.isTextPresent("content loaded"));
		verifyFalse(selenium.isTextPresent("This is frame LEFT"));
	}
}
