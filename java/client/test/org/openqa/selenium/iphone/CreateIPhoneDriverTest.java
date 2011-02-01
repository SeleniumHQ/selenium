package org.openqa.selenium.iphone;

import org.openqa.selenium.AbstractDriverTestCase;

public class CreateIPhoneDriverTest extends AbstractDriverTestCase {
  public void testCreateDriver() throws Exception {
    new IPhoneDriver();
  }

  public void testDeleteSession() throws Exception {
    IPhoneDriver driver = new IPhoneDriver();
    driver.quit();
  }

  public void testCreateDriverWithTrailingSlash() throws Exception {
    new IPhoneDriver(IPhoneDriver.DEFAULT_IWEBDRIVER_URL + "/");
  }
}
