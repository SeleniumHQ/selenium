package org.openqa.selenium.support.pagefactory;

import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.lang.reflect.Field;

/**
 * An element locator that will wait for the specified number of seconds for an
 * element to appear, rather than failing instantly if it's not present. This
 * works by polling the UI on a regular basis. The element returned will be 
 * present on the DOM, but may not actually be visible: override
 * {@link #isElementUsable(WebElement)} if this is important to you.
 * 
 * Because this class polls the interface on a regular basis, it is strongly
 * recommended that users avoid locating elements by XPath.
 */
public class AjaxElementLocator extends DefaultElementLocator {
  protected final int timeOutInSeconds;

  /**
   * Main constructor.
   * 
   * @param driver The WebDriver to use when locating elements
   * @param field The field representing this element
   * @param timeOutInSeconds How long to wait for the element to appear. 
   * Measured in seconds.
   */
  public AjaxElementLocator(WebDriver driver, Field field, int timeOutInSeconds) {
    super(driver, field);
    this.timeOutInSeconds = timeOutInSeconds;
  }

  /**
   * {@inheritDoc}
   * 
   * Will poll the interface on a regular basis until the element is present.
   */
  public WebElement findElement() {
    long end = now() + timeOutInSeconds * 1000;

    NoSuchElementException lastException = null;
    do {
      try {
        WebElement element = super.findElement();
        
        if (isElementUsable(element))
          return element;
      } catch (NoSuchElementException e) {
        lastException = e;
        // It's fine to keep on looping
      }

      // But don't poll too frequently.
      sleep();
    } while (now() < end);

    throw new NoSuchElementException(
        String.format("Timed out after %d seconds. %s", timeOutInSeconds, lastException.getMessage()),
        lastException);
  }

  protected long now() {
    return System.currentTimeMillis();
  }

  /**
   * By default, we sleep for 250ms between polls. You may override this method
   * in order to change how it sleeps.
   */
  protected void sleep() {
    try {
      Thread.sleep(250);
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * By default, elements are considered "found" if they are in the DOM. 
   * Override this method in order to change whether or not you consider
   * the elemet loaded. For example, perhaps you need the element to be
   * displayed:
   * 
   * <pre class="code>
   *   return ((RenderedWebElement) element).isDisplayed();
   * </pre>
   * 
   * @param element The element to use
   * @return Whether or not it meets your criteria for "found"
   */
  @SuppressWarnings({"UnusedDeclaration"})
  protected boolean isElementUsable(WebElement element) {
    return true;
  }
}
