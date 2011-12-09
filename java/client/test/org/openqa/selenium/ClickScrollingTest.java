package org.openqa.selenium;

import org.openqa.selenium.interactions.MoveTargetOutOfBoundsException;

import static org.openqa.selenium.Ignore.Driver.ANDROID;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

@Ignore(value = {ANDROID, HTMLUNIT}, reason = "Android: Race condition when click returns, "
    + "the UI did not finish scrolling..\nHtmlUnit: Scrolling requires rendering")
public class ClickScrollingTest extends AbstractDriverTestCase {
  @JavascriptEnabled
  public void testClickingOnAnchorScrollsPage() {
    String scrollScript = "";
    scrollScript += "var pageY;";
    scrollScript += "if (typeof(window.pageYOffset) == 'number') {";
    scrollScript += "  pageY = window.pageYOffset;";
    scrollScript += "} else {";
    scrollScript += "  pageY = document.documentElement.scrollTop;";
    scrollScript += "}";
    scrollScript += "return pageY;";

    driver.get(pages.macbethPage);

    driver.findElement(By.partialLinkText("last speech")).click();

    long yOffset = (Long) ((JavascriptExecutor) driver)
        .executeScript(scrollScript);

    // Focusing on to click, but not actually following,
    // the link will scroll it in to view, which is a few pixels further than 0
    assertThat("Did not scroll", yOffset, is(greaterThan(300L)));

  }

  public void testShouldScrollToClickOnAnElementHiddenByOverflow() {
    String url = appServer.whereIs("click_out_of_bounds_overflow.html");
    driver.get(url);

    WebElement link = driver.findElement(By.id("link"));
    try {
      link.click();
    } catch (MoveTargetOutOfBoundsException e) {
      fail("Should not be out of bounds: " + e.getMessage());
    }
  }

  public void testShouldBeAbleToClickOnAnElementHiddenByOverflow() {
    driver.get(appServer.whereIs("scroll.html"));

    WebElement link = driver.findElement(By.id("line8"));
    // This used to throw a MoveTargetOutOfBoundsException - we don't expect it to
    link.click();
    assertEquals("line8", driver.findElement(By.id("clicked")).getText());
  }

  @Ignore(SELENESE)
  public void testShouldNotScrollOverflowElementsWhichAreVisible() {
    driver.get(appServer.whereIs("scroll2.html"));
    WebElement list = driver.findElement(By.tagName("ul"));
    WebElement item = list.findElement(By.id("desired"));
    item.click();
    long yOffset =
        (Long)((JavascriptExecutor)driver).executeScript("return arguments[0].scrollTop;", list);
    assertEquals("Should not have scrolled", 0, yOffset);
  }

  @Ignore(CHROME)
  public void testShouldNotScrollIfAlreadyScrolledAndElementIsInView() {
    driver.get(appServer.whereIs("scroll3.html"));
    driver.findElement(By.id("button1")).click();
    long scrollTop = getScrollTop();
    driver.findElement(By.id("button2")).click();
    assertEquals(scrollTop, getScrollTop());
  }

  public void testShouldBeAbleToClickRadioButtonScrolledIntoView() {
    driver.get(appServer.whereIs("scroll4.html"));
    driver.findElement(By.id("radio")).click();
    // If we don't throw, we're good
  }

  private long getScrollTop() {
    return (Long)((JavascriptExecutor)driver).executeScript("return document.body.scrollTop;");
  }
}
