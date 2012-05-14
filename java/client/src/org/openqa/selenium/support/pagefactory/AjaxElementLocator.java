/*
Copyright 2007-2009 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.support.pagefactory;

import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Clock;
import org.openqa.selenium.support.ui.SlowLoadableComponent;
import org.openqa.selenium.support.ui.SystemClock;

import java.lang.reflect.Field;

/**
 * An element locator that will wait for the specified number of seconds for an element to appear,
 * rather than failing instantly if it's not present. This works by polling the UI on a regular
 * basis. The element returned will be present on the DOM, but may not actually be visible: override
 * {@link #isElementUsable(WebElement)} if this is important to you.
 * 
 * Because this class polls the interface on a regular basis, it is strongly recommended that users
 * avoid locating elements by XPath.
 */
public class AjaxElementLocator extends DefaultElementLocator {
  protected final int timeOutInSeconds;
  private final Clock clock;

  /**
   * Main constructor.
   * 
   * @param driver The WebDriver to use when locating elements
   * @param field The field representing this element
   * @param timeOutInSeconds How long to wait for the element to appear. Measured in seconds.
   */
  public AjaxElementLocator(WebDriver driver, Field field, int timeOutInSeconds) {
    this(new SystemClock(), driver, field, timeOutInSeconds);
  }

  public AjaxElementLocator(Clock clock, WebDriver driver, Field field, int timeOutInSeconds) {
    super(driver, field);
    this.timeOutInSeconds = timeOutInSeconds;
    this.clock = clock;
  }

  /**
   * {@inheritDoc}
   * 
   * Will poll the interface on a regular basis until the element is present.
   */
  @Override
  public WebElement findElement() {
    SlowLoadingElement loadingElement = new SlowLoadingElement(clock, timeOutInSeconds);
    try {
      return loadingElement.get().getElement();
    } catch (NoSuchElementError e) {
      throw new NoSuchElementException(
          String.format("Timed out after %d seconds. %s", timeOutInSeconds, e.getMessage()),
          e.getCause());
    }
  }

  /**
   * By default, we sleep for 250ms between polls. You may override this method in order to change
   * how it sleeps.
   * 
   * @return Duration to sleep in milliseconds
   */
  protected long sleepFor() {
    return 250;
  }

  /**
   * By default, elements are considered "found" if they are in the DOM. Override this method in
   * order to change whether or not you consider the elemet loaded. For example, perhaps you need
   * the element to be displayed:
   * 
   * <pre class="code>
   *   return ((RenderedWebElement) element).isDisplayed();
   * </pre>
   * 
   * @param element The element to use
   * @return Whether or not it meets your criteria for "found"
   */
  protected boolean isElementUsable(WebElement element) {
    return true;
  }

  private class SlowLoadingElement extends SlowLoadableComponent<SlowLoadingElement> {
    private NoSuchElementException lastException;
    private WebElement element;

    public SlowLoadingElement(Clock clock, int timeOutInSeconds) {
      super(clock, timeOutInSeconds);
    }

    @Override
    protected void load() {
      // Does nothing
    }

    @Override
    protected long sleepFor() {
      return AjaxElementLocator.this.sleepFor();
    }

    @Override
    protected void isLoaded() throws Error {
      try {
        element = AjaxElementLocator.super.findElement();
        if (!isElementUsable(element)) {
          throw new NoSuchElementException("Element is not usable");
        }
      } catch (NoSuchElementException e) {
        lastException = e;
        // Should use JUnit's AssertionError, but it may not be present
        throw new NoSuchElementError("Unable to locate the element", e);
      }
    }

    public NoSuchElementException getLastException() {
      return lastException;
    }

    public WebElement getElement() {
      return element;
    }
  }

  private static class NoSuchElementError extends Error {
    private NoSuchElementError(String message, Throwable throwable) {
      super(message, throwable);
    }
  }
}
