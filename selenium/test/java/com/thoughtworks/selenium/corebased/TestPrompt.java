package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestPrompt extends SeleneseTestNgHelper {
	@Test public void testPrompt() throws Exception {
		selenium.open("../tests/html/test_prompt.html");
		verifyFalse(selenium.isPromptPresent());
		assertFalse(selenium.isPromptPresent());
		selenium.answerOnNextPrompt("no");
		selenium.click("promptAndLeave");
		verifyTrue(selenium.isPromptPresent());
		for (int second = 0;; second++) {
			if (second >= 60) fail("timeout");
			try { if (selenium.isPromptPresent()) break; } catch (Exception e) {}
			Thread.sleep(1000);
		}

		assertTrue(selenium.isPromptPresent());
		verifyEquals(selenium.getPrompt(), "Type 'yes' and click OK");
		verifyEquals(selenium.getTitle(), "Test Prompt");
		selenium.answerOnNextPrompt("yes");
		selenium.click("promptAndLeave");
		selenium.waitForPageToLoad("30000");
		verifyTrue(selenium.getPrompt().matches("^[\\s\\S]*'yes'[\\s\\S]*$"));
		verifyEquals(selenium.getTitle(), "Dummy Page");
	}
}
