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
 * Not caching: each time starts scanning frames and all from scratch.
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

    // base case: no nested iframes
    if (iframes.isEmpty()) {
      try {
        return Optional.of(driver.findElement(by));
      } catch (NoSuchElementException e) {
        return Optional.empty();
      }
    }

    for (WebElement iframe : iframes) {
      try {
        driver.switchTo().frame(iframe);
      } catch (NoSuchFrameException e) {
        logger.info(e.getMessage() + " => skipping iframe");
        continue; // some
      }
      Optional<WebElement> found = searchInIframesRecursively(by);
      if (found.isPresent()) {
        return found;
      }
      driver.switchTo().parentFrame();
    }

    return Optional.empty();
  }

  @Override
  public WebDriver getDriver() {
    return driver;
  }
}
