package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestAlerts extends SeleneseTestNgHelper {
	@Test public void testAlerts() throws Exception {
		selenium.open("../tests/html/test_verify_alert.html");
		verifyFalse(selenium.isAlertPresent());
		assertFalse(selenium.isAlertPresent());
		selenium.click("oneAlert");
		verifyTrue(selenium.isAlertPresent());
		for (int second = 0;; second++) {
			if (second >= 60) fail("timeout");
			try { if (selenium.isAlertPresent()) break; } catch (Exception e) {}
			Thread.sleep(1000);
		}

		assertTrue(selenium.isAlertPresent());
		verifyEquals(selenium.getAlert(), "Store Below 494 degrees K!");
		selenium.click("multipleLineAlert");
		verifyEquals(selenium.getAlert(), "This alert spans multiple lines");
		selenium.click("oneAlert");
		String myVar = selenium.getAlert();
		verifyEquals(selenium.getExpression(myVar), "Store Below 494 degrees K!");
		selenium.click("twoAlerts");
		verifyTrue(selenium.getAlert().matches("^[\\s\\S]* 220 degrees C!$"));
		verifyTrue(Pattern.compile("^Store Below 429 degrees F!").matcher(selenium.getAlert()).find());
		selenium.click("alertAndLeave");
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getAlert(), "I'm Melting! I'm Melting!");
		selenium.open("../tests/html/test_verify_alert.html");
		try { assertEquals(selenium.getAlert(), "noAlert"); fail("expected failure"); } catch (Throwable e) {}
		selenium.click("oneAlert");
		try { assertEquals(selenium.getAlert(), "wrongAlert"); fail("expected failure"); } catch (Throwable e) {}
		selenium.click("twoAlerts");
		try { assertEquals(selenium.getAlert(), "Store Below 429 degrees F!"); fail("expected failure"); } catch (Throwable e) {}
		try { assertEquals(selenium.getAlert(), "Store Below 220 degrees C!"); fail("expected failure"); } catch (Throwable e) {}
		selenium.click("oneAlert");
		try { selenium.open("../tests/html/test_verify_alert.html"); fail("expected failure"); } catch (Throwable e) {}
	}
}
