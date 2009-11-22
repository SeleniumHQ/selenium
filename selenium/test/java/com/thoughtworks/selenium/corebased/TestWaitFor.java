package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestWaitFor extends SeleneseTestNgHelper {
	@Test public void testWaitFor() throws Exception {
		selenium.open("../tests/html/test_async_event.html");
		assertEquals(selenium.getValue("theField"), "oldValue");
		selenium.click("theButton");
		assertEquals(selenium.getValue("theField"), "oldValue");
		for (int second = 0;; second++) {
			if (second >= 60) fail("timeout");
			try { if (Pattern.compile("n[aeiou]wValue").matcher(selenium.getValue("theField")).find()) break; } catch (Exception e) {}
			Thread.sleep(1000);
		}

		verifyEquals(selenium.getValue("theField"), "newValue");
		assertEquals(selenium.getText("theSpan"), "Some text");
		selenium.click("theSpanButton");
		assertEquals(selenium.getText("theSpan"), "Some text");
		for (int second = 0;; second++) {
			if (second >= 60) fail("timeout");
			try { if (Pattern.compile("Some n[aeiou]w text").matcher(selenium.getText("theSpan")).find()) break; } catch (Exception e) {}
			Thread.sleep(1000);
		}

		verifyEquals(selenium.getText("theSpan"), "Some new text");
		selenium.click("theAlertButton");
		for (int second = 0;; second++) {
			if (second >= 60) fail("timeout");
			try { if (Pattern.compile("An [aeiou]lert").matcher(selenium.getAlert()).find()) break; } catch (Exception e) {}
			Thread.sleep(1000);
		}

		selenium.open("../tests/html/test_reload_onchange_page.html");
		selenium.click("theLink");
		for (int second = 0;; second++) {
			if (second >= 60) fail("timeout");
			try { if ("Slow Loading Page".equals(selenium.getTitle())) break; } catch (Exception e) {}
			Thread.sleep(1000);
		}

		verifyEquals(selenium.getTitle(), "Slow Loading Page");
		selenium.setTimeout("500");
		try { for (int second = 0;; second++) {
			if (second >= 60) fail("timeout");
			try { if (selenium.isTextPresent("thisTextIsNotPresent")) break; } catch (Exception e) {}
			Thread.sleep(1000);
		}
		 fail("expected failure"); } catch (Throwable e) {}
	}
}
