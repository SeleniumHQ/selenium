package org.openqa.selenium;

import org.junit.AfterClass;
import org.junit.Before;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.core.IsNot.not;
import static org.openqa.selenium.DevMode.isInDevMode;

public abstract class JUnit4TestBase {
  protected TestEnvironment environment;
  protected AppServer appServer;
  protected Pages pages;
  protected static WebDriver driver;

  @Before
  public void setUp() throws Exception {
    environment = GlobalTestEnvironment.get();
    appServer = environment.getAppServer();

    pages = new Pages(appServer);

    String hostName = environment.getAppServer().getHostName();
    String alternateHostName = environment.getAppServer().getAlternateHostName();

    assertThat(hostName, is(not(equalTo(alternateHostName))));
  }

  @Before
  public void createDriver() throws Exception {
    if (driver != null) {
      return;
    }

    String driverClass;
    if (isInDevMode()) {
      driverClass = "org.openqa.selenium.firefox.FirefoxDriverTestSuite$TestFirefoxDriver";
    } else {
      driverClass = "org.openqa.selenium.firefox.FirefoxDriver";
    }

    driver = Class.forName(driverClass).asSubclass(WebDriver.class).newInstance();
  }

  @Before
  public void createEnvironment() {
    environment = GlobalTestEnvironment.get(InProcessTestEnvironment.class);
  }

  @AfterClass
  public static void removeDriver() {
    if (driver == null) {
      return;
    }

    try {
      driver.quit();
    } catch (RuntimeException ignored) {
      // Fall through
    }
    driver = null;
  }
}
