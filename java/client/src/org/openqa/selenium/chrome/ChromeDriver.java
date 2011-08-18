package org.openqa.selenium.chrome;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.RemoteWebDriver;

/**
 * A {@link WebDriver} implementation that controls a Chrome browser running
 * on the local machine. This class is provided as a convenience for easily
 * testing the Chrome browser. The control server which each instance
 * communicates with will live and die with the instance.
 *
 * <p/>To avoid unnecessarily restarting the ChromeDriver server with each
 * instance, use a {@link RemoteWebDriver} coupled with the desired
 * {@link ChromeDriverService}, which is managed separately. For example:
 * <code><pre>
 *
 * import static org.junit.Assert.assertEquals;
 *
 * import org.junit.After;
 * import org.junit.AfterClass;
 * import org.junit.Before;
 * import org.junit.BeforeClass;
 * import org.junit.runner.RunWith;
 * import org.junit.runners.BlockJUnit4ClassRunner
 * import org.openqa.selenium.chrome.ChromeDriverService;
 * import org.openqa.selenium.remote.DesiredCapabilities;
 * import org.openqa.selenium.remote.RemoteWebDriver;
 *
 * {@literal @RunWith(BlockJUnit4ClassRunner.class)}
 * public class ChromeTest extends TestCase {
 *
 *   private static ChromeDriverService service;
 *   private WebDriver driver;
 *
 *   {@literal @BeforeClass}
 *   public static void createAndStartService() {
 *     service = new ChromeDriverService.Builder()
 *         .usingChromeDriverExecutable(new File("path/to/my/chromedriver.exe"))
 *         .usingAnyFreePort()
 *         .build();
 *     service.start();
 *   }
 *
 *   {@literal @AfterClass}
 *   public static void createAndStopService() {
 *     service.stop();
 *   }
 *
 *   {@literal @Before}
 *   public void createDriver() {
 *     driver = new RemoteWebDriver(service.getUrl(),
 *         DesiredCapabilities.chrome());
 *   }
 *
 *   {@literal @After}
 *   public void quitDriver() {
 *     driver.quit();
 *   }
 *
 *   {@literal @Test}
 *   public void testGoogleSearch() {
 *     driver.get("http://www.google.com");
 *     WebElement searchBox = driver.findElement(By.name("q"));
 *     searchBox.sendKeys("webdriver");
 *     searchBox.quit();
 *     assertEquals("webdriver - Google Search", driver.getTitle());
 *   }
 * }
 *
 * </pre></code>
 *
 * @see ChromeDriverService#createDefaultService
 */
public class ChromeDriver extends RemoteWebDriver implements TakesScreenshot {

  /**
   * Creates a new ChromeDriver using the
   * {@link ChromeDriverService#createDefaultService default} server
   * configuration.
   */
  public ChromeDriver() {
    this(ChromeDriverService.createDefaultService());
  }

  /**
   * Creates a new ChromeDriver instance. The {@code service} will be started
   * along with the driver, and shutdown upon calling {@link #quit()}.
   *
   * @param service The service to use.
   */
  public ChromeDriver(ChromeDriverService service) {
    super(new ChromeCommandExecutor(service), DesiredCapabilities.chrome());
  }

  /**
   * Creates a new ChromeDriver instance. The {@code capabilities} will be passed to the
   * chromedriver service.
   *
   * @param capabilities The capabilities required from the ChromeDriver.
   */
  public ChromeDriver(Capabilities capabilities) {
    super(new ChromeCommandExecutor(ChromeDriverService.createDefaultService()),
        capabilities);
  }


  public <X> X getScreenshotAs(OutputType<X> target) {
    // Get the screenshot as base64.
    String base64 = (String)execute(DriverCommand.SCREENSHOT).getValue();
    // ... and convert it.
    return target.convertFromBase64Png(base64);
  }
}
