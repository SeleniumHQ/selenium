package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestSubmit extends SeleneseTestNgHelper {
	@Test public void testSubmit() throws Exception {
		selenium.open("../tests/html/test_submit.html");
		selenium.submit("searchForm");
		assertEquals(selenium.getAlert(), "onsubmit called");
		selenium.check("okayToSubmit");
		selenium.submit("searchForm");
		assertEquals(selenium.getAlert(), "onsubmit called");
		assertEquals(selenium.getAlert(), "form submitted");
	}
}
