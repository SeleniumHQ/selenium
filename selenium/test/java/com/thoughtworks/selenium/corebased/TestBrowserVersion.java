package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestBrowserVersion extends SeleneseTestNgHelper {
	@Test public void testBrowserVersion() throws Exception {
		System.out.println(selenium.getEval("browserVersion.name"));
	}
}
