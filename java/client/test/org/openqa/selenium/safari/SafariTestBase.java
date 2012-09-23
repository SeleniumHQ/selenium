package org.openqa.selenium.safari;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.JUnit4TestBase;

import org.junit.Before;

public class SafariTestBase extends JUnit4TestBase {

  private static WebDriver staticDriver = null;

  @Before
  @Override
  public void createDriver() {
    driver = actuallyCreateDriver(DesiredCapabilities.safari());
  }

  public static WebDriver actuallyCreateDriver(Capabilities capabilities) {
    if (staticDriver == null) {
      staticDriver = new SafariDriver(capabilities);
    }
    return staticDriver;
  }
  
  public static void quitDriver() {
    if (staticDriver != null) {
      staticDriver.quit();
      staticDriver = null;
    }
  }
}
