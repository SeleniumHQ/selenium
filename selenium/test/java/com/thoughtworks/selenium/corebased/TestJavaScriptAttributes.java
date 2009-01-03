package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestJavaScriptAttributes extends SeleneseTestNgHelper {
	@Test public void testJavaScriptAttributes() throws Exception {
		selenium.open("../tests/html/test_javascript_attributes.html");
		selenium.click("//a[@onclick=\"alert('foo')\"]");
		assertEquals(selenium.getAlert(), "foo");
	}
}
