package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;
import org.junit.Test;

public class TestSelectMultiLevelFrame extends InternalSelenseTestBase {
	@Test public void testSelectMultiLevelFrame() throws Exception {
		selenium.open("../tests/html/test_multi_level_frame.html");
		//  Select first level frame 
		selenium.selectFrame("frame2");
		selenium.selectFrame("theFrame");
		assertTrue(selenium.isTextPresent("Click here for next page via absolute link"));
	}
}
