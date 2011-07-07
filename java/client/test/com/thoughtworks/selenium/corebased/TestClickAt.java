package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.remote.CapabilityType;

public class TestClickAt extends InternalSelenseTestBase {
  @Test @Ignore
  public void testClickAt() throws Exception {
    selenium.open("../tests/html/test_click_page1.html");
    verifyEquals(selenium.getText("link"), "Click here for next page");
    selenium.clickAt("link", "0,0");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    selenium.clickAt("link", "10,5");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page 1");
    selenium.clickAt("linkWithEnclosedImage", "0,0");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    selenium.clickAt("linkWithEnclosedImage", "644,41");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    selenium.clickAt("enclosedImage", "0,0");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    selenium.clickAt("enclosedImage", "644,41");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    selenium.clickAt("extraEnclosedImage", "0,0");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    selenium.clickAt("extraEnclosedImage", "644,41");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.click("previousPage");
    selenium.waitForPageToLoad("30000");
    selenium.clickAt("linkToAnchorOnThisPage", "0,0");
    verifyEquals(selenium.getTitle(), "Click Page 1");
    selenium.clickAt("linkToAnchorOnThisPage", "10,5");
    verifyEquals(selenium.getTitle(), "Click Page 1");
    try {
      selenium.waitForPageToLoad("500");
      fail("expected failure");
    } catch (Throwable e) {
    }
    selenium.setTimeout("30000");
    selenium.clickAt("linkWithOnclickReturnsFalse", "0,0");
    Thread.sleep(300);
    verifyEquals(selenium.getTitle(), "Click Page 1");
    selenium.clickAt("linkWithOnclickReturnsFalse", "10,5");
    Thread.sleep(300);
    verifyEquals(selenium.getTitle(), "Click Page 1");

    if (isUsingNativeEvents()) {
      selenium.clickAt("linkWithEnclosedImage", "650,0");
      Thread.sleep(300);
      verifyEquals(selenium.getTitle(), "Click Page 1");
      selenium.clickAt("linkWithEnclosedImage", "0,50");
      Thread.sleep(300);
      verifyEquals(selenium.getTitle(), "Click Page 1");
      selenium.setTimeout("5000");
    }
  }

  private boolean isUsingNativeEvents() {
    if (!(selenium instanceof WrapsDriver)) {
      return false;
    }

    WebDriver driver = ((WrapsDriver) selenium).getWrappedDriver();
    if (!(driver instanceof HasCapabilities)) {
      return false;
    }

    Capabilities capabilities = ((HasCapabilities) driver).getCapabilities();
    return capabilities.is(CapabilityType.HAS_NATIVE_EVENTS);
  }
}
