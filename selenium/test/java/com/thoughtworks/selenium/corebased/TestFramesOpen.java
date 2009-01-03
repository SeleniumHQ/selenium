package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestFramesOpen extends SeleneseTestNgHelper {
	@Test public void testFramesOpen() throws Exception {
		selenium.open("../tests/html/Frames.html");
		selenium.selectFrame("mainFrame");
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_open\\.html$"));
		verifyTrue(selenium.isTextPresent("This is a test of the open command."));
		selenium.open("../tests/html/test_page.slow.html");
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_page\\.slow\\.html$"));
		verifyEquals(selenium.getTitle(), "Slow Loading Page");
		selenium.setTimeout("5000");
		selenium.open("../tests/html/test_open.html");
		selenium.open("../tests/html/test_open.html");
		selenium.open("../tests/html/test_open.html");
	}
}
