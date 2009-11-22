package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestHtmlSource extends SeleneseTestNgHelper {
	@Test public void testHtmlSource() throws Exception {
		selenium.open("../tests/html/test_html_source.html");
		verifyTrue(selenium.getHtmlSource().matches("^[\\s\\S]*Text is here[\\s\\S]*$"));
		verifyFalse(selenium.getHtmlSource().matches("^[\\s\\S]*can not be found[\\s\\S]*$"));
	}
}
