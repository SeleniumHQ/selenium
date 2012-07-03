package org.openqa.selenium.safari;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.testing.JUnit4TestBase;

import org.junit.Before;

public class SafariTestBase extends JUnit4TestBase {

  private static WebDriver staticDriver = null;

  @Before
  @Override
  public void createDriver() {
    driver = actuallyCreateDriver();
  }

  public static WebDriver actuallyCreateDriver() {
    if (staticDriver == null) {
      staticDriver = new SafariDriver();
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
