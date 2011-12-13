package org.openqa.selenium;

import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

import static java.util.concurrent.TimeUnit.MILLISECONDS;

import org.junit.Test;
import org.openqa.selenium.testing.Ignore;

@NeedsLocalEnvironment(reason =
    "Executing these tests over the wire doesn't work, because they relies on 100ms-specific timing")
public class ImplicitWaitForAlertsTest extends AbstractDriverTestCase {

  @Override
  protected void tearDown() throws Exception {
    driver.manage().timeouts().implicitlyWaitForAlerts(2000, MILLISECONDS);

    super.tearDown();
  }

  @Test
  @JavascriptEnabled
  @NeedsFreshDriver
  @Ignore({ANDROID, CHROME, HTMLUNIT, IPHONE, SELENESE})
  public void testShouldImplicitlyWaitForAnAlertByDefault() {
    driver.get(pages.alertsPage);

    WebElement element = driver.findElement(By.id("slow-alert"));

    element.click();
    try {
       driver.switchTo().alert().accept();
     } catch (NoAlertPresentException e) {
      fail("No implicit wait for an alert");
    }
  }

  @Test
  @JavascriptEnabled
  @Ignore({ANDROID, CHROME, HTMLUNIT, IPHONE, SELENESE})
  public void testShouldCheckAlertImmediatelyIfNoImplicitWaitSpecified() {
    driver.get(pages.alertsPage);

    WebElement element = driver.findElement(By.id("slow-alert"));
    driver.manage().timeouts().implicitlyWaitForAlerts(0, MILLISECONDS);

    element.click();
    try {
      driver.switchTo().alert().accept();
      fail("Alert should not be found");
    } catch (NoAlertPresentException expected) {
    }

    driver.manage().timeouts().implicitlyWaitForAlerts(2000, MILLISECONDS);
    driver.switchTo().alert().accept();
  }
}
