package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;
import org.junit.Test;

public class TestFunkEventHandling extends InternalSelenseTestBase {
	@Test public void testFunkEventHandling() throws Exception {
		selenium.open("../tests/html/test_funky_event_handling.html");
		selenium.click("clickMe");
		Thread.sleep(1000);
		verifyFalse(selenium.isTextPresent("You shouldn't be here!"));
	}
}
