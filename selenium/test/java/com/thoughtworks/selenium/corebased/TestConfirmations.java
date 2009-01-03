package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestConfirmations extends SeleneseTestNgHelper {
	@Test public void testConfirmations() throws Exception {
		selenium.open("../tests/html/test_confirm.html");
		selenium.chooseCancelOnNextConfirmation();
		selenium.click("confirmAndLeave");
		verifyTrue(selenium.isConfirmationPresent());
		for (int second = 0;; second++) {
			if (second >= 60) fail("timeout");
			try { if (selenium.isConfirmationPresent()) break; } catch (Exception e) {}
			Thread.sleep(1000);
		}

		assertTrue(selenium.isConfirmationPresent());
		verifyEquals(selenium.getConfirmation(), "You are about to go to a dummy page.");
		verifyEquals(selenium.getTitle(), "Test Confirm");
		selenium.click("confirmAndLeave");
		selenium.waitForPageToLoad("30000");
		verifyTrue(selenium.getConfirmation().matches("^[\\s\\S]*dummy page[\\s\\S]*$"));
		verifyEquals(selenium.getTitle(), "Dummy Page");
		selenium.open("../tests/html/test_confirm.html");
		verifyEquals(selenium.getTitle(), "Test Confirm");
		selenium.chooseCancelOnNextConfirmation();
		selenium.chooseOkOnNextConfirmation();
		selenium.click("confirmAndLeave");
		selenium.waitForPageToLoad("30000");
		verifyTrue(selenium.getConfirmation().matches("^[\\s\\S]*dummy page[\\s\\S]*$"));
		verifyEquals(selenium.getTitle(), "Dummy Page");
		selenium.open("../tests/html/test_confirm.html");
		try { assertEquals(selenium.getConfirmation(), "This should fail - there are no confirmations"); fail("expected failure"); } catch (Throwable e) {}
		selenium.click("confirmAndLeave");
		selenium.waitForPageToLoad("30000");
		try { assertEquals(selenium.getConfirmation(), "this should fail - wrong confirmation"); fail("expected failure"); } catch (Throwable e) {}
		selenium.open("../tests/html/test_confirm.html");
		selenium.click("confirmAndLeave");
		selenium.waitForPageToLoad("30000");
		try { selenium.open("../tests/html/test_confirm.html"); fail("expected failure"); } catch (Throwable e) {}
	}
}
