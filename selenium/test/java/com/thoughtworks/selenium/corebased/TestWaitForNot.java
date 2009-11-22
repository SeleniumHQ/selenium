package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestWaitForNot extends SeleneseTestNgHelper {
	@Test public void testWaitForNot() throws Exception {
		selenium.open("../tests/html/test_async_event.html");
		assertEquals(selenium.getValue("theField"), "oldValue");
		selenium.click("theButton");
		assertEquals(selenium.getValue("theField"), "oldValue");
		for (int second = 0;; second++) {
			if (second >= 60) fail("timeout");
			try { if (!Pattern.compile("oldValu[aei]").matcher(selenium.getValue("theField")).find()) break; } catch (Exception e) {}
			Thread.sleep(1000);
		}

		verifyEquals(selenium.getValue("theField"), "newValue");
		assertEquals(selenium.getText("theSpan"), "Some text");
		selenium.click("theSpanButton");
		assertEquals(selenium.getText("theSpan"), "Some text");
		for (int second = 0;; second++) {
			if (second >= 60) fail("timeout");
			try { if (!Pattern.compile("Some te[xyz]t").matcher(selenium.getText("theSpan")).find()) break; } catch (Exception e) {}
			Thread.sleep(1000);
		}

		verifyEquals(selenium.getText("theSpan"), "Some new text");
	}
}
