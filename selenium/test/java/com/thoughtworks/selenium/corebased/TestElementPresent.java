package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.annotations.Test;

public class TestElementPresent extends InternalSelenseTestNgBase {
	@Test(dataProvider = "system-properties") public void testElementPresent() throws Exception {
		selenium.open("../tests/html/test_element_present.html");
		assertTrue(selenium.isElementPresent("aLink"));
		selenium.click("removeLinkAfterAWhile");
		for (int second = 0;; second++) {
			if (second >= 60) fail("timeout");
			try { if (!selenium.isElementPresent("aLink")) break; } catch (Exception e) {}
			Thread.sleep(1000);
		}

		assertFalse(selenium.isElementPresent("aLink"));
		selenium.click("addLinkAfterAWhile");
		for (int second = 0;; second++) {
			if (second >= 60) fail("timeout");
			try { if (selenium.isElementPresent("aLink")) break; } catch (Exception e) {}
			Thread.sleep(1000);
		}

		assertTrue(selenium.isElementPresent("aLink"));
	}
}
