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

import com.google.common.base.Joiner;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Canned {@link ExpectedCondition}s which are generally useful within webdriver tests.
 */
public class ExpectedConditions {

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
    return new ExpectedCondition<Boolean>() {
      private String currentTitle = "";

      @Override
      public Boolean apply(WebDriver driver) {
        currentTitle = driver.getTitle();
        return title.equals(currentTitle);
      }

      @Override
      public String toString() {
        return String.format("title to be \"%s\". Current title: \"%s\"", title, currentTitle);
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
    return new ExpectedCondition<Boolean>() {
      private String currentTitle = "";

      @Override
      public Boolean apply(WebDriver driver) {
        currentTitle = driver.getTitle();
        return currentTitle != null && currentTitle.contains(title);
      }

      @Override
      public String toString() {
        return String.format("title to contain \"%s\". Current title: \"%s\"", title, currentTitle);
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
    return new ExpectedCondition<Boolean>() {
      private String currentUrl = "";

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
    return new ExpectedCondition<Boolean>() {
      private String currentUrl = "";

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
    return new ExpectedCondition<Boolean>() {
      private final Pattern pattern = Pattern.compile(regex);
      private String currentUrl;

      @Override
      public Boolean apply(WebDriver driver) {
        currentUrl = driver.getCurrentUrl();
        return pattern.matcher(currentUrl).find();
      }

      @Override
      public String toString() {
        return String
          .format("url to match the regex \"%s\". Current url: \"%s\"", regex, currentUrl);
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
  public static ExpectedCondition<WebElement> presenceOfElementLocated(final By locator) {
    return new ExpectedCondition<WebElement>() {
      @Override
      public WebElement apply(WebDriver driver) {
        return driver.findElement(locator);
      }

      @Override
      public String toString() {
        return "presence of element located by: " + locator;
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
    return new ExpectedCondition<WebElement>() {
      @Override
      public WebElement apply(WebDriver driver) {
        try {
          return elementIfVisible(driver.findElement(locator));
        } catch (StaleElementReferenceException | NoSuchElementException e) {
          // Returns null because the element is no longer or not present in DOM.
          return null;
        }
      }

      @Override
      public String toString() {
        return "visibility of element located by " + locator;
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
  public static ExpectedCondition<List<WebElement>> visibilityOfAllElementsLocatedBy(
    final By locator) {
    return new ExpectedCondition<List<WebElement>>() {
      @Override
      public List<WebElement> apply(WebDriver driver) {
        List<WebElement> elements = driver.findElements(locator);
        for (WebElement element : elements) {
          if (!element.isDisplayed()) {
            return null;
          }
        }
        return elements.size() > 0 ? elements : null;
      }

      @Override
      public String toString() {
        return "visibility of all elements located by " + locator;
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
  public static ExpectedCondition<List<WebElement>> visibilityOfAllElements(
    final WebElement... elements) {
    return visibilityOfAllElements(Arrays.asList(elements));
  }

  /**
   * An expectation for checking that all elements present on the web page that match the locator
   * are visible. Visibility means that the elements are not only displayed but also have a height
   * and width that is greater than 0.
   *
   * @param elements list of WebElements
   * @return the list of WebElements once they are located
   */
  public static ExpectedCondition<List<WebElement>> visibilityOfAllElements(
    final List<WebElement> elements) {
    return new ExpectedCondition<List<WebElement>>() {
      @Override
      public List<WebElement> apply(WebDriver driver) {
        for (WebElement element : elements) {
          if (!element.isDisplayed()) {
            return null;
          }
        }
        return elements.size() > 0 ? elements : null;
      }

      @Override
      public String toString() {
        return "visibility of all " + elements;
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
  public static ExpectedCondition<WebElement> visibilityOf(final WebElement element) {
    return new ExpectedCondition<WebElement>() {
      @Override
      public WebElement apply(WebDriver driver) {
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
  private static WebElement elementIfVisible(WebElement element) {
    return element.isDisplayed() ? element : null;
  }

  /**
   * An expectation for checking that there is at least one element present on a web page.
   *
   * @param locator used to find the element
   * @return the list of WebElements once they are located
   */
  public static ExpectedCondition<List<WebElement>> presenceOfAllElementsLocatedBy(
    final By locator) {
    return new ExpectedCondition<List<WebElement>>() {
      @Override
      public List<WebElement> apply(WebDriver driver) {
        List<WebElement> elements = driver.findElements(locator);
        return elements.size() > 0 ? elements : null;
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
   * @param text    to be present in the element
   * @return true once the element contains the given text
   */
  public static ExpectedCondition<Boolean> textToBePresentInElement(final WebElement element,
                                                                    final String text) {

    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        try {
          String elementText = element.getText();
          return elementText.contains(text);
        } catch (StaleElementReferenceException e) {
          return false;
        }
      }

      @Override
      public String toString() {
        return String.format("text ('%s') to be present in element %s", text, element);
      }
    };
  }

  /**
   * An expectation for checking if the given text is present in the element that matches the given
   * locator.
   *
   * @param locator used to find the element
   * @param text    to be present in the element found by the locator
   * @return true once the first element located by locator contains the given text
   */
  public static ExpectedCondition<Boolean> textToBePresentInElementLocated(final By locator,
                                                                           final String text) {

    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        try {
          String elementText = driver.findElement(locator).getText();
          return elementText.contains(text);
        } catch (StaleElementReferenceException e) {
          return false;
        }
      }

      @Override
      public String toString() {
        return String.format("text ('%s') to be present in element found by %s",
                             text, locator);
      }
    };
  }

  /**
   * An expectation for checking if the given text is present in the specified elements value
   * attribute.
   *
   * @param element the WebElement
   * @param text    to be present in the element's value attribute
   * @return true once the element's value attribute contains the given text
   */
  public static ExpectedCondition<Boolean> textToBePresentInElementValue(final WebElement element,
                                                                         final String text) {

    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        try {
          String elementText = element.getAttribute("value");
          if (elementText != null) {
            return elementText.contains(text);
          }
          return false;
        } catch (StaleElementReferenceException e) {
          return false;
        }
      }

      @Override
      public String toString() {
        return String.format("text ('%s') to be the value of element %s", text, element);
      }
    };
  }

  /**
   * An expectation for checking if the given text is present in the specified elements value
   * attribute.
   *
   * @param locator used to find the element
   * @param text    to be present in the value attribute of the element found by the locator
   * @return true once the value attribute of the first element located by locator contains the
   * given text
   */
  public static ExpectedCondition<Boolean> textToBePresentInElementValue(final By locator,
                                                                         final String text) {

    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        try {
          String elementText = driver.findElement(locator).getAttribute("value");
          if (elementText != null) {
            return elementText.contains(text);
          }
          return false;
        } catch (StaleElementReferenceException e) {
          return false;
        }
      }

      @Override
      public String toString() {
        return String.format("text ('%s') to be the value of element located by %s",
                             text, locator);
      }
    };
  }

  /**
   * An expectation for checking whether the given frame is available to switch to. <p> If the frame
   * is available it switches the given driver to the specified frame.
   *
   * @param frameLocator used to find the frame (id or name)
   * @return WebDriver instance after frame has been switched
   */
  public static ExpectedCondition<WebDriver> frameToBeAvailableAndSwitchToIt(
    final String frameLocator) {
    return new ExpectedCondition<WebDriver>() {
      @Override
      public WebDriver apply(WebDriver driver) {
        try {
          return driver.switchTo().frame(frameLocator);
        } catch (NoSuchFrameException e) {
          return null;
        }
      }

      @Override
      public String toString() {
        return "frame to be available: " + frameLocator;
      }
    };
  }

  /**
   * An expectation for checking whether the given frame is available to switch to. <p> If the frame
   * is available it switches the given driver to the specified frame.
   *
   * @param locator used to find the frame
   * @return WebDriver instance after frame has been switched
   */
  public static ExpectedCondition<WebDriver> frameToBeAvailableAndSwitchToIt(final By locator) {
    return new ExpectedCondition<WebDriver>() {
      @Override
      public WebDriver apply(WebDriver driver) {
        try {
          return driver.switchTo().frame(driver.findElement(locator));
        } catch (NoSuchFrameException e) {
          return null;
        }
      }

      @Override
      public String toString() {
        return "frame to be available: " + locator;
      }
    };
  }

  /**
   * An expectation for checking whether the given frame is available to switch to. <p> If the frame
   * is available it switches the given driver to the specified frameIndex.
   *
   * @param frameLocator used to find the frame (index)
   * @return WebDriver instance after frame has been switched
   */
  public static ExpectedCondition<WebDriver> frameToBeAvailableAndSwitchToIt(
    final int frameLocator) {
    return new ExpectedCondition<WebDriver>() {
      @Override
      public WebDriver apply(WebDriver driver) {
        try {
          return driver.switchTo().frame(frameLocator);
        } catch (NoSuchFrameException e) {
          return null;
        }
      }

      @Override
      public String toString() {
        return "frame to be available: " + frameLocator;
      }
    };
  }

  /**
   * An expectation for checking whether the given frame is available to switch to. <p> If the frame
   * is available it switches the given driver to the specified webelement.
   *
   * @param frameLocator used to find the frame (webelement)
   * @return WebDriver instance after frame has been switched
   */
  public static ExpectedCondition<WebDriver> frameToBeAvailableAndSwitchToIt(
    final WebElement frameLocator) {
    return new ExpectedCondition<WebDriver>() {
      @Override
      public WebDriver apply(WebDriver driver) {
        try {
          return driver.switchTo().frame(frameLocator);
        } catch (NoSuchFrameException e) {
          return null;
        }
      }

      @Override
      public String toString() {
        return "frame to be available: " + frameLocator;
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
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        try {
          return !(driver.findElement(locator).isDisplayed());
        } catch (NoSuchElementException | StaleElementReferenceException e) {
          // Returns true because the element is not present in DOM. The
          // try block checks if the element is present but is invisible.
          return true;
        }

      }

      @Override
      public String toString() {
        return "element to no longer be visible: " + locator;
      }
    };
  }

  /**
   * An expectation for checking that an element with text is either invisible or not present on the
   * DOM.
   *
   * @param locator used to find the element
   * @param text    of the element
   * @return true if no such element, stale element or displayed text not equal that provided
   */
  public static ExpectedCondition<Boolean> invisibilityOfElementWithText(final By locator,
                                                                         final String text) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        try {
          return !driver.findElement(locator).getText().equals(text);
        } catch (NoSuchElementException e) {
          // Returns true because the element with text is not present in DOM. The
          // try block checks if the element is present but is invisible.
          return true;
        } catch (StaleElementReferenceException e) {
          // Returns true because stale element reference implies that element
          // is no longer visible.
          return true;
        }
      }


      @Override
      public String toString() {
        return String.format("element containing '%s' to no longer be visible: %s",
                             text, locator);
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
    return new ExpectedCondition<WebElement>() {
      @Override
      public WebElement apply(WebDriver driver) {
        WebElement element = visibilityOfElementLocated(locator).apply(driver);
        try {
          if (element != null && element.isEnabled()) {
            return element;
          }
          return null;
        } catch (StaleElementReferenceException e) {
          return null;
        }
      }

      @Override
      public String toString() {
        return "element to be clickable: " + locator;
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
    return new ExpectedCondition<WebElement>() {

      @Override
      public WebElement apply(WebDriver driver) {
        WebElement visibleElement = visibilityOf(element).apply(driver);
        try {
          if (visibleElement != null && visibleElement.isEnabled()) {
            return visibleElement;
          }
          return null;
        } catch (StaleElementReferenceException e) {
          return null;
        }
      }

      @Override
      public String toString() {
        return "element to be clickable: " + element;
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
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver ignored) {
        try {
          // Calling any method forces a staleness check
          element.isEnabled();
          return false;
        } catch (StaleElementReferenceException expected) {
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
   * This works around the problem of conditions which have two parts: find an element and then
   * check for some condition on it. For these conditions it is possible that an element is located
   * and then subsequently it is redrawn on the client. When this happens a {@link
   * StaleElementReferenceException} is thrown when the second part of the condition is checked.
   *
   * @param condition ExpectedCondition to wrap
   * @param <T>       return type of the condition provided
   * @return the result of the provided condition
   */
  public static <T> ExpectedCondition<T> refreshed(final ExpectedCondition<T> condition) {
    return new ExpectedCondition<T>() {
      @Override
      public T apply(WebDriver driver) {
        try {
          return condition.apply(driver);
        } catch (StaleElementReferenceException e) {
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
   * @param element  WebElement to be selected
   * @param selected boolean state of the selection state of the element
   * @return true once the element's selection stated is that of selected
   */
  public static ExpectedCondition<Boolean> elementSelectionStateToBe(final WebElement element,
                                                                     final boolean selected) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        return element.isSelected() == selected;
      }

      @Override
      public String toString() {
        return String.format("element (%s) to %sbe selected", element, (selected ? "" : "not "));
      }
    };
  }

  public static ExpectedCondition<Boolean> elementToBeSelected(final By locator) {
    return elementSelectionStateToBe(locator, true);
  }

  public static ExpectedCondition<Boolean> elementSelectionStateToBe(final By locator,
                                                                     final boolean selected) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        try {
          WebElement element = driver.findElement(locator);
          return element.isSelected() == selected;
        } catch (StaleElementReferenceException e) {
          return false;
        }
      }

      @Override
      public String toString() {
        return String.format("element found by %s to %sbe selected",
                             locator, (selected ? "" : "not "));
      }
    };
  }

  public static ExpectedCondition<Alert> alertIsPresent() {
    return new ExpectedCondition<Alert>() {
      @Override
      public Alert apply(WebDriver driver) {
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
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        try {
          return driver.getWindowHandles().size() == expectedNumberOfWindows;
        } catch (WebDriverException e) {
          return false;
        }
      }

      @Override
      public String toString() {
        return "number of open windows to be " + expectedNumberOfWindows;
      }
    };
  }

  /**
   * An expectation with the logical opposite condition of the given condition.
   *
   * Note that if the Condition you are inverting throws an exception that is caught by the Ignored
   * Exceptions, the inversion will not take place and lead to confusing results.
   *
   * @param condition ExpectedCondition to be inverted
   * @return true once the condition is satisfied
   */
  public static ExpectedCondition<Boolean> not(final ExpectedCondition<?> condition) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        Object result = condition.apply(driver);
        return result == null || result.equals(Boolean.FALSE);
      }

      @Override
      public String toString() {
        return "condition to not be valid: " + condition;
      }
    };
  }


  /**
   * An expectation for checking WebElement with given locator has attribute with a specific value
   *
   * @param locator   used to find the element
   * @param attribute used to define css or html attribute
   * @param value     used as expected attribute value
   * @return Boolean true when element has css or html attribute with the value
   */
  public static ExpectedCondition<Boolean> attributeToBe(
    final By locator,
    final String attribute,
    final String value) {
    return new ExpectedCondition<Boolean>() {
      private String currentValue = null;

      @Override
      public Boolean apply(WebDriver driver) {
        WebElement element = driver.findElement(locator);
        currentValue = element.getAttribute(attribute);
        if (currentValue == null || currentValue.isEmpty()) {
          currentValue = element.getCssValue(attribute);
        }
        return value.equals(currentValue);
      }

      @Override
      public String toString() {
        return String.format("element found by %s to have value \"%s\". Current value: \"%s\"",
                             locator, value, currentValue);
      }
    };
  }

  /**
   * An expectation for checking WebElement with given locator has specific text
   *
   * @param locator used to find the element
   * @param value   used as expected text
   * @return Boolean true when element has text value equal to @value
   */
  public static ExpectedCondition<Boolean> textToBe(final By locator, final String value) {
    return new ExpectedCondition<Boolean>() {
      private String currentValue = null;

      @Override
      public Boolean apply(WebDriver driver) {
        try {
          currentValue = driver.findElement(locator).getText();
          return currentValue.equals(value);
        } catch (Exception e) {
          return false;
        }
      }

      @Override
      public String toString() {
        return String.format("element found by %s to have text \"%s\". Current text: \"%s\"",
                             locator, value, currentValue);
      }
    };
  }

  /**
   * An expectation for checking WebElement with given locator has text with a value as a part of
   * it
   *
   * @param locator used to find the element
   * @param pattern used as expected text matcher pattern
   * @return Boolean true when element has text value containing @value
   */
  public static ExpectedCondition<Boolean> textMatches(final By locator, final Pattern pattern) {
    return new ExpectedCondition<Boolean>() {
      private String currentValue = null;

      @Override
      public Boolean apply(WebDriver driver) {
        try {
          currentValue = driver.findElement(locator).getText();
          return pattern.matcher(currentValue).find();
        } catch (Exception e) {
          return false;
        }
      }

      @Override
      public String toString() {
        return String
          .format("text found by %s to match pattern \"%s\". Current text: \"%s\"",
                  locator, pattern.pattern(), currentValue);
      }
    };
  }

  /**
   * An expectation for checking number of WebElements with given locator being more than defined number
   *
   * @param locator used to find the element
   * @param number  used to define minimum number of elements
   * @return Boolean true when size of elements list is more than defined
   */
  public static ExpectedCondition<List<WebElement>> numberOfElementsToBeMoreThan(final By locator,
                                                                                 final Integer number) {
    return new ExpectedCondition<List<WebElement>>() {
      private Integer currentNumber = 0;

      @Override
      public List<WebElement> apply(WebDriver webDriver) {
        List<WebElement> elements = webDriver.findElements(locator);
        currentNumber = elements.size();
        return currentNumber > number ? elements : null;
      }

      @Override
      public String toString() {
        return String.format("number of elements found by %s to be more than \"%s\". Current number: \"%s\"",
                             locator, number, currentNumber);
      }
    };
  }

  /**
   * An expectation for checking number of WebElements with given locator being less than defined
   * number
   *
   * @param locator used to find the element
   * @param number  used to define maximum number of elements
   * @return Boolean true when size of elements list is less than defined
   */
  public static ExpectedCondition<List<WebElement>> numberOfElementsToBeLessThan(final By locator,
                                                                                 final Integer number) {
    return new ExpectedCondition<List<WebElement>>() {
      private Integer currentNumber = 0;

      @Override
      public List<WebElement> apply(WebDriver webDriver) {
        List<WebElement> elements = webDriver.findElements(locator);
        currentNumber = elements.size();
        return currentNumber < number ? elements : null;
      }

      @Override
      public String toString() {
        return String.format("number of elements found by %s to be less than \"%s\". Current number: \"%s\"",
                             locator, number, currentNumber);
      }
    };
  }

  /**
   * An expectation for checking number of WebElements with given locator
   *
   * @param locator used to find the element
   * @param number  used to define number of elements
   * @return Boolean true when size of elements list is equal to defined
   */
  public static ExpectedCondition<List<WebElement>> numberOfElementsToBe(final By locator,
                                                                         final Integer number) {
    return new ExpectedCondition<List<WebElement>>() {
      private Integer currentNumber = 0;

      @Override
      public List<WebElement> apply(WebDriver webDriver) {
        List<WebElement> elements = webDriver.findElements(locator);
        currentNumber = elements.size();
        return currentNumber.equals(number) ? elements : null;
      }

      @Override
      public String toString() {
        return String
          .format("number of elements found by %s to be \"%s\". Current number: \"%s\"",
                  locator, number, currentNumber);
      }
    };
  }

  /**
   * An expectation for checking given WebElement has DOM property with a specific value
   *
   * @param element   used to check its parameters
   * @param property  property name
   * @param value     used as expected property value
   * @return Boolean true when element has DOM property with the value
   */
  public static ExpectedCondition<Boolean> domPropertyToBe(final WebElement element,
                                                           final String property,
                                                           final String value) {
    return new ExpectedCondition<Boolean>() {
      private String currentValue = null;

      @Override
      public Boolean apply(WebDriver driver) {
        currentValue = element.getDomProperty(property);
        return value.equals(currentValue);
      }

      @Override
      public String toString() {
        return String.format("DOM property '%s' to be '%s'. Current value: '%s'",
                             property, value, currentValue);
      }
    };
  }

  /**
   * An expectation for checking given WebElement has DOM attribute with a specific value
   *
   * @param element   used to check its parameters
   * @param attribute attribute name
   * @param value     used as expected attribute value
   * @return Boolean true when element has DOM attribute with the value
   */
  public static ExpectedCondition<Boolean> domAttributeToBe(final WebElement element,
                                                            final String attribute,
                                                            final String value) {
    return new ExpectedCondition<Boolean>() {
      private String currentValue = null;

      @Override
      public Boolean apply(WebDriver driver) {
        currentValue = element.getDomAttribute(attribute);
        return value.equals(currentValue);
      }

      @Override
      public String toString() {
        return String.format("DOM attribute '%s' to be '%s'. Current value: '%s'",
                             attribute, value, currentValue);
      }
    };
  }

  /**
   * An expectation for checking given WebElement has attribute with a specific value
   *
   * @param element   used to check its parameters
   * @param attribute used to define css or html attribute
   * @param value     used as expected attribute value
   * @return Boolean true when element has css or html attribute with the value
   */
  public static ExpectedCondition<Boolean> attributeToBe(final WebElement element,
                                                         final String attribute,
                                                         final String value) {
    return new ExpectedCondition<Boolean>() {
      private String currentValue = null;

      @Override
      public Boolean apply(WebDriver driver) {
        currentValue = element.getAttribute(attribute);
        if (currentValue == null || currentValue.isEmpty()) {
          currentValue = element.getCssValue(attribute);
        }
        return value.equals(currentValue);
      }

      @Override
      public String toString() {
        return String.format("Attribute or property '%s' to be '%s'. Current value: '%s'",
                             attribute, value, currentValue);
      }
    };
  }

  /**
   * An expectation for checking WebElement with given locator has attribute which contains specific
   * value
   *
   * @param element   used to check its parameters
   * @param attribute used to define css or html attribute
   * @param value     used as expected attribute value
   * @return Boolean true when element has css or html attribute which contains the value
   */
  public static ExpectedCondition<Boolean> attributeContains(final WebElement element,
                                                             final String attribute,
                                                             final String value) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        return getAttributeOrCssValue(element, attribute)
          .map(seen -> seen.contains(value))
          .orElse(false);
      }

      @Override
      public String toString() {
        return String.format("value to contain \"%s\".", value);
      }
    };
  }

  /**
   * An expectation for checking WebElement with given locator has attribute which contains specific
   * value
   *
   * @param locator   used to define WebElement to check its parameters
   * @param attribute used to define css or html attribute
   * @param value     used as expected attribute value
   * @return Boolean true when element has css or html attribute which contains the value
   */
  public static ExpectedCondition<Boolean> attributeContains(final By locator,
                                                             final String attribute,
                                                             final String value) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        return getAttributeOrCssValue(driver.findElement(locator), attribute)
          .map(seen -> seen.contains(value))
          .orElse(false);
      }

      @Override
      public String toString() {
        return String.format("value found by %s to contain \"%s\".", locator, value);
      }
    };
  }

  /**
   * An expectation for checking WebElement any non empty value for given attribute
   *
   * @param element   used to check its parameters
   * @param attribute used to define css or html attribute
   * @return Boolean true when element has css or html attribute with non empty value
   */
  public static ExpectedCondition<Boolean> attributeToBeNotEmpty(final WebElement element,
                                                                 final String attribute) {
    return driver -> getAttributeOrCssValue(element, attribute).isPresent();
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
   * An expectation for checking child WebElement as a part of parent element to be visible
   *
   * @param parent used to check parent element. For example table with locator
   *  By.id("fish")
   * @param childLocator used to find the ultimate child element.
   * @return visible nested element
   */
  public static ExpectedCondition<List<WebElement>> visibilityOfNestedElementsLocatedBy(
    final By parent,
    final By childLocator) {
    return new ExpectedCondition<List<WebElement>>() {

      @Override
      public List<WebElement> apply(WebDriver driver) {
        WebElement current = driver.findElement(parent);

        List<WebElement> allChildren = current.findElements(childLocator);
        // The original code only checked the first element. Fair enough.
        if (!allChildren.isEmpty() && allChildren.get(0).isDisplayed()) {
          return allChildren;
        }

        return null;
      }

      @Override
      public String toString() {
        return String.format("visibility of elements located by %s -> %s", parent, childLocator);
      }
    };
  }


  /**
   * An expectation for checking child WebElement as a part of parent element to be visible
   *
   * @param element     used as parent element. For example table with locator By.xpath("//table")
   * @param childLocator used to find child element. For example td By.xpath("./tr/td")
   * @return visible subelement
   */
  public static ExpectedCondition<List<WebElement>> visibilityOfNestedElementsLocatedBy(
    final WebElement element, final By childLocator) {
    return new ExpectedCondition<List<WebElement>>() {

      @Override
      public List<WebElement> apply(WebDriver webDriver) {
        List<WebElement> allChildren = element.findElements(childLocator);
        // The original code only checked the visibility of the first element.
        if (!allChildren.isEmpty() && allChildren.get(0).isDisplayed()) {
          return allChildren;
        }

        return null;
      }

      @Override
      public String toString() {
        return String.format("visibility of element located by %s -> %s", element, childLocator);
      }
    };
  }


  /**
   * An expectation for checking child WebElement as a part of parent element to present
   *
   * @param locator     used to check parent element. For example table with locator
   *                    By.xpath("//table")
   * @param childLocator used to find child element. For example td By.xpath("./tr/td")
   * @return subelement
   */
  public static ExpectedCondition<WebElement> presenceOfNestedElementLocatedBy(
    final By locator, final By childLocator)
  {
    return new ExpectedCondition<WebElement>() {

      @Override
      public WebElement apply(WebDriver webDriver) {
        return webDriver.findElement(locator).findElement(childLocator);
      }

      @Override
      public String toString() {
        return String.format("visibility of element located by %s -> %s", locator, childLocator);
      }
    };
  }

  /**
   * An expectation for checking child WebElement as a part of parent element to be present
   *
   * @param element     used as parent element
   * @param childLocator used to find child element. For example td By.xpath("./tr/td")
   * @return subelement
   */
  public static ExpectedCondition<WebElement> presenceOfNestedElementLocatedBy(
    final WebElement element, final By childLocator)
  {

    return new ExpectedCondition<WebElement>() {

      @Override
      public WebElement apply(WebDriver webDriver) {
        return element.findElement(childLocator);
      }

      @Override
      public String toString() {
        return String.format("visibility of element located by %s", childLocator);
      }
    };
  }

  /**
   * An expectation for checking child WebElement as a part of parent element to present
   *
   * @param parent     used to check parent element. For example table with locator
   *                    By.xpath("//table")
   * @param childLocator used to find child element. For example td By.xpath("./tr/td")
   * @return subelement
   */
  public static ExpectedCondition<List<WebElement>> presenceOfNestedElementsLocatedBy(
    final By parent, final By childLocator)
  {
    return new ExpectedCondition<List<WebElement>>() {

      @Override
      public List<WebElement> apply(WebDriver driver) {
        List<WebElement> allChildren = driver.findElement(parent).findElements(childLocator);

        return allChildren.isEmpty() ? null : allChildren;
      }

      @Override
      public String toString() {
        return String.format("visibility of element located by %s -> %s", parent, childLocator);
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
    return invisibilityOfAllElements(Arrays.asList(elements));
  }

  /**
   * An expectation for checking all elements from given list to be invisible
   *
   * @param elements used to check their invisibility
   * @return Boolean true when all elements are not visible anymore
   */
  public static ExpectedCondition<Boolean> invisibilityOfAllElements(final List<WebElement> elements) {
    return new ExpectedCondition<Boolean>() {

      @Override
      public Boolean apply(WebDriver webDriver) {
        return elements.stream().allMatch(ExpectedConditions::isInvisible);
      }

      @Override
      public String toString() {
        return "invisibility of all elements " + elements;
      }
    };
  }

  /**
   * An expectation for checking the element to be invisible
   *
   * @param element used to check its invisibility
   * @return Boolean true when elements is not visible anymore
   */
  public static ExpectedCondition<Boolean> invisibilityOf(final WebElement element) {
    return new ExpectedCondition<Boolean>() {

      @Override
      public Boolean apply(WebDriver webDriver) {
        return isInvisible(element);
      }

      @Override
      public String toString() {
        return "invisibility of " + element;
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
   * Each condition is checked until at least one of them returns true or not null.
   *
   * @param conditions ExpectedCondition is a list of alternative conditions
   * @return true once one of conditions is satisfied
   */
  public static ExpectedCondition<Boolean> or(final ExpectedCondition<?>... conditions) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        RuntimeException lastException = null;
        for (ExpectedCondition<?> condition : conditions) {
          try {
            Object result = condition.apply(driver);
            if (result != null) {
              if (result instanceof Boolean) {
                if (Boolean.TRUE.equals(result)) {
                  return true;
                }
              } else {
                return true;
              }
            }
          } catch (RuntimeException e) {
            lastException = e;
          }
        }
        if (lastException != null) {
          throw lastException;
        }
        return false;
      }

      @Override
      public String toString() {
        StringBuilder message = new StringBuilder("at least one condition to be valid: ");
        Joiner.on(" || ").appendTo(message, conditions);
        return message.toString();
      }
    };
  }

  /**
   * An expectation with the logical and condition of the given list of conditions.
   *
   * Each condition is checked until all of them return true or not null
   *
   * @param conditions ExpectedCondition is a list of alternative conditions
   * @return true once all conditions are satisfied
   */
  public static ExpectedCondition<Boolean> and(final ExpectedCondition<?>... conditions) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        for (ExpectedCondition<?> condition : conditions) {
          Object result = condition.apply(driver);

          if (result instanceof Boolean) {
            if (Boolean.FALSE.equals(result)) {
              return false;
            }
          }

          if (result == null) {
            return false;
          }
        }
        return true;
      }

      @Override
      public String toString() {
        StringBuilder message = new StringBuilder("all conditions to be valid: ");
        Joiner.on(" && ").appendTo(message, conditions);
        return message.toString();
      }
    };
  }

  /**
   * An expectation to check if js executable.
   *
   * Useful when you know that there should be a Javascript value or something at the stage.
   *
   * @param javaScript used as executable script
   * @return true once javaScript executed without errors
   */
  public static ExpectedCondition<Boolean> javaScriptThrowsNoExceptions(final String javaScript) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        try {
          ((JavascriptExecutor) driver).executeScript(javaScript);
          return true;
        } catch (WebDriverException e) {
          return false;
        }
      }

      @Override
      public String toString() {
        return String.format("js %s to be executable", javaScript);
      }
    };
  }

  /**
   * An expectation for String value from javascript
   *
   * @param javaScript as executable js line
   * @return object once javaScript executes without errors
   */
  public static ExpectedCondition<Object> jsReturnsValue(final String javaScript) {
    return new ExpectedCondition<Object>() {
      @Override
      public Object apply(WebDriver driver) {
        try {
          Object value = ((JavascriptExecutor) driver).executeScript(javaScript);

          if (value instanceof List) {
            return ((List<?>) value).isEmpty() ? null : value;
          }
          if (value instanceof String) {
            return ((String) value).isEmpty() ? null : value;
          }

          return value;
        } catch (WebDriverException e) {
          return null;
        }
      }

      @Override
      public String toString() {
        return String.format("js %s to be executable", javaScript);
      }
    };
  }
}
