/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy.

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


package org.openqa.selenium.support.ui;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Canned {@link AnticipatedCondition}s which are generally useful within webdriver
 * tests.
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
  public static AnticipatedCondition<Boolean> titleIs(final String title) {
    return new AnticipatedCondition<Boolean>() {
      private String currentTitle = "";

      @Override
      public Boolean apply(SearchContext context) {
        currentTitle = ContextInfo.getDriver(context).getTitle();
        return title.equals(currentTitle);
      }

      @Override
      public String toString() {
        return String.format("title to be \"%s\". Current title: \"%s\"", title, currentTitle);
      }
    };
  }

  /**
   * An expectation for checking that the title contains a case-sensitive
   * substring
   *
   * @param title the fragment of title expected
   * @return true when the title matches, false otherwise
   */
  public static AnticipatedCondition<Boolean> titleContains(final String title) {
    return new AnticipatedCondition<Boolean>() {
      private String currentTitle = "";

      @Override
      public Boolean apply(SearchContext context) {
        currentTitle = ContextInfo.getDriver(context).getTitle();
        return currentTitle != null && currentTitle.contains(title);
      }

      @Override
      public String toString() {
        return String.format("title to contain \"%s\". Current title: \"%s\"", title, currentTitle);
      }
    };
  }

  /**
   * An expectation for checking that an element is present on the DOM of a
   * page. This does not necessarily mean that the element is visible.
   *
   * @param locator used to find the element
   * @return the WebElement once it is located
   */
  public static AnticipatedCondition<WebElement> presenceOfElementLocated(
      final By locator) {
    return new AnticipatedCondition<WebElement>() {
      @Override
      public WebElement apply(SearchContext context) {
        return findElement(locator, context);
      }

      @Override
      public String toString() {
        return "presence of element located by: " + locator;
      }
    };
  }

  /**
   * An expectation for checking that an element is present on the DOM of a page
   * and visible. Visibility means that the element is not only displayed but
   * also has a height and width that is greater than 0.
   *
   * @param locator used to find the element
   * @return the WebElement once it is located and visible
   */
  public static AnticipatedCondition<WebElement> visibilityOfElementLocated(
      final By locator) {
    return new AnticipatedCondition<WebElement>() {
      @Override
      public WebElement apply(SearchContext context) {
        try {
          return elementIfVisible(findElement(locator, context));
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
   * An expectation for checking that all elements present on the web page that
   * match the locator are visible. Visibility means that the elements are not
   * only displayed but also have a height and width that is greater than 0.
   *
   * @param locator used to find the element
   * @return the list of WebElements once they are located
   */
  public static AnticipatedCondition<List<WebElement>> visibilityOfAllElementsLocatedBy(
      final By locator) {
    return new AnticipatedCondition<List<WebElement>>() {
      @Override
      public List<WebElement> apply(SearchContext context) {
        List<WebElement> elements = findElements(locator, context);
        for(WebElement element : elements){
          if(!element.isDisplayed()){
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
   * An expectation for checking that all elements present on the web page that
   * match the locator are visible. Visibility means that the elements are not
   * only displayed but also have a height and width that is greater than 0.
   *
   * @param elements list of WebElements
   * @return the list of WebElements once they are located
   */
  public static AnticipatedCondition<List<WebElement>> visibilityOfAllElements(
      final List<WebElement> elements) {
    return new AnticipatedCondition<List<WebElement>>() {
      @Override
      public List<WebElement> apply(SearchContext context) {
        for(WebElement element : elements){
          if(!element.isDisplayed()){
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
   * An expectation for checking that an element, known to be present on the DOM
   * of a page, is visible. Visibility means that the element is not only
   * displayed but also has a height and width that is greater than 0.
   *
   * @param element the WebElement
   * @return the (same) WebElement once it is visible
   */
  public static AnticipatedCondition<WebElement> visibilityOf(
      final WebElement element) {
    return new AnticipatedCondition<WebElement>() {
      @Override
      public WebElement apply(SearchContext context) {
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
   * An expectation for checking that there is at least one element present on a
   * web page.
   *
   * @param locator used to find the element
   * @return the list of WebElements once they are located
   */
  public static AnticipatedCondition<List<WebElement>> presenceOfAllElementsLocatedBy(
      final By locator) {
    return new AnticipatedCondition<List<WebElement>>() {
      @Override
      public List<WebElement> apply(SearchContext context) {
        List<WebElement> elements = findElements(locator, context);
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
   * @param text to be present in the element
   * @return true once the element contains the given text
   */
  public static AnticipatedCondition<Boolean> textToBePresentInElement(
      final WebElement element, final String text) {

    return new AnticipatedCondition<Boolean>() {
      @Override
      public Boolean apply(SearchContext context) {
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
   * An expectation for checking if the given text is present in the element that matches
   * the given locator.
   *
   * @param locator used to find the element
   * @param text to be present in the element found by the locator
   * @return the WebElement once it is located and visible
   *
   * @deprecated Use {@link #textToBePresentInElementLocated(By, String)} instead
   */
  @Deprecated
  public static AnticipatedCondition<Boolean> textToBePresentInElement(
      final By locator, final String text) {
    return textToBePresentInElementLocated(locator, text);
  }

  /**
   * An expectation for checking if the given text is present in the element that matches
   * the given locator.
   *
   * @param locator used to find the element
   * @param text to be present in the element found by the locator
   * @return true once the first element located by locator contains the given text
   */
  public static AnticipatedCondition<Boolean> textToBePresentInElementLocated(
      final By locator, final String text) {

    return new AnticipatedCondition<Boolean>() {
      @Override
      public Boolean apply(SearchContext context) {
        try {
          String elementText = findElement(locator, context).getText();
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
   * An expectation for checking if the given text is present in the specified
   * elements value attribute.
   *
   * @param element the WebElement
   * @param text to be present in the element's value attribute
   * @return true once the element's value attribute contains the given text
   */
  public static AnticipatedCondition<Boolean> textToBePresentInElementValue(
      final WebElement element, final String text) {

    return new AnticipatedCondition<Boolean>() {
      @Override
      public Boolean apply(SearchContext context) {
        try {
          String elementText = element.getAttribute("value");
          if (elementText != null) {
            return elementText.contains(text);
          } else {
            return false;
          }
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
   * An expectation for checking if the given text is present in the specified
   * elements value attribute.
   *
   * @param locator used to find the element
   * @param text to be present in the value attribute of the element found by the locator
   * @return true once the value attribute of the first element located by locator contains
   * the given text
   */
  public static AnticipatedCondition<Boolean> textToBePresentInElementValue(
      final By locator, final String text) {

    return new AnticipatedCondition<Boolean>() {
      @Override
      public Boolean apply(SearchContext context) {
        try {
          String elementText = findElement(locator, context).getAttribute("value");
          if (elementText != null) {
            return elementText.contains(text);
          } else {
            return false;
          }
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
   * An expectation for checking whether the given frame is available to switch
   * to. <p> If the frame is available it switches the given driver to the
   * specified frame.
   *
   * @param frameLocator used to find the frame (id or name)
   */
  public static AnticipatedCondition<WebDriver> frameToBeAvailableAndSwitchToIt(
      final String frameLocator) {
    return new AnticipatedCondition<WebDriver>() {
      @Override
      public WebDriver apply(SearchContext context) {
        try {
          return ContextInfo.getDriver(context).switchTo().frame(frameLocator);
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
   * An expectation for checking whether the given frame is available to switch
   * to. <p> If the frame is available it switches the given driver to the
   * specified frame.
   *
   * @param locator used to find the frame
   */
  public static AnticipatedCondition<WebDriver> frameToBeAvailableAndSwitchToIt(
      final By locator) {
    return new AnticipatedCondition<WebDriver>() {
      @Override
      public WebDriver apply(SearchContext context) {
        try {
          return ContextInfo.getDriver(context).switchTo().frame(findElement(locator, context));
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
   * An expectation for checking that an element is either invisible or not
   * present on the DOM.
   *
   * @param locator used to find the element
   */
  public static AnticipatedCondition<Boolean> invisibilityOfElementLocated(
      final By locator) {
    return new AnticipatedCondition<Boolean>() {
      @Override
      public Boolean apply(SearchContext context) {
        try {
          return !(findElement(locator, context).isDisplayed());
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
   * An expectation for checking that an element with text is either invisible
   * or not present on the DOM.
   *
   * @param locator used to find the element
   * @param text of the element
   */
  public static AnticipatedCondition<Boolean> invisibilityOfElementWithText(
      final By locator, final String text) {
    return new AnticipatedCondition<Boolean>() {
      @Override
      public Boolean apply(SearchContext context) {
        try {
          return !findElement(locator, context).getText().equals(text);
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
   * An expectation for checking an element is visible and enabled such that you
   * can click it.
   *
   * @param locator used to find the element
   * @return the WebElement once it is located and clickable (visible and enabled)
   */
  public static AnticipatedCondition<WebElement> elementToBeClickable(
      final By locator) {
    return new AnticipatedCondition<WebElement>() {

      public AnticipatedCondition<WebElement> visibilityOfElementLocated =
          ExpectedConditions.visibilityOfElementLocated(locator);

      @Override
      public WebElement apply(SearchContext context) {
        WebElement element = visibilityOfElementLocated.apply(context);
        try {
          if (element != null && element.isEnabled()) {
            return element;
          } else {
            return null;
          }
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
   * An expectation for checking an element is visible and enabled such that you
   * can click it.
   *
   * @param element the WebElement
   * @return the (same) WebElement once it is clickable (visible and enabled)
   */
  public static AnticipatedCondition<WebElement> elementToBeClickable(
      final WebElement element) {
    return new AnticipatedCondition<WebElement>() {

      public AnticipatedCondition<WebElement> visibilityOfElement =
          ExpectedConditions.visibilityOf(element);

      @Override
      public WebElement apply(SearchContext context) {
        WebElement element = visibilityOfElement.apply(context);
        try {
          if (element != null && element.isEnabled()) {
            return element;
          } else {
            return null;
          }
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
   * @return false is the element is still attached to the DOM, true
   *         otherwise.
   */
  public static AnticipatedCondition<Boolean> stalenessOf(
      final WebElement element) {
    return new AnticipatedCondition<Boolean>() {
      @Override
      public Boolean apply(SearchContext ignored) {
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
   * This works around the problem of conditions which have two parts: find an
   * element and then check for some condition on it. For these conditions it is
   * possible that an element is located and then subsequently it is redrawn on
   * the client. When this happens a {@link StaleElementReferenceException} is
   * thrown when the second part of the condition is checked.
   */
  public static <T> AnticipatedCondition<T> refreshed(
      final AnticipatedCondition<T> condition) {
    return new AnticipatedCondition<T>() {
      @Override
      public T apply(SearchContext context) {
        try {
          return condition.apply(context);
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
   */
  public static AnticipatedCondition<Boolean> elementToBeSelected(final WebElement element) {
    return elementSelectionStateToBe(element, true);
  }

  /**
   * An expectation for checking if the given element is selected.
   */
  public static AnticipatedCondition<Boolean> elementSelectionStateToBe(final WebElement element,
                                                                     final boolean selected) {
    return new AnticipatedCondition<Boolean>() {
      @Override
      public Boolean apply(SearchContext context) {
        return element.isSelected() == selected;
      }

      @Override
      public String toString() {
        return String.format("element (%s) to %sbe selected", element, (selected ? "" : "not "));
      }
    };
  }

  public static AnticipatedCondition<Boolean> elementToBeSelected(final By locator) {
    return elementSelectionStateToBe(locator, true);
  }

  public static AnticipatedCondition<Boolean> elementSelectionStateToBe(final By locator,
                                                                     final boolean selected) {
    return new AnticipatedCondition<Boolean>() {
      @Override
      public Boolean apply(SearchContext context) {
        try {
          WebElement element = context.findElement(locator);
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

  public static AnticipatedCondition<Alert> alertIsPresent() {
    return new AnticipatedCondition<Alert>() {
      @Override
      public Alert apply(SearchContext context) {
        try {
          return ContextInfo.getDriver(context).switchTo().alert();
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
   * An expectation with the logical opposite condition of the given condition.
   */
  public static AnticipatedCondition<Boolean> not(final AnticipatedCondition<?> condition) {
    return new AnticipatedCondition<Boolean>() {
      @Override
      public Boolean apply(SearchContext context) {
        Object result = condition.apply(context);
        return result == null || result == Boolean.FALSE;
      }

      @Override
      public String toString() {
        return "condition to not be valid: " + condition;
      }
    };
  }

  /**
   * Looks up an element. Logs and re-throws WebDriverException if thrown. <p/>
   * Method exists to gather data for http://code.google.com/p/selenium/issues/detail?id=1800
   */
  private static WebElement findElement(By by, SearchContext context) {
    try {
      return context.findElement(by);
    } catch (NoSuchElementException e) {
      throw e;
    } catch (WebDriverException e) {
      log.log(Level.WARNING,
          String.format("WebDriverException thrown by findElement(%s)", by), e);
      throw e;
    }
  }

  /**
   * @see #findElement(By, WebDriver)
   */
  private static List<WebElement> findElements(By by, SearchContext context) {
    try {
      return context.findElements(by);
    } catch (WebDriverException e) {
      log.log(Level.WARNING,
          String.format("WebDriverException thrown by findElement(%s)", by), e);
      throw e;
    }
  }
}
