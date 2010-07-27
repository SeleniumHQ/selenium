package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.SeleneseTestNgHelper;
import org.testng.annotations.Test;

public class TestFocusOnBlur extends SeleneseTestNgHelper {
	@Test public void testFocusOnBlur() throws Exception {
		selenium.open("../tests/html/test_focus_on_blur.html");
		selenium.type("testInput", "test");
		selenium.fireEvent("testInput", "blur");
		verifyEquals(selenium.getAlert(), "Bad value");
		selenium.type("testInput", "somethingelse");
	}
}
