package org.openqa.selenium.devtools;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.devtools.idealized.target.model.TargetInfo;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.testing.Ignore;

import java.util.List;

public class WindowSwitchingTest extends DevToolsTestBase {

  @Test
  @Ignore(FIREFOX)
  public void shouldBeAbleToSwitchWindowsAndCloseTheOriginal() {
    WebDriver driver = new Augmenter().augment(this.driver);

    driver.get("https://www.selenium.dev");

    String originalWindow = driver.getWindowHandle();
    driver.switchTo().newWindow(WindowType.TAB);

    String newWindowHandle = driver.getWindowHandle();
    List<TargetInfo> originalTargets = devTools.send(devTools.getDomains().target().getTargets());

    // this .close() kills the dev tools session, no chance to ever retrieve a new one for the other tab
    driver.switchTo().window(originalWindow).close();
    driver.switchTo().window(newWindowHandle);
    driver.get("https://www.selenium.dev/documentation/webdriver/browser_manipulation/");

    List<TargetInfo> updatedTargets = this.devTools.send(this.devTools.getDomains().target().getTargets());

    assertThat(updatedTargets).isNotEqualTo(originalTargets);
  }
}
