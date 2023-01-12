package org.openqa.selenium.chrome;

import static org.junit.jupiter.api.Assertions.assertThrowsExactly;

import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;

class ChromeDriverTimeoutTest extends JupiterTestBase {

  @NoDriverBeforeTest
  @Test
  public void ensureCustomClientTimeoutsAreHonoured() {
    assertThrowsExactly(TimeoutException.class, () -> {
      ChromeDriver localDriver = new ChromeDriver(ChromeDriverService.createDefaultService(),
        new ChromeOptions(), ClientConfig.defaultConfig().readTimeout(Duration.ofSeconds(5)));
      localDriver.manage().timeouts().scriptTimeout(Duration.ofSeconds(11));
      ((JavascriptExecutor) localDriver).executeScript(getScript());
      localDriver.quit();
    });
  }

  private static String getScript() {
    return "function timeout(ms) { "
      + "return new Promise(resolve => setTimeout(resolve, ms)); "
      + "};"
      + "const printFunction = async () => {"
      + "await timeout(10000); "
      + "return \"bla bla\""
      + "};"
      + "await printFunction();";
  }
}
