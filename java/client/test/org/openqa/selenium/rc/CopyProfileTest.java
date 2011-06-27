package org.openqa.selenium.rc;

import junit.framework.TestCase;

import java.net.MalformedURLException;

import org.openqa.selenium.Ignore;
import org.openqa.selenium.Pages;
import org.openqa.selenium.Platform;
import org.openqa.selenium.SeleniumServerInstance;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.OPERA;
import static org.openqa.selenium.Ignore.Driver.SELENESE;
import static org.openqa.selenium.Platform.MAC;
import static org.openqa.selenium.firefox.FirefoxDriver.PROFILE;

// TODO(reorg): This test is never run. It must be.

@Ignore(value = {HTMLUNIT, IE, IPHONE, CHROME, SELENESE, OPERA},
    reason = "Firefox specific test, but needs to be in remote")
public class CopyProfileTest extends TestCase {
  private SeleniumServerInstance selenium;
  private TestEnvironment env;

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    env = GlobalTestEnvironment.get(InProcessTestEnvironment.class);
    selenium = new SeleniumServerInstance();
    selenium.start();
  }

  @Override
  protected void tearDown() throws Exception {
    selenium.stop();
    
    super.tearDown();
  }

  public void testShouldCopyProfileFromLocalMachineToRemoteInstance() throws Exception {
    System.setProperty("webdriver.development", "true");
    System.setProperty("jna.library.path", "..\\build;build");

    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.homepage", new Pages(env.getAppServer()).xhtmlTestPage);

    DesiredCapabilities caps = DesiredCapabilities.firefox();
    caps.setCapability(PROFILE, profile);

    WebDriver driver = new RemoteWebDriver(selenium.getWebDriverUrl(), caps);

    String title = driver.getTitle();
    driver.quit();

    assertEquals(title, "XHTML Test Page", title);
  }

  public void testCanEnableNativeEventsOnRemoteFirefox() throws MalformedURLException {
    if (Platform.getCurrent().is(MAC)) {
      System.out.println("Skipping test: no native events here");
      return;
    }

    FirefoxProfile profile = new FirefoxProfile();
    profile.setEnableNativeEvents(true);

    DesiredCapabilities caps = DesiredCapabilities.firefox();
    caps.setCapability(PROFILE, profile);

    RemoteWebDriver driver = new RemoteWebDriver(selenium.getWebDriverUrl(), caps);

    Boolean nativeEventsEnabled = (Boolean) driver.getCapabilities().getCapability("nativeEvents");
    driver.quit();

    assertTrue("Native events were explicitly enabled and should be on.",
        nativeEventsEnabled);
  }
}
