package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.junit.Test;
import org.openqa.selenium.internal.WrapsDriver;

public class TestType extends InternalSelenseTestBase {
  @Test
  public void testType() throws Exception {
    selenium.open("../tests/html/test_type_page1.html");
    verifyEquals(selenium.getValue("username"), "");
    selenium.shiftKeyDown();
    selenium.type("username", "x");
    verifyEquals(selenium.getValue("username"), "X");
    selenium.shiftKeyUp();
    selenium.type("username", "TestUserWithLongName");
    verifyEquals(selenium.getValue("username"), "TestUserWi");
    selenium.type("username", "TestUser");
    verifyEquals(selenium.getValue("username"), "TestUser");
    verifyEquals(selenium.getValue("password"), "");
    selenium.type("password", "testUserPasswordIsVeryLong");
    verifyEquals(selenium.getValue("password"), "testUserPasswordIsVe");
    selenium.type("password", "testUserPassword");
    verifyEquals(selenium.getValue("password"), "testUserPassword");
    if (isAbleToUpdateFileElements()) {
      selenium.type("file", "/test/file");
      selenium.click("submitButton");
      selenium.waitForPageToLoad("30000");
      verifyTrue(selenium.isTextPresent("Welcome, TestUser!"));
    }
  }

  private boolean isAbleToUpdateFileElements() {
    String browser = runtimeBrowserString();
    return selenium instanceof WrapsDriver ||
           "*firefox".equals(browser) || "*firefoxchrome".equals(browser);
  }
}
