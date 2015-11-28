package org.openqa.selenium.support.ui;

import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

/**
 * Traverses the iframes tree and returns the *first* element found, matching the given locator.
 *
 * If there are two iframes containing the same element, the one in the outer iframe will be returned.
 *
 * Not caching: each call to {@link #findElement(By)} triggers a fresh scan of the frames.
 */
public class WebElementInIframeRetriever implements WebElementRetriever {

  private static final Logger logger = Logger.getLogger(WebElementInIframeRetriever.class.getName());

  private final WebDriver driver;

  public WebElementInIframeRetriever(WebDriver driver) {
    this.driver = driver;
  }

  @Override
  public WebElement findElement(By by) {
    driver.switchTo().defaultContent(); // make sure we are on the root iframe

    try {
      return driver.findElement(by);
    } catch (NoSuchElementException e) {
      Optional<WebElement> optional = searchInIframesRecursively(by);
      if (!optional.isPresent()) {
        throw e;
      }
      return optional.get();
    }
  }

  private Optional<WebElement> searchInIframesRecursively(By by) {
    List<WebElement> iframes = driver.findElements(By.tagName("iframe"));

    for (WebElement iframe : iframes) {
      try {
        driver.switchTo().frame(iframe);
      } catch (NoSuchFrameException e) {
        logger.info("skipping iframe: " + e.getMessage());
        continue;
      }

      try {
        return Optional.of(driver.findElement(by));
      } catch (NoSuchElementException e) {
        Optional<WebElement> optional = searchInIframesRecursively(by);
        if (optional.isPresent()) {
          return optional;
        }

        driver.switchTo().parentFrame();
      }
    }

    // base case: no nested iframes
    return Optional.empty();
  }

  @Override
  public WebDriver getDriver() {
    return driver;
  }
}
