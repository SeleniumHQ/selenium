package org.openqa.selenium.iphone;

import org.junit.Test;
import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.NoDriverAfterTest;
import org.openqa.selenium.testing.JUnit4TestBase;

public class CreateIPhoneDriverTest extends JUnit4TestBase {
  @Test
  public void testCreateDriver() throws Exception {
    new IPhoneDriver();
  }

  @NoDriverAfterTest
  @Test
  public void testDeleteSession() throws Exception {
    driver.quit();
  }

  @Test
  public void testCreateDriverWithTrailingSlash() throws Exception {
    new IPhoneDriver(IPhoneDriver.DEFAULT_IWEBDRIVER_URL + "/");
  }
}
