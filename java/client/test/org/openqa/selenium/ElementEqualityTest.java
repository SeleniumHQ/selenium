package org.openqa.selenium;

import org.junit.Test;
import org.openqa.selenium.internal.WrapsElement;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;

import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

@Ignore({IPHONE, SELENESE})
public class ElementEqualityTest extends JUnit4TestBase {

  @Test
  public void testSameElementLookedUpDifferentWaysShouldBeEqual() {
    driver.get(pages.simpleTestPage);

    WebElement body = driver.findElement(By.tagName("body"));
    WebElement xbody = driver.findElements(By.xpath("//body")).get(0);

    assertEquals(body, xbody);
  }

  @Test
  public void testDifferentElementsShouldNotBeEqual() {
    driver.get(pages.simpleTestPage);

    List<WebElement> ps = driver.findElements(By.tagName("p"));

    assertFalse(ps.get(0).equals(ps.get(1)));
  }

  @Test
  public void testSameElementLookedUpDifferentWaysUsingFindElementShouldHaveSameHashCode() {
    driver.get(pages.simpleTestPage);
    WebElement body = driver.findElement(By.tagName("body"));
    WebElement xbody = driver.findElement(By.xpath("//body"));

    assertEquals(body.hashCode(), xbody.hashCode());
  }

  @Test
  public void testSameElementLookedUpDifferentWaysUsingFindElementsShouldHaveSameHashCode() {
    driver.get(pages.simpleTestPage);
    List<WebElement> body = driver.findElements(By.tagName("body"));
    List<WebElement> xbody = driver.findElements(By.xpath("//body"));

    assertEquals(body.get(0).hashCode(), xbody.get(0).hashCode());
  }

  @JavascriptEnabled
  @Ignore({ANDROID, IPHONE, SELENESE})
  @Test
  public void testAnElementFoundInADifferentFrameViaJsShouldHaveSameId() {
    String url = appServer.whereIs("missedJsReference.html");
    driver.get(url);

    driver.switchTo().frame("inner");
    WebElement first = driver.findElement(By.id("oneline"));

    driver.switchTo().defaultContent();
    WebElement element = (WebElement) ((JavascriptExecutor) driver).executeScript(
        "return frames[0].document.getElementById('oneline');");

    driver.switchTo().frame("inner");

    WebElement second = driver.findElement(By.id("oneline"));

    checkIdEqualityIfRemote(first, element);
    checkIdEqualityIfRemote(second, element);
  }

  private void checkIdEqualityIfRemote(WebElement first, WebElement second) {
    String firstId = getId(unwrapIfNecessary(first));
    String secondId = getId(unwrapIfNecessary(second));

    assertEquals(firstId, secondId);
  }

  private String getId(WebElement element) {
    if (!(element instanceof RemoteWebElement)) {
      System.err.println("Skipping remote element equality test - not a remote web driver");
      return null;
    }

    return ((RemoteWebElement) element).getId();
  }

  private WebElement unwrapIfNecessary(WebElement element) {
    if (element instanceof WrapsElement) {
      return ((WrapsElement) element).getWrappedElement();
    }
    return element;
  }
}
