package org.openqa.selenium;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.is;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;

public class ClickAnchorTest extends AbstractDriverTestCase {
  @Ignore(value = HTMLUNIT, reason = "Page scrolling requires rendering")
  @JavascriptEnabled
  public void testClickingOnAnchorScrollsPage() {
    driver.get(pages.macbethPage);

    driver.findElement(By.partialLinkText("last speech")).click();

    long yOffset = (Long) ((JavascriptExecutor) driver)
        .executeScript("return window.pageYOffset");

    assertThat("Did not scroll", yOffset, is(greaterThan(0L)));
  }
}
