package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestEval extends SeleneseTestNgHelper {
	@Test public void testEval() throws Exception {
		selenium.open("../tests/html/test_open.html");
		assertEquals(selenium.getEval("window.document.title"), "Open Test");
	}
}
