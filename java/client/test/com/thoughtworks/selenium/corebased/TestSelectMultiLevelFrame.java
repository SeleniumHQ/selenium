package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.annotations.Test;

public class TestSelectMultiLevelFrame extends InternalSelenseTestNgBase {
	@Test public void testSelectMultiLevelFrame() throws Exception {
		selenium.open("../tests/html/test_multi_level_frame.html");
		//  Select first level frame 
		selenium.selectFrame("frame2");
		selenium.selectFrame("theFrame");
		assertTrue(selenium.isTextPresent("Click here for next page via absolute link"));
	}
}
