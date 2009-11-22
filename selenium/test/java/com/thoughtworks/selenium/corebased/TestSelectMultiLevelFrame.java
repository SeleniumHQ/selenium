package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestSelectMultiLevelFrame extends SeleneseTestNgHelper {
	@Test public void testSelectMultiLevelFrame() throws Exception {
		selenium.open("../tests/html/test_multi_level_frame.html");
		//  Select first level frame 
		selenium.selectFrame("frame2");
		selenium.selectFrame("theFrame");
		assertTrue(selenium.isTextPresent("Click here for next page via absolute link"));
	}
}
