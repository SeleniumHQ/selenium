package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestFramesNested extends SeleneseTestNgHelper {
	@Test public void testFramesNested() throws Exception {
		selenium.open("../tests/html/NestedFrames.html");
		verifyEquals(selenium.getTitle(), "NestedFrames");
		verifyFalse(selenium.isTextPresent("This is a test"));
		selenium.selectFrame("mainFrame");
		verifyEquals(selenium.getTitle(), "NestedFrames2");
		selenium.selectFrame("mainFrame");
		verifyEquals(selenium.getTitle(), "AUT");
		selenium.selectFrame("mainFrame");
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_open\\.html$"));
		verifyTrue(selenium.isTextPresent("This is a test"));
		selenium.selectFrame("relative=up");
		verifyEquals(selenium.getTitle(), "AUT");
		verifyFalse(selenium.isTextPresent("This is a test"));
		selenium.selectFrame("relative=top");
		verifyEquals(selenium.getTitle(), "NestedFrames");
		selenium.selectFrame("dom=window.frames[1]");
		verifyEquals(selenium.getTitle(), "NestedFrames2");
		selenium.selectFrame("relative=top");
		verifyEquals(selenium.getTitle(), "NestedFrames");
		selenium.selectFrame("index=1");
		verifyEquals(selenium.getTitle(), "NestedFrames2");
		selenium.selectFrame("relative=top");
		verifyEquals(selenium.getTitle(), "NestedFrames");
		selenium.selectFrame("foo");
		verifyEquals(selenium.getTitle(), "NestedFrames2");
		selenium.selectFrame("relative=top");
		verifyEquals(selenium.getTitle(), "NestedFrames");
		selenium.selectFrame("dom=window.frames[\"mainFrame\"].frames[\"mainFrame\"]");
		verifyEquals(selenium.getTitle(), "AUT");
	}
}
