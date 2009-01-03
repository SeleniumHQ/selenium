package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestHighlight extends SeleneseTestNgHelper {
	@Test public void testHighlight() throws Exception {
		selenium.open("../tests/html/test_locators.html");
		selenium.highlight("id1");
	}
}
