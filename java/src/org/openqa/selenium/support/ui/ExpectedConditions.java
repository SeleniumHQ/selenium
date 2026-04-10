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

package org.openqa.selenium.support.ui;

import static java.lang.System.lineSeparator;
import static java.util.Objects.requireNonNullElse;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NotFoundException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

/** Canned {@link ExpectedCondition}s which are generally useful within webdriver tests. */
@SuppressWarnings("MismatchedJavadocCode")
public class ExpectedConditions {
  private static final Logger LOG = Logger.getLogger(ExpectedConditions.class.getName());

  private ExpectedConditions() {
    // Utility class
  }

  /**
   * An expectation for checking the title of a page.
   *
   * @param title the expected title, which must be an exact match
   * @return true when the title matches, false otherwise
   */
  public static ExpectedCondition<Boolean> titleIs(final String title) {
    return new ExpectedCondition<>() {
      private @Nullable String currentTitle = "";

      @Override
      public Boolean apply(WebDriver driver) {
        currentTitle = driver.getTitle();
        return title.equals(currentTitle);
      }

      @Override
      public String toString() {
        return String.format("title to be \"%s\". Current title: \"%s\".", title, currentTitle);
      }
    };
  }

  /**
   * An expectation for checking that the title contains a case-sensitive substring
   *
   * @param title the fragment of title expected
   * @return true when the title matches, false otherwise
   */
  public static ExpectedCondition<Boolean> titleContains(final String title) {
    return new ExpectedCondition<>() {
      private @Nullable String currentTitle = "";

      @Override
      public Boolean apply(WebDriver driver) {
        currentTitle = driver.getTitle();
        return currentTitle != null && currentTitle.contains(title);
      }

      @Override
      public String toString() {
        return String.format(
            "title to contain \"%s\". Current title: \"%s\".", title, currentTitle);
      }
    };
  }

  /**
   * An expectation for the URL of the current page to be a specific url.
   *
   * @param url the url that the page should be on
   * @return <code>true</code> when the URL is what it should be
   */
  public static ExpectedCondition<Boolean> urlToBe(final String url) {
    return new ExpectedCondition<>() {
      private @Nullable String currentUrl = "";

      @Override
      public Boolean apply(WebDriver driver) {
        currentUrl = driver.getCurrentUrl();
        return currentUrl != null && currentUrl.equals(url);
      }

      @Override
      public String toString() {
        return String.format("url to be \"%s\". Current url: \"%s\"", url, currentUrl);
      }
    };
  }

  /**
   * An expectation for the URL of the current page to contain specific text.
   *
   * @param fraction the fraction of the url that the page should be on
   * @return <code>true</code> when the URL contains the text
   */
  public static ExpectedCondition<Boolean> urlContains(final String fraction) {
    return new ExpectedCondition<>() {
      private @Nullable String currentUrl = "";

      @Override
      public Boolean apply(WebDriver driver) {
        currentUrl = driver.getCurrentUrl();
        return currentUrl != null && currentUrl.contains(fraction);
      }

      @Override
      public String toString() {
        return String.format("url to contain \"%s\". Current url: \"%s\"", fraction, currentUrl);
      }
    };
  }

  /**
   * Expectation for the URL to match a specific regular expression
   *
   * @param regex the regular expression that the URL should match
   * @return <code>true</code> if the URL matches the specified regular expression
   */
  public static ExpectedCondition<Boolean> urlMatches(final String regex) {
    return urlMatches(Pattern.compile(regex));
  }

  /**
   * Expectation for the URL to match a specific regular expression
   *
   * @param regex the regular expression that the URL should match
   * @return <code>true</code> if the URL matches the specified regular expression
   */
  public static ExpectedCondition<Boolean> urlMatches(final Pattern regex) {
    return new ExpectedCondition<>() {
      private final Pattern pattern = regex;
      private @Nullable String currentUrl;

      @Override
      public Boolean apply(WebDriver driver) {
        currentUrl = driver.getCurrentUrl();
        return currentUrl != null && pattern.matcher(currentUrl).find();
      }

      @Override
      public String toString() {
        return String.format(
            "url to match the regex \"%s\". Current url: \"%s\"", regex, currentUrl);
      }
    };
  }

  /**
   * An expectation for checking that an element is present on the DOM of a page. This does not
   * necessarily mean that the element is visible.
   *
   * @param locator used to find the element
   * @return the WebElement once it is located
   */
  public static ExpectedCondition<@Nullable WebElement> presenceOfElementLocated(final By locator) {
    return new ExpectedCondition<>() {
      @Override
      @Nullable
      public WebElement apply(WebDriver driver) {
        try {
          return driver.findElement(locator);
        } catch (NoSuchElementException notFound) {
          return null;
        }
      }

      @Override
      public String toString() {
        return "presence of element found by " + locator;
      }
    };
  }

  /**
   * An expectation for checking that an element is present on the DOM of a page and visible.
   * Visibility means that the element is not only displayed but also has a height and width that is
   * greater than 0.
   *
   * @param locator used to find the element
   * @return the WebElement once it is located and visible
   */
  public static ExpectedCondition<WebElement> visibilityOfElementLocated(final By locator) {
    return new ExpectedCondition<>() {
      private @Nullable WebDriverException error;

      @Override
      public @Nullable WebElement apply(WebDriver driver) {
        error = null;
        try {
          return elementIfVisible(driver.findElement(locator));
        } catch (StaleElementReferenceException | NoSuchElementException elementDisappeared) {
          error = elementDisappeared;
          return null;
        }
      }

      @Override
      public String toString() {
        if (error != null) {
          return String.format(
              "visibility of element found by %s, but... %s.", locator, shortDescription(error));
        }
        return String.format("visibility of element found by %s", locator);
      }
    };
  }

  /**
   * An expectation for checking that all elements present on the web page that match the locator
   * are visible. Visibility means that the elements are not only displayed but also have a height
   * and width that is greater than 0.
   *
   * @param locator used to find the element
   * @return the list of WebElements once they are located
   */
  public static ExpectedCondition<@Nullable List<WebElement>> visibilityOfAllElementsLocatedBy(
      final By locator) {
    return new ExpectedCondition<>() {
      private int indexOfInvisibleElement = -1;
      private @Nullable WebElement invisibleElement;

      @Override
      public @Nullable List<WebElement> apply(WebDriver driver) {
        indexOfInvisibleElement = -1;
        invisibleElement = null;

        List<WebElement> elements = driver.findElements(locator);

        for (int i = 0; i < elements.size(); i++) {
          WebElement element = elements.get(i);
          if (!element.isDisplayed()) {
            indexOfInvisibleElement = i;
            invisibleElement = element;
            return null;
          }
        }
        return !elements.isEmpty() ? elements : null;
      }

      @Override
      public String toString() {
        return indexOfInvisibleElement == -1
            ? String.format(
                "visibility of all elements located by %s, but no elements were found", locator)
            : String.format(
                "visibility of all elements located by %s, but element #%s was invisible: %s",
                locator, indexOfInvisibleElement, invisibleElement);
      }
    };
  }

  /**
   * An expectation for checking that all elements present on the web page that match the locator
   * are visible. Visibility means that the elements are not only displayed but also have a height
   * and width that is greater than 0.
   *
   * @param elements list of WebElements
   * @return the list of WebElements once they are located
   */
  public static ExpectedCondition<@Nullable List<WebElement>> visibilityOfAllElements(
      final WebElement... elements) {
    return visibilityOfAllElements(List.of(elements));
  }

  /**
   * An expectation for checking that all elements present on the web page that match the locator
   * are visible. Visibility means that the elements are not only displayed but also have a height
   * and width that is greater than 0.
   *
   * @param elements list of WebElements
   * @return the list of WebElements once they are located
   */
  public static ExpectedCondition<@Nullable List<WebElement>> visibilityOfAllElements(
      final List<WebElement> elements) {
    return new ExpectedCondition<>() {
      private int indexOfInvisibleElement = -1;
      private @Nullable WebElement invisibleElement;

      @Override
      public @Nullable List<WebElement> apply(WebDriver driver) {
        indexOfInvisibleElement = -1;
        invisibleElement = null;

        for (int i = 0; i < elements.size(); i++) {
          WebElement element = elements.get(i);
          if (!element.isDisplayed()) {
            indexOfInvisibleElement = i;
            invisibleElement = element;
            return null;
          }
        }
        return !elements.isEmpty() ? elements : null;
      }

      @Override
      public String toString() {
        return indexOfInvisibleElement == -1
            ? String.format(
                "visibility of all %s elements, but no elements were found", elements.size())
            : String.format(
                "visibility of all %s elements, but element #%s was invisible: %s",
                elements.size(), indexOfInvisibleElement, invisibleElement);
      }
    };
  }

  /**
   * An expectation for checking that an element, known to be present on the DOM of a page, is
   * visible. Visibility means that the element is not only displayed but also has a height and
   * width that is greater than 0.
   *
   * @param element the WebElement
   * @return the (same) WebElement once it is visible
   */
  public static ExpectedCondition<@Nullable WebElement> visibilityOf(final WebElement element) {
    return new ExpectedCondition<>() {
      @Override
      public @Nullable WebElement apply(WebDriver driver) {
        return elementIfVisible(element);
      }

      @Override
      public String toString() {
        return "visibility of " + element;
      }
    };
  }

  /**
   * @return the given element if it is visible and has non-zero size, otherwise null.
   */
  private static @Nullable WebElement elementIfVisible(WebElement element) {
    return element.isDisplayed() ? element : null;
  }

  /**
   * An expectation for checking that there is at least one element present on a web page.
   *
   * @param locator used to find the element
   * @return the list of WebElements once they are located
   */
  public static ExpectedCondition<@Nullable List<WebElement>> presenceOfAllElementsLocatedBy(
      final By locator) {
    return new ExpectedCondition<>() {
      @Override
      public @Nullable List<WebElement> apply(WebDriver driver) {
        List<WebElement> elements = driver.findElements(locator);
        return !elements.isEmpty() ? elements : null;
      }

      @Override
      public String toString() {
        return "presence of any elements located by " + locator;
      }
    };
  }

  /**
   * An expectation for checking if the given text is present in the specified element.
   *
   * @param element the WebElement
   * @param text to be present in the element
   * @return true once the element contains the given text
   */
  public static ExpectedCondition<Boolean> textToBePresentInElement(
      final WebElement element, final String text) {

    return new ExpectedCondition<>() {
      private @Nullable String elementText;
      private @Nullable WebDriverException error;

      @Override
      public Boolean apply(WebDriver driver) {
        elementText = null;
        error = null;
        try {
          elementText = element.getText();
          return elementText.contains(text);
        } catch (StaleElementReferenceException | NoSuchElementException e) {
          error = e;
          return false;
        }
      }

      @Override
      public String toString() {
        if (error != null) {
          return String.format(
              "element to have text \"%s\", but... %s.", text, shortDescription(error));
        }
        return String.format(
            "element to have text \"%s\". Current text: \"%s\".", text, elementText);
      }
    };
  }

  /**
   * An expectation for checking if the given text is present in the element that matches the given
   * locator.
   *
   * @param locator used to find the element
   * @param text to be present in the element found by the locator
   * @return true once the first element found by locator contains the given text
   */
  public static ExpectedCondition<Boolean> textToBePresentInElementLocated(
      final By locator, final String text) {

    return new ExpectedCondition<>() {
      private @Nullable String elementText;
      private @Nullable WebDriverException error;

      @Override
      public Boolean apply(WebDriver driver) {
        elementText = null;
        error = null;
        try {
          elementText = driver.findElement(locator).getText();
          return elementText.contains(text);
        } catch (StaleElementReferenceException | NoSuchElementException e) {
          error = e;
          return false;
        }
      }

      @Override
      public String toString() {
        if (error != null) {
          return String.format(
              "element found by %s to contain text \"%s\", but... %s.",
              locator, text, shortDescription(error));
        }
        return String.format(
            "element found by %s to contain text \"%s\". Current text: \"%s\".",
            locator, text, elementText);
      }
    };
  }

  /**
   * An expectation for checking if the given text is present in the specified elements value
   * attribute.
   *
   * @param element the WebElement
   * @param expectedValue to be present in the element's value attribute
   * @return true once the element's value attribute contains the given text
   */
  public static ExpectedCondition<Boolean> textToBePresentInElementValue(
      final WebElement element, final String expectedValue) {

    return new ExpectedCondition<>() {
      private @Nullable String actualValue;
      private @Nullable WebDriverException error;

      @Override
      public Boolean apply(WebDriver driver) {
        actualValue = null;
        error = null;
        try {
          actualValue = element.getAttribute("value");
          return actualValue != null && actualValue.contains(expectedValue);
        } catch (StaleElementReferenceException | NoSuchElementException e) {
          error = e;
          return false;
        }
      }

      @Override
      public String toString() {
        if (error != null) {
          return String.format(
              "element \"value\" attribute to contain \"%s\", but... %s.",
              expectedValue, shortDescription(error));
        }
        return String.format(
            "element \"value\" attribute to contain \"%s\". Current value: \"%s\".",
            expectedValue, actualValue);
      }
    };
  }

  /**
   * An expectation for checking if the given text is present in the specified elements value
   * attribute.
   *
   * @param locator used to find the element
   * @param expectedValue to be present in the value attribute of the element found by the locator
   * @return true once the value attribute of the first element found by locator contains the given
   *     text
   */
  public static ExpectedCondition<Boolean> textToBePresentInElementValue(
      final By locator, final String expectedValue) {
    return new ExpectedCondition<>() {
      private @Nullable String actualValue;
      private @Nullable WebDriverException error;

      @Override
      public Boolean apply(WebDriver driver) {
        actualValue = null;
        error = null;
        try {
          actualValue = driver.findElement(locator).getAttribute("value");
          return actualValue != null && actualValue.contains(expectedValue);
        } catch (NoSuchElementException | StaleElementReferenceException e) {
          error = e;
          return false;
        }
      }

      @Override
      public String toString() {
        if (error != null) {
          return String.format(
              "element found by %s to have \"value\" attribute containing \"%s\", but... %s.",
              locator, expectedValue, shortDescription(error));
        }
        return String.format(
            "element found by %s to have \"value\" attribute containing \"%s\". Current value:"
                + " \"%s\".",
            locator, expectedValue, actualValue);
      }
    };
  }

  /**
   * An expectation for checking whether the given frame is available to switch to.
   *
   * <p>If the frame is available it switches the given driver to the specified frame.
   *
   * @param frameLocator used to find the frame (id or name)
   * @return WebDriver instance after frame has been switched
   */
  public static ExpectedCondition<WebDriver> frameToBeAvailableAndSwitchToIt(
      final String frameLocator) {
    return new ExpectedCondition<>() {
      private @Nullable NoSuchFrameException error;

      @Override
      public @Nullable WebDriver apply(WebDriver driver) {
        error = null;
        try {
          return driver.switchTo().frame(frameLocator);
        } catch (NoSuchFrameException e) {
          error = e;
          return null;
        }
      }

      @Override
      public String toString() {
        return String.format(
            "frame with name or id \"%s\" to be available, but... %s.",
            frameLocator, shortDescription(error));
      }
    };
  }

  /**
   * An expectation for checking whether the given frame is available to switch to.
   *
   * <p>If the frame is available it switches the given driver to the specified frame.
   *
   * @param locator used to find the frame
   * @return WebDriver instance after frame has been switched
   */
  public static ExpectedCondition<@Nullable WebDriver> frameToBeAvailableAndSwitchToIt(
      final By locator) {
    return new ExpectedCondition<>() {
      private @Nullable NotFoundException error;

      @Override
      public @Nullable WebDriver apply(WebDriver driver) {
        error = null;
        try {
          WebElement frame = driver.findElement(locator);
          return driver.switchTo().frame(frame);
        } catch (NoSuchElementException | NoSuchFrameException e) {
          error = e;
          return null;
        }
      }

      @Override
      public String toString() {
        return String.format(
            "frame to be available: %s, but... %s.", locator, shortDescription(error));
      }
    };
  }

  /**
   * An expectation for checking whether a frame with given index is available to switch to.
   *
   * <p>If the frame is available it switches the given driver to the specified frameIndex.
   *
   * @param frameIndex the number of the frame among all frames (index)
   * @return WebDriver instance after frame has been switched
   */
  public static ExpectedCondition<WebDriver> frameToBeAvailableAndSwitchToIt(final int frameIndex) {
    return new ExpectedCondition<>() {
      private @Nullable NoSuchFrameException error;

      @Override
      public @Nullable WebDriver apply(WebDriver driver) {
        error = null;
        try {
          return driver.switchTo().frame(frameIndex);
        } catch (NoSuchFrameException e) {
          error = e;
          return null;
        }
      }

      @Override
      public String toString() {
        return String.format(
            "frame #%s to be available, but... %s.", frameIndex, shortDescription(error));
      }
    };
  }

  /**
   * An expectation for checking whether the given frame is available to switch to.
   *
   * <p>If the frame is available it switches the given driver to the specified web element.
   *
   * @param frame used to find the frame (web element)
   * @return WebDriver instance after frame has been switched
   */
  public static ExpectedCondition<@Nullable WebDriver> frameToBeAvailableAndSwitchToIt(
      final WebElement frame) {
    return new ExpectedCondition<>() {
      private @Nullable NoSuchFrameException error;

      @Override
      public @Nullable WebDriver apply(WebDriver driver) {
        error = null;
        try {
          return driver.switchTo().frame(frame);
        } catch (NoSuchFrameException e) {
          error = e;
          return null;
        }
      }

      @Override
      public String toString() {
        return String.format("frame to be available, but... %s.", shortDescription(error));
      }
    };
  }

  /**
   * An expectation for checking that an element is either invisible or not present on the DOM.
   *
   * @param locator used to find the element
   * @return true if the element is not displayed or the element doesn't exist or stale element
   */
  public static ExpectedCondition<Boolean> invisibilityOfElementLocated(final By locator) {
    return new ExpectedCondition<>() {
      @Override
      public Boolean apply(WebDriver driver) {
        try {
          return !driver.findElement(locator).isDisplayed();
        } catch (NoSuchElementException | StaleElementReferenceException elementDisappeared) {
          return true;
        }
      }

      @Override
      public String toString() {
        return String.format("element found by %s to become invisible", locator);
      }
    };
  }

  /**
   * An expectation for checking that an element with text is either invisible or not present on the
   * DOM.
   *
   * @param locator used to find the element
   * @param text of the element
   * @return true if no such element, stale element or displayed text not equal that provided
   */
  public static ExpectedCondition<Boolean> invisibilityOfElementWithText(
      final By locator, final String text) {
    return new ExpectedCondition<>() {
      private @Nullable WebElement visibleElement;

      @Override
      public Boolean apply(WebDriver driver) {
        visibleElement = null;
        visibleElement =
            driver.findElements(locator).stream()
                .filter(element -> element.getText().equals(text))
                .filter(element -> !isInvisible(element))
                .findAny()
                .orElse(null);
        return visibleElement == null;
      }

      @Override
      public String toString() {
        return String.format(
            "element with text \"%s\" located by \"%s\" to become invisible: %s",
            text, locator, visibleElement);
      }
    };
  }

  /**
   * An expectation for checking an element is visible and enabled such that you can click it.
   *
   * @param locator used to find the element
   * @return the WebElement once it is located and clickable (visible and enabled)
   */
  public static ExpectedCondition<WebElement> elementToBeClickable(final By locator) {
    return new ExpectedCondition<>() {
      private @Nullable String message;

      @Override
      public @Nullable WebElement apply(WebDriver driver) {
        message = null;
        try {
          WebElement element = driver.findElement(locator);
          if (!element.isDisplayed()) {
            message = "was not visible";
            return null;
          } else if (!element.isEnabled()) {
            message = "was not enabled";
            return null;
          }
          return element;
        } catch (NoSuchElementException | StaleElementReferenceException e) {
          message = "was not found: " + shortDescription(e);
          return null;
        }
      }

      @Override
      public String toString() {
        return String.format(
            "element found by %s to be clickable, but the element %s.", locator, message);
      }
    };
  }

  /**
   * An expectation for checking an element is visible and enabled such that you can click it.
   *
   * @param element the WebElement
   * @return the (same) WebElement once it is clickable (visible and enabled)
   */
  public static ExpectedCondition<WebElement> elementToBeClickable(final WebElement element) {
    return new ExpectedCondition<>() {
      private @Nullable String message;

      @Override
      public @Nullable WebElement apply(WebDriver driver) {
        message = null;
        try {
          if (!element.isDisplayed()) {
            message = "was not visible";
            return null;
          } else if (!element.isEnabled()) {
            message = "was not enabled";
            return null;
          }
          return element;
        } catch (NoSuchElementException | StaleElementReferenceException e) {
          message = "was not found: " + shortDescription(e);
          return null;
        }
      }

      @Override
      public String toString() {
        return String.format("element to be clickable, but the element %s.", message);
      }
    };
  }

  /**
   * Wait until an element is no longer attached to the DOM.
   *
   * @param element The element to wait for.
   * @return false if the element is still attached to the DOM, true otherwise.
   */
  public static ExpectedCondition<Boolean> stalenessOf(final WebElement element) {
    return new ExpectedCondition<>() {
      @Override
      public Boolean apply(WebDriver ignored) {
        try {
          // Calling any method forces a staleness check
          element.isEnabled();
          return false;
        } catch (StaleElementReferenceException | NoSuchElementException expected) {
          return true;
        }
      }

      @Override
      public String toString() {
        return String.format("element (%s) to become stale", element);
      }
    };
  }

  /**
   * Wrapper for a condition, which allows for elements to update by redrawing.
   *
   * <p>This works around the problem of conditions which have two parts: find an element and then
   * check for some condition on it. For these conditions it is possible that an element is located
   * and then subsequently it is redrawn on the client. When this happens a {@link
   * StaleElementReferenceException} is thrown when the second part of the condition is checked.
   *
   * @param condition ExpectedCondition to wrap
   * @param <T> return type of the condition provided
   * @return the result of the provided condition
   */
  public static <T> ExpectedCondition<@Nullable T> refreshed(final ExpectedCondition<T> condition) {
    return new ExpectedCondition<>() {
      @Override
      public @Nullable T apply(WebDriver driver) {
        try {
          return condition.apply(driver);
        } catch (StaleElementReferenceException | NoSuchElementException e) {
          return null;
        }
      }

      @Override
      public String toString() {
        return String.format("condition (%s) to be refreshed", condition);
      }
    };
  }

  /**
   * An expectation for checking if the given element is selected.
   *
   * @param element WebElement to be selected
   * @return true once the element is selected
   */
  public static ExpectedCondition<Boolean> elementToBeSelected(final WebElement element) {
    return elementSelectionStateToBe(element, true);
  }

  /**
   * An expectation for checking if the given element is selected.
   *
   * @param element WebElement to be selected
   * @param selected boolean state of the selection state of the element
   * @return true once the element's selection stated is that of selected
   */
  public static ExpectedCondition<Boolean> elementSelectionStateToBe(
      final WebElement element, final boolean selected) {
    return new ExpectedCondition<>() {
      @Override
      public Boolean apply(WebDriver driver) {
        return element.isSelected() == selected;
      }

      @Override
      public String toString() {
        return String.format(
            "element (%s) %s selected", element, (selected ? "to be" : "not to be"));
      }
    };
  }

  public static ExpectedCondition<Boolean> elementToBeSelected(final By locator) {
    return elementSelectionStateToBe(locator, true);
  }

  public static ExpectedCondition<Boolean> elementSelectionStateToBe(
      final By locator, final boolean selected) {
    return new ExpectedCondition<>() {
      private @Nullable WebDriverException error;

      @Override
      public Boolean apply(WebDriver driver) {
        error = null;
        try {
          WebElement element = driver.findElement(locator);
          return element.isSelected() == selected;
        } catch (NoSuchElementException | StaleElementReferenceException e) {
          error = e;
          return false;
        }
      }

      @Override
      public String toString() {
        String message =
            String.format(
                "element found by %s %s selected", locator, (selected ? "to be" : "not to be"));
        return error == null
            ? message
            : String.format("%s, but... %s.", message, shortDescription(error));
      }
    };
  }

  public static ExpectedCondition<@Nullable Alert> alertIsPresent() {
    return new ExpectedCondition<>() {
      @Override
      public @Nullable Alert apply(WebDriver driver) {
        try {
          return driver.switchTo().alert();
        } catch (NoAlertPresentException e) {
          return null;
        }
      }

      @Override
      public String toString() {
        return "alert to be present";
      }
    };
  }

  public static ExpectedCondition<Boolean> numberOfWindowsToBe(final int expectedNumberOfWindows) {
    return new ExpectedCondition<>() {
      private int actualNumberOfWindows = -1;
      private @Nullable WebDriverException error;

      @Override
      public Boolean apply(WebDriver driver) {
        error = null;
        actualNumberOfWindows = -1;
        try {
          actualNumberOfWindows = driver.getWindowHandles().size();
          return actualNumberOfWindows == expectedNumberOfWindows;
        } catch (WebDriverException e) {
          error = e;
          LOG.log(Level.FINE, "Failed to check number of windows", e);
          return false;
        }
      }

      @Override
      public String toString() {
        if (error != null) {
          return String.format(
              "number of open windows to be %s, but... %s.",
              expectedNumberOfWindows, shortDescription(error));
        }
        return String.format(
            "number of open windows to be %s, but was: %s",
            expectedNumberOfWindows, actualNumberOfWindows);
      }
    };
  }

  /**
   * An expectation with the logical opposite condition of the given condition.
   *
   * <p>Note that if the Condition you are inverting throws an exception that is caught by the
   * Ignored Exceptions, the inversion will not take place and lead to confusing results.
   *
   * @param condition ExpectedCondition to be inverted
   * @return true once the condition is satisfied
   */
  public static ExpectedCondition<Boolean> not(final ExpectedCondition<?> condition) {
    return new ExpectedCondition<>() {
      @Override
      public Boolean apply(WebDriver driver) {
        Object result = condition.apply(driver);
        return result == null || result.equals(Boolean.FALSE);
      }

      @Override
      public String toString() {
        return "condition not to be valid: " + condition;
      }
    };
  }

  /**
   * An expectation for checking WebElement with given locator has attribute with a specific value
   *
   * @param locator used to find the element
   * @param attribute used to define CSS value or HTML attribute
   * @param value used as expected attribute value
   * @return Boolean true when element has CSS value or HTML attribute with the value
   */
  public static ExpectedCondition<Boolean> attributeToBe(
      final By locator, final String attribute, final String value) {
    return new ExpectedCondition<>() {
      private @Nullable String currentValue = null;

      @Override
      public Boolean apply(WebDriver driver) {
        WebElement element = driver.findElement(locator);
        currentValue = getAttributeOrCssValue(element, attribute).orElse(null);
        return value.equals(currentValue);
      }

      @Override
      public String toString() {
        return String.format(
            "element found by %s to have attribute or CSS value \"%s\"=\"%s\". Current value:"
                + " \"%s\".",
            locator, attribute, value, currentValue);
      }
    };
  }

  /**
   * An expectation for checking WebElement with given locator has specific text
   *
   * @param locator used to find the element
   * @param expectedText used as expected text
   * @return Boolean true when element has text value equal to @value
   */
  public static ExpectedCondition<Boolean> textToBe(final By locator, final String expectedText) {
    return new ExpectedCondition<>() {
      private @Nullable String actualText = null;
      private @Nullable Exception error = null;

      @Override
      public Boolean apply(WebDriver driver) {
        actualText = null;
        error = null;

        try {
          actualText = driver.findElement(locator).getText();
          return actualText.equals(expectedText);
        } catch (NoSuchElementException | StaleElementReferenceException e) {
          error = e;
          return false;
        } catch (Exception e) { // TODO Remove `catch (Exception e)`
          LOG.log(Level.WARNING, "Failed to check element text", e);
          error = e;
          return false;
        }
      }

      @Override
      public String toString() {
        if (error != null) {
          return String.format(
              "element found by %s to have text \"%s\", but... %s.",
              locator, expectedText, shortDescription(error));
        }
        return String.format(
            "element found by %s to have text \"%s\". Current text: \"%s\".",
            locator, expectedText, actualText);
      }
    };
  }

  /**
   * An expectation for checking WebElement with given locator has text with a value as a part of it
   *
   * @param locator used to find the element
   * @param pattern used as expected text matcher pattern
   * @return Boolean true when element has text value containing @value
   */
  public static ExpectedCondition<Boolean> textMatches(final By locator, final Pattern pattern) {
    return new ExpectedCondition<>() {
      private @Nullable String actualText;
      private @Nullable Exception error;

      @Override
      public Boolean apply(WebDriver driver) {
        actualText = null;
        error = null;

        try {
          actualText = driver.findElement(locator).getText();
          return pattern.matcher(actualText).find();
        } catch (NoSuchElementException | StaleElementReferenceException e) {
          error = e;
          return false;
        } catch (Exception e) { // TODO Remove `catch (Exception e)`
          LOG.log(Level.WARNING, "Failed to check element text", e);
          error = e;
          return false;
        }
      }

      @Override
      public String toString() {
        if (error != null) {
          return String.format(
              "text of element found by %s to match pattern \"%s\", but... %s.",
              locator, pattern.pattern(), shortDescription(error));
        }
        return String.format(
            "text of element found by %s to match pattern \"%s\". Current text: \"%s\".",
            locator, pattern.pattern(), actualText);
      }
    };
  }

  /**
   * An expectation for checking number of WebElements with given locator being more than defined
   * number
   *
   * @param locator used to find the element
   * @param expectedNumber used to define minimum number of elements
   * @return Boolean true when size of elements list is more than defined
   */
  public static ExpectedCondition<@Nullable List<WebElement>> numberOfElementsToBeMoreThan(
      final By locator, final Integer expectedNumber) {
    return new ExpectedCondition<>() {
      private Integer actualNumber = 0;

      @Override
      public @Nullable List<WebElement> apply(WebDriver webDriver) {
        List<WebElement> elements = webDriver.findElements(locator);
        actualNumber = elements.size();
        return actualNumber > expectedNumber ? elements : null;
      }

      @Override
      public String toString() {
        return String.format(
            "number of elements found by %s to be more than %s. Found: %s element(s).",
            locator, expectedNumber, actualNumber);
      }
    };
  }

  /**
   * An expectation for checking number of WebElements with given locator being less than defined
   * number
   *
   * @param locator used to find the element
   * @param number used to define maximum number of elements
   * @return Boolean true when size of elements list is less than defined
   */
  public static ExpectedCondition<@Nullable List<WebElement>> numberOfElementsToBeLessThan(
      final By locator, final Integer number) {
    return new ExpectedCondition<>() {
      private Integer currentNumber = 0;

      @Override
      public @Nullable List<WebElement> apply(WebDriver webDriver) {
        List<WebElement> elements = webDriver.findElements(locator);
        currentNumber = elements.size();
        return currentNumber < number ? elements : null;
      }

      @Override
      public String toString() {
        return String.format(
            "number of elements found by %s to be less than %s. Found: %s element(s).",
            locator, number, currentNumber);
      }
    };
  }

  /**
   * An expectation for checking number of WebElements with given locator
   *
   * @param locator used to find the element
   * @param expectedNumberOfElements used to define number of elements
   * @return Boolean true when size of elements list is equal to defined
   */
  public static ExpectedCondition<@Nullable List<WebElement>> numberOfElementsToBe(
      final By locator, final Integer expectedNumberOfElements) {
    return new ExpectedCondition<>() {
      private Integer actualNumberOfElements = -1;

      @Override
      public @Nullable List<WebElement> apply(WebDriver webDriver) {
        actualNumberOfElements = -1;

        List<WebElement> elements = webDriver.findElements(locator);
        actualNumberOfElements = elements.size();
        return actualNumberOfElements.equals(expectedNumberOfElements) ? elements : null;
      }

      @Override
      public String toString() {
        return String.format(
            "number of elements found by %s to be %s. Found: %s element(s).",
            locator, expectedNumberOfElements, actualNumberOfElements);
      }
    };
  }

  /**
   * An expectation for checking given WebElement has DOM property with a specific value
   *
   * @param element used to check its parameters
   * @param property property name
   * @param expectedValue used as expected property value
   * @return Boolean true when element has DOM property with the value
   */
  public static ExpectedCondition<Boolean> domPropertyToBe(
      final WebElement element, final String property, final String expectedValue) {
    return new ExpectedCondition<>() {
      private @Nullable String actualValue = null;

      @Override
      public Boolean apply(WebDriver driver) {
        actualValue = element.getDomProperty(property);
        return expectedValue.equals(actualValue);
      }

      @Override
      public String toString() {
        return String.format(
            "DOM property \"%s\" to be \"%s\". Current value: \"%s\".",
            property, expectedValue, actualValue);
      }
    };
  }

  /**
   * An expectation for checking given WebElement has DOM attribute with a specific value
   *
   * @param element used to check its parameters
   * @param attribute attribute name
   * @param value used as expected attribute value
   * @return Boolean true when element has DOM attribute with the value
   */
  public static ExpectedCondition<Boolean> domAttributeToBe(
      final WebElement element, final String attribute, final String value) {
    return new ExpectedCondition<>() {
      private @Nullable String currentValue = null;

      @Override
      public Boolean apply(WebDriver driver) {
        currentValue = element.getDomAttribute(attribute);
        return value.equals(currentValue);
      }

      @Override
      public String toString() {
        return String.format(
            "DOM attribute \"%s\" to be \"%s\". Current value: \"%s\".",
            attribute, value, currentValue);
      }
    };
  }

  /**
   * An expectation for checking given WebElement has attribute with a specific value
   *
   * @param element used to check its parameters
   * @param attribute used to define css or html attribute
   * @param expectedValue used as expected attribute value
   * @return Boolean true when element has CSS property or HTML attribute with the value
   */
  public static ExpectedCondition<Boolean> attributeToBe(
      final WebElement element, final String attribute, final String expectedValue) {
    return new ExpectedCondition<>() {
      private @Nullable String actualValue;

      @Override
      public Boolean apply(WebDriver driver) {
        actualValue = null;
        actualValue = getAttributeOrCssValue(element, attribute).orElse(null);
        return expectedValue.equals(actualValue);
      }

      @Override
      public String toString() {
        return String.format(
            "attribute or CSS value \"%s\"=\"%s\". Current value: \"%s\".",
            attribute, expectedValue, actualValue);
      }
    };
  }

  /**
   * An expectation for checking WebElement with given locator has attribute which contains specific
   * value
   *
   * @param element used to check its parameters
   * @param attribute used to define css or html attribute
   * @param expectedValue used as expected attribute value
   * @return Boolean true when element has CSS property or HTML attribute which contains the value
   */
  public static ExpectedCondition<Boolean> attributeContains(
      final WebElement element, final String attribute, final String expectedValue) {
    return new ExpectedCondition<>() {
      private @Nullable String actualValue;

      @Override
      public Boolean apply(WebDriver driver) {
        actualValue = null;
        actualValue = getAttributeOrCssValue(element, attribute).orElse(null);
        return actualValue != null && actualValue.contains(expectedValue);
      }

      @Override
      public String toString() {
        return String.format(
            "attribute or CSS value \"%s\" to contain \"%s\". Current value: \"%s\".",
            attribute, expectedValue, actualValue);
      }
    };
  }

  /**
   * An expectation for checking WebElement with given locator has attribute which contains specific
   * value
   *
   * @param locator used to define WebElement to check its parameters
   * @param attributeName used to define css or html attribute
   * @param expectedValue used as expected attribute value
   * @return Boolean true when element has css or html attribute which contains the value
   */
  public static ExpectedCondition<Boolean> attributeContains(
      final By locator, final String attributeName, final String expectedValue) {
    return new ExpectedCondition<>() {
      private Optional<String> actualValue = Optional.empty();

      @Override
      public Boolean apply(WebDriver driver) {
        actualValue = Optional.empty();
        actualValue = getAttributeOrCssValue(driver.findElement(locator), attributeName);
        return actualValue.map(seen -> seen.contains(expectedValue)).orElse(false);
      }

      @Override
      public String toString() {
        return actualValue
            .map(
                value ->
                    String.format(
                        "element found by %s to have attribute or CSS value \"%s\" containing"
                            + " \"%s\", but the attribute had value \"%s\".",
                        locator, attributeName, expectedValue, value))
            .orElseGet(
                () ->
                    String.format(
                        "element found by %s to have attribute or CSS value \"%s\" containing"
                            + " \"%s\", but such attribute was not found.",
                        locator, attributeName, expectedValue));
      }
    };
  }

  /**
   * An expectation for checking WebElement any non-empty value for given attribute
   *
   * @param element used to check its parameters
   * @param attribute used to define css or html attribute
   * @return Boolean true when element has CSS value or HTML attribute with non-empty value
   */
  public static ExpectedCondition<Boolean> attributeToBeNotEmpty(
      final WebElement element, final String attribute) {
    return new ExpectedCondition<>() {
      @Override
      public Boolean apply(WebDriver driver) {
        return getAttributeOrCssValue(element, attribute).isPresent();
      }

      @Override
      public String toString() {
        return String.format("attribute or CSS value \"%s\" not to be empty", attribute);
      }
    };
  }

  private static Optional<String> getAttributeOrCssValue(WebElement element, String name) {
    String value = element.getAttribute(name);
    if (value == null || value.isEmpty()) {
      value = element.getCssValue(name);
    }

    if (value == null || value.isEmpty()) {
      return Optional.empty();
    }

    return Optional.of(value);
  }

  /**
   * An expectation for checking all child elements inside the parent element to be visible
   *
   * @param parent used to check parent element. For example, table with locator {@code
   *     By.id("fish")}.
   * @param childLocator used to find the child elements.
   * @return visible nested element
   */
  public static ExpectedCondition<@Nullable List<WebElement>> visibilityOfNestedElementsLocatedBy(
      final By parent, final By childLocator) {
    return new ExpectedCondition<>() {
      private int indexOfInvisibleElement = -1;
      private @Nullable WebElement invisibleChild;

      @Override
      public @Nullable List<WebElement> apply(WebDriver driver) {
        invisibleChild = null;
        indexOfInvisibleElement = -1;

        WebElement current = driver.findElement(parent);

        List<WebElement> allChildren = current.findElements(childLocator);
        if (allChildren.isEmpty()) {
          return null;
        }
        for (int i = 0; i < allChildren.size(); i++) {
          if (!allChildren.get(i).isDisplayed()) {
            indexOfInvisibleElement = i;
            invisibleChild = allChildren.get(i);
            return null;
          }
        }
        return allChildren;
      }

      @Override
      public String toString() {
        if (indexOfInvisibleElement == -1) {
          return String.format(
              "visibility of all child elements located by %s -> %s, but no elements were found.",
              parent, childLocator);
        }
        return String.format(
            "visibility of all child elements located by %s -> %s, but child element #%s was"
                + " invisible: %s",
            parent, childLocator, indexOfInvisibleElement, invisibleChild);
      }
    };
  }

  /**
   * An expectation for checking child WebElement as a part of parent element to be visible
   *
   * @param element used as parent element. For example, table with locator {@code
   *     By.xpath("//table")}.
   * @param childLocator used to find child element. For example, td with locator {@code
   *     By.xpath("./tr/td")}.
   * @return visible sub-element
   */
  public static ExpectedCondition<@Nullable List<WebElement>> visibilityOfNestedElementsLocatedBy(
      final WebElement element, final By childLocator) {
    return new ExpectedCondition<>() {
      private int indexOfInvisibleElement = -1;
      private @Nullable WebElement invisibleChild;

      @Override
      public @Nullable List<WebElement> apply(WebDriver webDriver) {
        invisibleChild = null;
        indexOfInvisibleElement = -1;

        List<WebElement> allChildren = element.findElements(childLocator);

        if (allChildren.isEmpty()) {
          return null;
        }
        for (int i = 0; i < allChildren.size(); i++) {
          if (!allChildren.get(i).isDisplayed()) {
            indexOfInvisibleElement = i;
            invisibleChild = allChildren.get(i);
            return null;
          }
        }
        return allChildren;
      }

      @Override
      public String toString() {
        if (indexOfInvisibleElement == -1) {
          return String.format(
              "visibility of all child elements located by %s -> %s, but no elements were found.",
              element, childLocator);
        }
        return String.format(
            "visibility of all child elements located by %s -> %s, but child element #%s was"
                + " invisible: %s",
            element, childLocator, indexOfInvisibleElement, invisibleChild);
      }
    };
  }

  /**
   * An expectation for parent element to have a child with given locator (either visible or hidden)
   *
   * @param locator used to check parent element. For example, table with locator {@code
   *     By.xpath("//table")}.
   * @param childLocator used to find child element. For example, td with locator {@code
   *     By.xpath("./tr/td")}.
   * @return sub-element
   */
  public static ExpectedCondition<@Nullable WebElement> presenceOfNestedElementLocatedBy(
      final By locator, final By childLocator) {
    return new ExpectedCondition<>() {

      @Override
      public @Nullable WebElement apply(WebDriver webDriver) {
        WebElement parent = webDriver.findElement(locator);
        try {
          return parent.findElement(childLocator);
        } catch (StaleElementReferenceException | NoSuchElementException notFound) {
          return null;
        }
      }

      @Override
      public String toString() {
        return String.format("presence of element found by %s -> %s", locator, childLocator);
      }
    };
  }

  /**
   * An expectation for checking that given parent element contains a child element with given
   * locator (either visible or hidden).
   *
   * @param element used as parent element
   * @param childLocator used to find child element. For example, td with locator {@code
   *     By.xpath("./tr/td")}.
   * @return sub-element
   */
  public static ExpectedCondition<@Nullable WebElement> presenceOfNestedElementLocatedBy(
      final WebElement element, final By childLocator) {

    return new ExpectedCondition<>() {
      @Override
      @Nullable
      public WebElement apply(WebDriver webDriver) {
        try {
          return element.findElement(childLocator);
        } catch (StaleElementReferenceException | NoSuchElementException notFound) {
          return null;
        }
      }

      @Override
      public String toString() {
        return String.format("presence of child element found by %s", childLocator);
      }
    };
  }

  /**
   * An expectation for parent element to have some children with locator (either visible or hidden)
   *
   * @param parent used to check parent element. For example, table with locator {@code
   *     By.xpath("//table")}.
   * @param childLocator used to find child element. For example, td with locator {@code
   *     By.xpath("./tr/td")}.
   * @return sub-element
   */
  public static ExpectedCondition<@Nullable List<WebElement>> presenceOfNestedElementsLocatedBy(
      final By parent, final By childLocator) {
    return new ExpectedCondition<>() {

      @Override
      public @Nullable List<WebElement> apply(WebDriver driver) {
        List<WebElement> allChildren = driver.findElement(parent).findElements(childLocator);

        return allChildren.isEmpty() ? null : allChildren;
      }

      @Override
      public String toString() {
        return String.format("presence of element(s) located by %s -> %s", parent, childLocator);
      }
    };
  }

  /**
   * An expectation for checking all elements from given list to be invisible
   *
   * @param elements used to check their invisibility
   * @return Boolean true when all elements are not visible anymore
   */
  public static ExpectedCondition<Boolean> invisibilityOfAllElements(final WebElement... elements) {
    return invisibilityOfAllElements(List.of(elements));
  }

  /**
   * An expectation for checking all elements from given list to be invisible
   *
   * @param elements used to check their invisibility
   * @return Boolean true when all elements are not visible anymore
   */
  public static ExpectedCondition<Boolean> invisibilityOfAllElements(
      final List<WebElement> elements) {
    return new ExpectedCondition<>() {
      private int indexOfVisibleElement = -1;
      private @Nullable WebElement visibleElement;

      @Override
      public Boolean apply(WebDriver webDriver) {
        visibleElement = null;
        indexOfVisibleElement = -1;

        for (int i = 0; i < elements.size(); i++) {
          if (!isInvisible(elements.get(i))) {
            indexOfVisibleElement = i;
            visibleElement = elements.get(i);
            return false;
          }
        }
        return true;
      }

      @Override
      public String toString() {
        return String.format(
            "all elements to become invisible, but element #%s was visible: %s",
            indexOfVisibleElement, visibleElement);
      }
    };
  }

  /**
   * An expectation for checking the element to be invisible
   *
   * @param element used to check its invisibility
   * @return Boolean true when element is not visible anymore
   */
  public static ExpectedCondition<Boolean> invisibilityOf(final WebElement element) {
    return new ExpectedCondition<>() {

      @Override
      public Boolean apply(WebDriver webDriver) {
        return isInvisible(element);
      }

      @Override
      public String toString() {
        return String.format("element %s to become invisible", element);
      }
    };
  }

  private static boolean isInvisible(final WebElement element) {
    try {
      return !element.isDisplayed();
    } catch (StaleElementReferenceException | NoSuchElementException ignored) {
      // We can assume a stale element isn't displayed.
      return true;
    }
  }

  /**
   * An expectation with the logical or condition of the given list of conditions.
   *
   * <p>Each condition is checked until at least one of them returns true or not null.
   *
   * @param conditions ExpectedCondition is a list of alternative conditions
   * @return true once one of conditions is satisfied
   */
  public static ExpectedCondition<Boolean> or(final ExpectedCondition<?>... conditions) {
    return new ExpectedCondition<>() {
      @Nullable final Object[] results = new Object[conditions.length];

      @Override
      public Boolean apply(WebDriver driver) {
        for (int i = 0; i != conditions.length; ++i) {
          ExpectedCondition<?> condition = conditions[i];
          results[i] = null;
          try {
            Object result = condition.apply(driver);
            if (Boolean.TRUE.equals(result) || result != null && !(result instanceof Boolean)) {
              return true;
            }
            results[i] = result;
          } catch (RuntimeException e) {
            results[i] = e;
          }
        }
        return false;
      }

      @Override
      public String toString() {
        StringBuilder message =
            new StringBuilder("at least one condition to be valid:").append(lineSeparator());
        for (int i = 0; i < conditions.length; i++) {
          message
              .append(i + 1)
              .append(". ")
              .append(conditions[i])
              .append(resultAsString(results[i]))
              .append(lineSeparator());
        }
        return message.toString();
      }

      private Object resultAsString(@Nullable Object result) {
        return Boolean.FALSE.equals(result)
            ? ""
            : result instanceof WebDriverException
                ? " (caused by: " + shortDescription((WebDriverException) result) + ")"
                : " (actual: " + result + ")";
      }
    };
  }

  /**
   * An expectation with the logical and condition of the given list of conditions.
   *
   * <p>Each condition is checked until all of them return true or not null
   *
   * @param conditions ExpectedCondition is a list of alternative conditions
   * @return true once all conditions are satisfied
   */
  public static ExpectedCondition<Boolean> and(final ExpectedCondition<?>... conditions) {
    return new ExpectedCondition<>() {
      private @Nullable ExpectedCondition<?> failedCondition;
      private int failedConditionIndex = -1;

      @Override
      public Boolean apply(WebDriver driver) {
        failedConditionIndex = -1;
        failedCondition = null;

        for (int i = 0; i < conditions.length; i++) {
          ExpectedCondition<?> condition = conditions[i];
          Object result = condition.apply(driver);

          if (result == null || Boolean.FALSE.equals(result)) {
            failedConditionIndex = i;
            failedCondition = condition;
            return false;
          }
        }
        return true;
      }

      @Override
      public String toString() {
        return String.format(
            "all conditions to be valid, but condition #%s failed:%nExpected %s",
            failedConditionIndex, failedCondition);
      }
    };
  }

  /**
   * An expectation to check if js executable.
   *
   * <p>Useful when you know that there should be a JavaScript value or something at the stage.
   *
   * @param javaScript used as executable script
   * @return true once JavaScript executed without errors
   */
  public static ExpectedCondition<Boolean> javaScriptThrowsNoExceptions(final String javaScript) {
    return new ExpectedCondition<>() {
      private @Nullable WebDriverException error;

      @Override
      public Boolean apply(WebDriver driver) {
        error = null;
        try {
          ((JavascriptExecutor) driver).executeScript(javaScript);
          return true;
        } catch (JavascriptException jsError) {
          error = jsError;
          return false;
        } catch (WebDriverException unexpectedException) {
          error = unexpectedException;
          LOG.log(
              Level.WARNING,
              String.format("Failed to execute JavaScript `%s`", javaScript),
              unexpectedException);
          return false;
        }
      }

      @Override
      public String toString() {
        return String.format(
            "JS code `%s` to be executable, but... %s", javaScript, shortDescription(error));
      }
    };
  }

  /**
   * An expectation for String value from JavaScript
   *
   * @param javaScript as executable js line
   * @return object once JavaScript executes without errors
   */
  public static ExpectedCondition<@Nullable Object> jsReturnsValue(final String javaScript) {
    return new ExpectedCondition<>() {
      private @Nullable WebDriverException error;

      @Override
      public @Nullable Object apply(WebDriver driver) {
        error = null;
        try {
          Object value = ((JavascriptExecutor) driver).executeScript(javaScript);

          if (value instanceof Collection<?>) {
            return ((Collection<?>) value).isEmpty() ? null : value;
          }
          if (value instanceof String) {
            return ((String) value).isEmpty() ? null : value;
          }

          return value;
        } catch (JavascriptException jsError) {
          error = jsError;
          return null;
        } catch (WebDriverException unexpectedException) {
          error = unexpectedException;
          LOG.log(
              Level.WARNING,
              String.format("Failed to execute JavaScript `%s`", javaScript),
              unexpectedException);
          return null;
        }
      }

      @Override
      public String toString() {
        return String.format(
            "JS code `%s` to return a value, but... %s", javaScript, shortDescription(error));
      }
    };
  }

  private static String shortDescription(@Nullable Exception exception) {
    if (exception == null) return "";
    String message = requireNonNullElse(exception.getMessage(), "null");
    return exception.getClass().getName() + ": " + message.split("\\n", 2)[0];
  }
}
