package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.SeleneseTestNgHelper;
import org.testng.annotations.Test;

public class TestFunkEventHandling extends SeleneseTestNgHelper {
	@Test public void testFunkEventHandling() throws Exception {
		selenium.open("../tests/html/test_funky_event_handling.html");
		selenium.click("clickMe");
		Thread.sleep(1000);
		verifyFalse(selenium.isTextPresent("You shouldn't be here!"));
	}
}
