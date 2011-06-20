package org.openqa.selenium;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.openqa.selenium.Ignore.Driver.ANDROID;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

import org.junit.Test;

import java.util.List;

/**
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class ImplicitWaitTest extends AbstractDriverTestCase {

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    driver.manage().timeouts().implicitlyWait(0, MILLISECONDS);
  }

  @Override
  protected void tearDown() throws Exception {
    driver.manage().timeouts().implicitlyWait(0, MILLISECONDS);
    
    super.tearDown();
  }

  @Test
  @JavascriptEnabled
  public void testShouldImplicitlyWaitForASingleElement() {
    driver.get(pages.dynamicPage);
    WebElement add = driver.findElement(By.id("adder"));

    driver.manage().timeouts().implicitlyWait(3000, MILLISECONDS);

    add.click();
    driver.findElement(By.id("box0"));  // All is well if this doesn't throw.
  }

  @Test
  @JavascriptEnabled
  public void testShouldStillFailToFindAnElementWhenImplicitWaitsAreEnabled() {
    driver.get(pages.dynamicPage);
    driver.manage().timeouts().implicitlyWait(500, MILLISECONDS);
    try {
      driver.findElement(By.id("box0"));
      fail("Expected to throw.");
    } catch (NoSuchElementException expected) {
    }
  }

  @Test
  @JavascriptEnabled
  public void testShouldReturnAfterFirstAttemptToFindOneAfterDisablingImplicitWaits() {
    driver.get(pages.dynamicPage);
    driver.manage().timeouts().implicitlyWait(3000, MILLISECONDS);
    driver.manage().timeouts().implicitlyWait(0, MILLISECONDS);
    try {
      driver.findElement(By.id("box0"));
      fail("Expected to throw.");
    } catch (NoSuchElementException expected) {
    }
  }

  @Test
  @JavascriptEnabled
  public void testShouldImplicitlyWaitUntilAtLeastOneElementIsFoundWhenSearchingForMany() {
    driver.get(pages.dynamicPage);
    WebElement add = driver.findElement(By.id("adder"));

    driver.manage().timeouts().implicitlyWait(2000, MILLISECONDS);
    add.click();
    add.click();

    List<WebElement> elements = driver.findElements(By.className("redbox"));
    assertFalse(elements.isEmpty());
  }

  @Test
  @JavascriptEnabled
  public void testShouldStillFailToFindElementsWhenImplicitWaitsAreEnabled() {
    driver.get(pages.dynamicPage);
    driver.manage().timeouts().implicitlyWait(500, MILLISECONDS);
    List<WebElement> elements = driver.findElements(By.className("redbox"));
    assertTrue(elements.isEmpty());
  }

  @Test
  @JavascriptEnabled
  public void testShouldStillFailToFindElementsByIdWhenImplicitWaitsAreEnabled() {
    driver.get(pages.dynamicPage);
    driver.manage().timeouts().implicitlyWait(500, MILLISECONDS);
    List<WebElement> elements = driver.findElements(By.id("redbox"));
    assertTrue(elements.toString(), elements.isEmpty());
  }

  @Test
  @JavascriptEnabled
  public void testShouldReturnAfterFirstAttemptToFindManyAfterDisablingImplicitWaits() {
    driver.get(pages.dynamicPage);
    WebElement add = driver.findElement(By.id("adder"));

    driver.manage().timeouts().implicitlyWait(1100, MILLISECONDS);
    driver.manage().timeouts().implicitlyWait(0, MILLISECONDS);
    add.click();

    List<WebElement> elements = driver.findElements(By.className("redbox"));
    assertTrue(elements.isEmpty());
  }

  @Test
  @JavascriptEnabled          
  @Ignore({ANDROID, CHROME, IE, IPHONE, SELENESE})
  public void testShouldImplicitlyWaitForAnElementToBeVisibleBeforeInteracting() {
    driver.get(pages.dynamicPage);

    WebElement reveal = driver.findElement(By.id("reveal"));
    WebElement revealed = driver.findElement(By.id("revealed"));
    driver.manage().timeouts().implicitlyWait(5000, MILLISECONDS);

    assertFalse("revealed should not be visible", revealed.isDisplayed());
    reveal.click();

    try {
      revealed.sendKeys("hello world");
      // This is what we want
    } catch (ElementNotVisibleException e) {
      fail("Element should have been visible");
    }
  }
}
