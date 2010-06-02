package org.openqa.selenium;

import static org.openqa.selenium.firefox.FirefoxDriver.PROFILE;
import junit.framework.TestCase;

import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import static org.openqa.selenium.Ignore.Driver.*;

@Ignore(value = {ALL, HTMLUNIT, IE, IPHONE, CHROME, CHROME_NON_WINDOWS, SELENESE},
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
    env.stop();
    
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
}
