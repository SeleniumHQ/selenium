package org.openqa.selenium.iphone;

import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.NoDriverAfterTest;

public class CreateIPhoneDriverTest extends AbstractDriverTestCase {
  public void testCreateDriver() throws Exception {
    new IPhoneDriver();
  }

  @NoDriverAfterTest
  public void testDeleteSession() throws Exception {
    driver.quit();
  }

  public void testCreateDriverWithTrailingSlash() throws Exception {
    new IPhoneDriver(IPhoneDriver.DEFAULT_IWEBDRIVER_URL + "/");
  }
}
