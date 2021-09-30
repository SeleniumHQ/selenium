// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.support.pagefactory;

import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.SlowLoadableComponent;

import java.lang.reflect.Field;
import java.time.Clock;
import java.util.ArrayList;
import java.util.List;

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
   * Use this constructor in order to process custom annotations.
   *
   * @param context The context to use when finding the element
   * @param timeOutInSeconds How long to wait for the element to appear. Measured in seconds.
   * @param annotations	AbstractAnnotations class implementation
   */
  public AjaxElementLocator(
      SearchContext context,
      int timeOutInSeconds,
      AbstractAnnotations annotations) {
    this(Clock.systemDefaultZone(), context, timeOutInSeconds, annotations);
  }

  public AjaxElementLocator(
      Clock clock,
      SearchContext context,
      int timeOutInSeconds,
      AbstractAnnotations annotations) {
    super(context, annotations);
    this.timeOutInSeconds = timeOutInSeconds;
    this.clock = clock;
  }

  /**
   * Main constructor.
   *
   * @param searchContext The context to use when finding the element
   * @param field The field representing this element
   * @param timeOutInSeconds How long to wait for the element to appear. Measured in seconds.
   */
  public AjaxElementLocator(SearchContext searchContext, Field field, int timeOutInSeconds) {
    this(Clock.systemDefaultZone(), searchContext, field, timeOutInSeconds);
  }

  public AjaxElementLocator(
      Clock clock,
      SearchContext searchContext,
      Field field,
      int timeOutInSeconds) {
    this(clock, searchContext, timeOutInSeconds, new Annotations(field));
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
   * {@inheritDoc}
   *
   * Will poll the interface on a regular basis until at least one element is present.
   */
  @Override
  public List<WebElement> findElements() {
    SlowLoadingElementList list = new SlowLoadingElementList(clock, timeOutInSeconds);
    try {
      return list.get().getElements();
    } catch (NoSuchElementError e) {
      return new ArrayList<>();
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
   * order to change whether or not you consider the element loaded. For example, perhaps you need
   * the element to be displayed:
   *
   * <pre>{@code
   *   return element.isDisplayed();
   * }</pre>
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

  private class SlowLoadingElementList extends SlowLoadableComponent<SlowLoadingElementList> {
    private NoSuchElementException lastException;
    private List<WebElement> elements;

    public SlowLoadingElementList(Clock clock, int timeOutInSeconds) {
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
        elements = AjaxElementLocator.super.findElements();
        if (elements.size() == 0) {
          throw new NoSuchElementException("Unable to locate the element");
        }
        for (WebElement element : elements) {
          if (!isElementUsable(element)) {
            throw new NoSuchElementException("Element is not usable");
          }
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

    public List<WebElement> getElements() {
      return elements;
    }
  }

  private static class NoSuchElementError extends Error {
    private NoSuchElementError(String message, Throwable throwable) {
      super(message, throwable);
    }
  }

}
