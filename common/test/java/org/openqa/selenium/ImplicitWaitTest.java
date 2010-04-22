package org.openqa.selenium;

import org.junit.Test;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * @author jmleyba@gmail.com (Jason Leyba)
 */
@Ignore(value = {IE, IPHONE})
public class ImplicitWaitTest extends AbstractDriverTestCase {

  @Test
  @JavascriptEnabled
  @NeedsFreshDriver
  public void testShouldImplicitlyWaitForASingleElement() {
    driver.get(pages.dynamicPage);
    WebElement add = driver.findElement(By.id("adder"));

    driver.manage().timeouts().implicitlyWait(1100, TimeUnit.MILLISECONDS);

    add.click();
    driver.findElement(By.id("box0"));  // All is well if this doesn't throw.
  }

  @Test
  @JavascriptEnabled
  @NeedsFreshDriver
  public void testShouldStillFailToFindAnElementWhenImplicitWaitsAreEnabled() {
    driver.get(pages.dynamicPage);
    driver.manage().timeouts().implicitlyWait(500, TimeUnit.MILLISECONDS);
    try {
      driver.findElement(By.id("box0"));
      fail("Expected to throw.");
    } catch (NoSuchElementException expected) {
    }
  }

  @Test
  @JavascriptEnabled
  @NeedsFreshDriver
  public void testShouldReturnAfterFirstAttemptToFindOneAfterDisablingImplicitWaits() {
    driver.get(pages.dynamicPage);
    driver.manage().timeouts().implicitlyWait(1100, TimeUnit.MILLISECONDS);
    driver.manage().timeouts().implicitlyWait(0, TimeUnit.MILLISECONDS);
    try {
      driver.findElement(By.id("box0"));
      fail("Expected to throw.");
    } catch (NoSuchElementException expected) {
    }
  }

  @Test
  @JavascriptEnabled
  @NeedsFreshDriver
  @Ignore(SELENESE)
  public void testShouldImplicitlyWaitUntilAtLeastOneElementIsFoundWhenSearchingForMany() {
    driver.get(pages.dynamicPage);
    WebElement add = driver.findElement(By.id("adder"));

    driver.manage().timeouts().implicitlyWait(1100, TimeUnit.MILLISECONDS);
    add.click();
    add.click();

    List<WebElement> elements = driver.findElements(By.className("redbox"));
    assertFalse(elements.isEmpty());
  }

  @Test
  @JavascriptEnabled
  @NeedsFreshDriver
  @Ignore(SELENESE)
  public void testShouldStillFailToFindAnElemenstWhenImplicitWaitsAreEnabled() {
    driver.get(pages.dynamicPage);
    driver.manage().timeouts().implicitlyWait(500, TimeUnit.MILLISECONDS);
    List<WebElement> elements = driver.findElements(By.className("redbox"));
    assertTrue(elements.isEmpty());
  }

  @Test
  @JavascriptEnabled
  @NeedsFreshDriver
  @Ignore(SELENESE)
  public void testShouldReturnAfterFirstAttemptToFindManyAfterDisablingImplicitWaits() {
    driver.get(pages.dynamicPage);
    WebElement add = driver.findElement(By.id("adder"));

    driver.manage().timeouts().implicitlyWait(1100, TimeUnit.MILLISECONDS);
    driver.manage().timeouts().implicitlyWait(0, TimeUnit.MILLISECONDS);
    add.click();

    List<WebElement> elements = driver.findElements(By.className("redbox"));
    assertTrue(elements.isEmpty());
  }
}
