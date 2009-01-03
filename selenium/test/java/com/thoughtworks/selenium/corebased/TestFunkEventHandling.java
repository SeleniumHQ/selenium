package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestFunkEventHandling extends SeleneseTestNgHelper {
	@Test public void testFunkEventHandling() throws Exception {
		selenium.open("../tests/html/test_funky_event_handling.html");
		selenium.click("clickMe");
		Thread.sleep(1000);
		verifyFalse(selenium.isTextPresent("You shouldn't be here!"));
	}
}
