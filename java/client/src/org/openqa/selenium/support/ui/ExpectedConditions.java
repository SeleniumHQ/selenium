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

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Canned {@link ExpectedCondition}s which are generally useful within webdriver tests.
 */
public class ExpectedConditions {

  private final static Logger log = Logger.getLogger(ExpectedConditions.class.getName());

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
      private String currentUrl;
      private Pattern pattern;
      private Matcher matcher;

      @Override
      public Boolean apply(WebDriver driver) {
        currentUrl = driver.getCurrentUrl();
        pattern = Pattern.compile(regex);
        matcher = pattern.matcher(currentUrl);
        return matcher.find();
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
  public static ExpectedCondition<WebElement> presenceOfElementLocated(
    final By locator) {
    return new ExpectedCondition<WebElement>() {
      @Override
      public WebElement apply(WebDriver driver) {
        return findElement(locator, driver);
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
  public static ExpectedCondition<WebElement> visibilityOfElementLocated(
    final By locator) {
    return new ExpectedCondition<WebElement>() {
      @Override
      public WebElement apply(WebDriver driver) {
        try {
          return elementIfVisible(findElement(locator, driver));
        } catch (StaleElementReferenceException e) {
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
        List<WebElement> elements = findElements(locator, driver);
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
  public static ExpectedCondition<WebElement> visibilityOf(
    final WebElement element) {
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
        List<WebElement> elements = findElements(locator, driver);
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
  public static ExpectedCondition<Boolean> textToBePresentInElement(
    final WebElement element, final String text) {

    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        try {
          String elementText = element.getText();
          return elementText.contains(text);
        } catch (StaleElementReferenceException e) {
          return null;
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
   * @return the WebElement once it is located and visible
   * @deprecated Use {@link #textToBePresentInElementLocated(By, String)} instead
   */
  @Deprecated
  public static ExpectedCondition<Boolean> textToBePresentInElement(
    final By locator, final String text) {
    return textToBePresentInElementLocated(locator, text);
  }

  /**
   * An expectation for checking if the given text is present in the element that matches the given
   * locator.
   *
   * @param locator used to find the element
   * @param text    to be present in the element found by the locator
   * @return true once the first element located by locator contains the given text
   */
  public static ExpectedCondition<Boolean> textToBePresentInElementLocated(
    final By locator, final String text) {

    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        try {
          String elementText = findElement(locator, driver).getText();
          return elementText.contains(text);
        } catch (StaleElementReferenceException e) {
          return null;
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
  public static ExpectedCondition<Boolean> textToBePresentInElementValue(
    final WebElement element, final String text) {

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
          return null;
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
  public static ExpectedCondition<Boolean> textToBePresentInElementValue(
    final By locator, final String text) {

    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        try {
          String elementText = findElement(locator, driver).getAttribute("value");
          if (elementText != null) {
            return elementText.contains(text);
          }
          return false;
        } catch (StaleElementReferenceException e) {
          return null;
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
  public static ExpectedCondition<WebDriver> frameToBeAvailableAndSwitchToIt(
    final By locator) {
    return new ExpectedCondition<WebDriver>() {
      @Override
      public WebDriver apply(WebDriver driver) {
        try {
          return driver.switchTo().frame(findElement(locator, driver));
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
  public static ExpectedCondition<Boolean> invisibilityOfElementLocated(
    final By locator) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        try {
          return !(findElement(locator, driver).isDisplayed());
        } catch (NoSuchElementException e) {
          // Returns true because the element is not present in DOM. The
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
  public static ExpectedCondition<Boolean> invisibilityOfElementWithText(
    final By locator, final String text) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        try {
          return !findElement(locator, driver).getText().equals(text);
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
  public static ExpectedCondition<WebElement> elementToBeClickable(
    final By locator) {
    return new ExpectedCondition<WebElement>() {

      public ExpectedCondition<WebElement> visibilityOfElementLocated =
        ExpectedConditions.visibilityOfElementLocated(locator);

      @Override
      public WebElement apply(WebDriver driver) {
        WebElement element = visibilityOfElementLocated.apply(driver);
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
  public static ExpectedCondition<WebElement> elementToBeClickable(
    final WebElement element) {
    return new ExpectedCondition<WebElement>() {

      public ExpectedCondition<WebElement> visibilityOfElement =
        ExpectedConditions.visibilityOf(element);

      @Override
      public WebElement apply(WebDriver driver) {
        WebElement element = visibilityOfElement.apply(driver);
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
        return "element to be clickable: " + element;
      }
    };
  }

  /**
   * Wait until an element is no longer attached to the DOM.
   *
   * @param element The element to wait for.
   * @return false is the element is still attached to the DOM, true otherwise.
   */
  public static ExpectedCondition<Boolean> stalenessOf(
    final WebElement element) {
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
  public static <T> ExpectedCondition<T> refreshed(
    final ExpectedCondition<T> condition) {
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
          return null;
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

  /**
   * @deprecated please use {@link #numberOfWindowsToBe(int)} instead
   */
  @Deprecated
  public static ExpectedCondition<Boolean> numberOfwindowsToBe(final int expectedNumberOfWindows) {
    return numberOfWindowsToBe(expectedNumberOfWindows);
  }

  public static ExpectedCondition<Boolean> numberOfWindowsToBe(final int expectedNumberOfWindows) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        try {
          return driver.getWindowHandles().size() == expectedNumberOfWindows;
        } catch (WebDriverException e) {
          return null;
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
   * Note that if the Condition your are inverting throws an exception that is caught by the Ignored
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
        return result == null || result == Boolean.FALSE;
      }

      @Override
      public String toString() {
        return "condition to not be valid: " + condition;
      }
    };
  }

  /**
   * Looks up an element. Logs and re-throws WebDriverException if thrown. <p/> Method exists to
   * gather data for http://code.google.com/p/selenium/issues/detail?id=1800
   *
   * @param driver WebDriver
   * @param by     locator
   * @return WebElement found
   */
  private static WebElement findElement(By by, WebDriver driver) {
    try {
      return driver.findElement(by);
    } catch (NoSuchElementException e) {
      throw e;
    } catch (WebDriverException e) {
      log.log(Level.WARNING,
              String.format("WebDriverException thrown by findElement(%s)", by), e);
      throw e;
    }
  }

  /**
   * @param driver WebDriver
   * @param by     locator
   * @return List of WebElements found
   * @see #findElement(By, WebDriver)
   */
  private static List<WebElement> findElements(By by, WebDriver driver) {
    try {
      return driver.findElements(by);
    } catch (WebDriverException e) {
      log.log(Level.WARNING,
              String.format("WebDriverException thrown by findElement(%s)", by), e);
      throw e;
    }
  }


  /**
   * An expectation for checking WebElement with given locator has attribute with a specific value
   *
   * @param locator   used to find the element
   * @param attribute used to define css or html attribute
   * @param value     used as expected attribute value
   * @return Boolean true when element has css or html attribute with the value
   */
  public static ExpectedCondition<Boolean> attributeToBe(final By locator, final String attribute,
                                                         final String value) {
    return new ExpectedCondition<Boolean>() {
      private String currentValue = null;

      @Override
      public Boolean apply(WebDriver driver) {
        WebElement element = driver.findElement(locator);
        currentValue = element.getAttribute(attribute);
        if (currentValue == null||currentValue.isEmpty()) {
          currentValue = element.getCssValue(attribute);
        }
        return value.equals(currentValue);
      }

      @Override
      public String toString() {
        return String.format("value to be \"%s\". Current value: \"%s\"", value, currentValue);
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
        return String.format("text to be \"%s\". Current text: \"%s\"", value, currentValue);
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
          .format("text to match pattern \"%s\". Current text: \"%s\"", pattern.pattern(),
                  currentValue);
      }
    };
  }

  /**
   * An expectation for checking number of WebElements with given locator
   *
   * @param locator used to find the element
   * @param number  user to define exact number of elements
   * @return Boolean true when size of elements list is equal to defined
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
        return String.format("number to be more than \"%s\". Current number: \"%s\"", number,
                             currentNumber);
      }
    };
  }

  /**
   * An expectation for checking number of WebElements with given locator being less than defined
   * number
   *
   * @param locator used to find the element
   * @param number  user to define maximum number of elements
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
        return String.format("number to be less than \"%s\". Current number: \"%s\"", number,
                             currentNumber);
      }
    };
  }

  /**
   * An expectation for checking number of WebElements with given locator
   *
   * @param locator used to find the element
   * @param number  user to define number of elements
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
          .format("number to be \"%s\". Current number: \"%s\"", number, currentNumber);
      }
    };
  }

  /**
   * An expectation for checking given WebElement has attribute with a specific value
   *
   * @param element   used to check it's parameters
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
        return String.format(attribute + " to be \"%s\". Current " + attribute + ": \"%s\"", value,
                             currentValue);
      }
    };
  }

  /**
   * An expectation for checking WebElement with given locator has attribute which contains specific
   * value
   *
   * @param element   used to check it's parameters
   * @param attribute used to define css or html attribute
   * @param value     used as expected attribute value
   * @return Boolean true when element has css or html attribute which contains the value
   */
  public static ExpectedCondition<Boolean> attributeContains(final WebElement element,
                                                             final String attribute,
                                                             final String value) {
    return new ExpectedCondition<Boolean>() {
      private String currentValue = null;

      @Override
      public Boolean apply(WebDriver driver) {
        Boolean contains = false;
        try {
          currentValue = element.getAttribute(attribute);
          if (currentValue == null || currentValue.isEmpty()) {
            currentValue = element.getCssValue(attribute);
          }
          contains = currentValue.contains(value);
        } catch (Exception e) {/**/}
        return contains;
      }

      @Override
      public String toString() {
        return String.format("value to contain \"%s\". Current value: \"%s\"", value, currentValue);
      }
    };
  }

  /**
   * An expectation for checking WebElement with given locator has attribute which contains specific
   * value
   *
   * @param locator   used to define WebElement to check it's parameters
   * @param attribute used to define css or html attribute
   * @param value     used as expected attribute value
   * @return Boolean true when element has css or html attribute which contains the value
   */
  public static ExpectedCondition<Boolean> attributeContains(final By locator,
                                                             final String attribute,
                                                             final String value) {
    return new ExpectedCondition<Boolean>() {
      private String currentValue = null;

      @Override
      public Boolean apply(WebDriver driver) {
        Boolean contains = false;
        try {
          currentValue = driver.findElement(locator).getAttribute(attribute);
          if (currentValue == null || currentValue.isEmpty()) {
            currentValue = driver.findElement(locator).getCssValue(attribute);
          }
          contains = currentValue.contains(value);
        } catch (Exception e) {/**/}
        return contains;
      }

      @Override
      public String toString() {
        return String
          .format("value to contain \"%s\". Current value: \"%s\"", value, currentValue);
      }
    };
  }

  /**
   * An expectation for checking WebElement any non empty value for given attribute
   *
   * @param element   used to check it's parameters
   * @param attribute used to define css or html attribute
   * @return Boolean true when element has css or html attribute with non empty value
   */
  public static ExpectedCondition<Boolean> attributeToBeNotEmpty(final WebElement element,
                                                                 final String attribute) {
    return new ExpectedCondition<Boolean>() {
      private String currentValue = null;

      @Override
      public Boolean apply(WebDriver driver) {
        Boolean hasText = false;
        try {
          currentValue = element.getAttribute(attribute);
          if (currentValue == null || currentValue.isEmpty()) {
            currentValue = element.getCssValue(attribute);
          }
          hasText = !currentValue.isEmpty();
        } catch (Exception e) {/**/}
        return hasText;
      }
    };
  }

  /**
   * An expectation for checking child WebElement as a part of parent element to be visible
   *
   * @param locator     used to check parent element. For example table with locator
   *                    By.xpath("//table")
   * @param sub_locator used to find child element. For example td By.xpath("./tr/td")
   * @return visible nested element
   */
  public static ExpectedCondition<List<WebElement>> visibilityOfNestedElementsLocatedBy(
    final By locator,
    final By sub_locator) {
    return new ExpectedCondition<List<WebElement>>() {

      @Override
      public List<WebElement> apply(WebDriver webDriver) {
        Boolean displayed = false;
        Boolean exists = false;
        try {
          exists = webDriver.findElement(locator).findElements(sub_locator).size() > 0;
          displayed =
            webDriver.findElement(locator).findElement(sub_locator).isDisplayed();
        } catch (Exception e) {
          int i = 0;
        }
        return (exists && displayed) ?
               webDriver.findElement(locator).findElements(sub_locator) :
               null;
      }

      @Override
      public String toString() {
        return "visibility of elements located by " + locator + sub_locator;
      }
    };
  }


  /**
   * An expectation for checking child WebElement as a part of parent element to be visible
   *
   * @param element     used as parent element. For example table with locator By.xpath("//table")
   * @param sub_locator used to find child element. For example td By.xpath("./tr/td")
   * @return visible subelement
   */
  public static ExpectedCondition<List<WebElement>> visibilityOfNestedElementsLocatedBy(
    final WebElement element, final By sub_locator) {
    return new ExpectedCondition<List<WebElement>>() {

      @Override
      public List<WebElement> apply(WebDriver webDriver) {
        Boolean displayed = false;
        Boolean exists = false;
        try {
          exists =
            element.findElements(sub_locator).size()
            > 0; //duplicating search is to avoid dom rebuilding problems
          displayed = element.findElement(sub_locator).isDisplayed();
        } catch (Exception e) {/**/}
        return (exists && displayed) ? element.findElements(sub_locator) : null;
      }

      @Override
      public String toString() {
        return "visibility of element located by " + element + sub_locator;
      }
    };
  }


  /**
   * An expectation for checking child WebElement as a part of parent element to present
   *
   * @param locator     used to check parent element. For example table with locator
   *                    By.xpath("//table")
   * @param sub_locator used to find child element. For example td By.xpath("./tr/td")
   * @return subelement
   */
  public static ExpectedCondition<WebElement> presenceOfNestedElementLocatedBy(final By locator,
                                                                               final By sub_locator) {
    return new ExpectedCondition<WebElement>() {

      @Override
      public WebElement apply(WebDriver webDriver) {
        WebElement element = null;
        try {
          element = webDriver.findElement(locator).findElement(sub_locator);
        } catch (Exception e) {/**/}
        return element;
      }

      @Override
      public String toString() {
        return "visibility of element located by " + locator + sub_locator;
      }
    };
  }

  /**
   * An expectation for checking child WebElement as a part of parent element to be present
   *
   * @param element     used as parent element
   * @param sub_locator used to find child element. For example td By.xpath("./tr/td")
   * @return subelement
   */
  public static ExpectedCondition<WebElement> presenceOfNestedElementLocatedBy(
    final WebElement element, final By sub_locator) {
    return new ExpectedCondition<WebElement>() {

      @Override
      public WebElement apply(WebDriver webDriver) {
        WebElement s_element = null;
        try {
          s_element = element.findElement(sub_locator);
        } catch (Exception e) {/**/}
        return s_element;
      }

      @Override
      public String toString() {
        return "visibility of element located by " + sub_locator;
      }
    };
  }

  /**
   * An expectation for checking child WebElement as a part of parent element to present
   *
   * @param locator     used to check parent element. For example table with locator
   *                    By.xpath("//table")
   * @param sub_locator used to find child element. For example td By.xpath("./tr/td")
   * @return subelement
   */
  public static ExpectedCondition<List<WebElement>> presenceOfNestedElementsLocatedBy(
    final By locator, final By sub_locator) {
    return new ExpectedCondition<List<WebElement>>() {

      @Override
      public List<WebElement> apply(WebDriver webDriver) {
        List<WebElement> elements = null;
        try {
          elements = webDriver.findElement(locator).findElements(sub_locator);
        } catch (Exception e) {/**/}
        if (elements != null && elements.size() > 0) {
          return elements;
        }
        return null;
      }

      @Override
      public String toString() {
        return "visibility of element located by " + locator + sub_locator;
      }
    };
  }

  /**
   * An expectation for checking all elements from given list to be invisible
   *
   * @param elements used to check their invisibility
   * @return Boolean true when all elements are not visible anymore
   */
  public static ExpectedCondition<Boolean> invisibilityOfAllElements(
    final List<WebElement> elements) {
    return new ExpectedCondition<Boolean>() {

      @Override
      public Boolean apply(WebDriver webDriver) {
        for (WebElement element : elements) {
          try {
            if (element.isDisplayed()) {
              return false;
            }
          } catch (Exception e) {/**/}
        }
        return true;
      }

      @Override
      public String toString() {
        return "invisibility of all elements " + elements;
      }
    };
  }

  /**
   * An expectation with the logical or condition of the given list of conditions.
   *
   * Each condition is checked until at leas one of them returns true or not null
   *
   * @param conditions ExpectedCondition is a list of alternative conditions
   * @return true once one of conditions is satisfied
   */
  public static ExpectedCondition<Boolean> or(final ExpectedCondition<?>... conditions) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        for (ExpectedCondition<?> condition : conditions) {
          try {
            Object result = condition.apply(driver);
            if (result != null) {
              if (result instanceof Boolean) {
                if ((Boolean) result) {
                  return Boolean.TRUE;
                }
              } else {
                return Boolean.TRUE;
              }
            }
          } catch (Exception e) {/**/}
        }
        return Boolean.FALSE;
      }

      @Override
      public String toString() {
        String message = "at least one condition to be valid: ";
        for (ExpectedCondition<?> condition : conditions) {
          message += condition.toString();
        }
        return message;
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
          try {
            Object result = condition.apply(driver);
            if (result == null) {
              return Boolean.FALSE;
            } else if (result instanceof Boolean) {
              if (!(Boolean) result) {
                return Boolean.FALSE;
              }
            }
          } catch (Exception e) {
            return Boolean.FALSE;
          }
        }
        return Boolean.TRUE;
      }

      @Override
      public String toString() {
        String message = "all conditions to be valid: ";
        for (ExpectedCondition<?> condition : conditions) {
          message += condition.toString();
        }
        return message;
      }
    };
  }


  /**
   * An expectation to check if js executable
   *
   * Usefull when  you know, that there should be js val or something at the stage
   *
   * @param javaScript used as executable script
   * @return true once javaScript executed without errors
   */
  public static ExpectedCondition<Boolean> javaScriptThrowsNoExceptions(
    final String javaScript) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        try {
          ((JavascriptExecutor) driver).executeScript(javaScript);
          return Boolean.TRUE;
        } catch (Exception e) {
          return Boolean.FALSE;
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
   * @return true once js return string
   */
  public static ExpectedCondition<Object> jsReturnsValue(
    final String javaScript) {
    return new ExpectedCondition<Object>() {
      @Override
      public Object apply(WebDriver driver) {
        Object value = null;
        try {
          value = ((JavascriptExecutor) driver).executeScript(javaScript);
        } catch (Exception e) {/**/}
        if (value == null) {
          return null;
        }
        if (value instanceof List) {
          return ((List) value).isEmpty() ? null : value;
        }
        if (value instanceof String) {
          return ((String) value).isEmpty() ? null : value;
        }
        return value;
      }

      @Override
      public String toString() {
        return String.format("js %s to be executable", javaScript);
      }
    };
  }
}
