package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import com.thoughtworks.selenium.SeleniumException;
import org.testng.annotations.Test;

public class TestCursorPosition extends InternalSelenseTestNgBase {
	@Test public void testCursorPosition() throws Exception {
		selenium.open("../tests/html/test_type_page1.html");
		try { assertEquals(selenium.getCursorPosition("username"), "8"); fail("expected failure"); } catch (Throwable e) {}
		selenium.windowFocus();
		verifyEquals(selenium.getValue("username"), "");
		selenium.type("username", "TestUser");
		selenium.setCursorPosition("username", "0");

    Number position = 0;
    try {
      position = selenium.getCursorPosition("username");
    } catch (SeleniumException e) {
      if (!isWindowInFocus(e)) {
        return;
      }
    }
		verifyEquals(position.toString(), "0");
		selenium.setCursorPosition("username", "-1");
		verifyEquals(selenium.getCursorPosition("username"), "8");
		selenium.refresh();
		selenium.waitForPageToLoad("30000");
		try { assertEquals(selenium.getCursorPosition("username"), "8"); fail("expected failure"); } catch (Throwable e) {}
	}

  private boolean isWindowInFocus(SeleniumException e) {
    if (e.getMessage().contains("There is no cursor on this page")) {
      System.out.println("Test failed because window does not have focus");
      return false;
    }
    return true;
  }
}
