/*
Copyright 2011-2013 Selenium committers
Copyright 2011-2013 Software Freedom Conservancy.

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

import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Canned {@link ContextExpectedCondition}s which are generally useful within webdriver
 * tests.
 */

public class ContextExpectedConditions {

  private final static Logger log = Logger.getLogger(ExpectedConditions.class.getName());

  private ContextExpectedConditions() {
    // Utility class
  }

  /**
   * An expectation for checking that an element is present on the DOM of a
   * page. This does not necessarily mean that the element is visible.
   *
   * @param locator used to find the element
   * @return the WebElement once it is located
   */
  public static ContextExpectedCondition<WebElement> presenceOfElementLocated(
      final By locator) {
    return new ContextExpectedCondition<WebElement>() {
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
   * An expectation for checking that an element is present on the DOM tree given
   * and visible. Visibility means that the element is not only displayed but
   * also has a height and width that is greater than 0.
   *
   * @param locator used to find the element
   * @return the WebElement once it is located and visible
   */
  public static ContextExpectedCondition<WebElement> visibilityOfElementLocated(
      final By locator) {
    return new ContextExpectedCondition<WebElement>() {
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
   * An expectation for checking that all elements present in the DOM tree given that
   * match the locator are visible. Visibility means that the elements are not
   * only displayed but also have a height and width that is greater than 0.
   *
   * @param locator used to find the element
   * @return the list of WebElements once they are located
   */
  public static ContextExpectedCondition<List<WebElement>> visibilityOfAllElementsLocatedBy(
      final By locator) {
    return new ContextExpectedCondition<List<WebElement>>() {
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
   * An expectation for checking that all elements present under the DOM root that
   * match the locator are visible. Visibility means that the elements are not
   * only displayed but also have a height and width that is greater than 0.
   *
   * @param elements list of WebElements
   * @return the list of WebElements once they are located
   */
  public static ContextExpectedCondition<List<WebElement>> visibilityOfAllElements(
      final List<WebElement> elements) {
    return new ContextExpectedCondition<List<WebElement>>() {
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
   * of the root given, is visible. Visibility means that the element is not only
   * displayed but also has a height and width that is greater than 0.
   *
   * @param element the WebElement
   * @return the (same) WebElement once it is visible
   */
  public static ContextExpectedCondition<WebElement> visibilityOf(
      final WebElement element) {
    return new ContextExpectedCondition<WebElement>() {
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
   * @return the given element if it is visible and has non-zero size, otherwise
   *         null.
   */
  private static WebElement elementIfVisible(WebElement element) {
    return element.isDisplayed() ? element : null;
  }

  /**
   * An expectation for checking that there is at least one element present in the DOM tree
   * given.
   *
   * @param locator used to find the element
   * @return the list of WebElements once they are located
   */
  public static ContextExpectedCondition<List<WebElement>> presenceOfAllElementsLocatedBy(
      final By locator) {
    return new ContextExpectedCondition<List<WebElement>>() {
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
   * An expectation for checking if the given text is present in the specified
   * element.
   */
  public static ContextExpectedCondition<Boolean> textToBePresentInElement(
      final By locator, final String text) {

    return new ContextExpectedCondition<Boolean>() {
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
   */
  public static ContextExpectedCondition<Boolean> textToBePresentInElementValue(
      final By locator, final String text) {

    return new ContextExpectedCondition<Boolean>() {
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
   * An expectation for checking that an element is either invisible or not
   * present on the DOM.
   *
   * @param locator used to find the element
   */
  public static ContextExpectedCondition<Boolean> invisibilityOfElementLocated(
      final By locator) {
    return new ContextExpectedCondition<Boolean>() {
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
  public static ContextExpectedCondition<Boolean> invisibilityOfElementWithText(
      final By locator, final String text) {
    return new ContextExpectedCondition<Boolean>() {
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
   */
  public static ContextExpectedCondition<WebElement> elementToBeClickable(
      final By locator) {
    return new ContextExpectedCondition<WebElement>() {

      public ContextExpectedCondition<WebElement> visibilityOfElementLocated =
          ContextExpectedConditions.visibilityOfElementLocated(locator);

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
   * Wait until an element is no longer attached to the DOM.
   *
   * @param element The element to wait for.
   * @return false is the element is still attached to the DOM, true
   *         otherwise.
   */
  public static ContextExpectedCondition<Boolean> stalenessOf(
      final WebElement element) {
    return new ContextExpectedCondition<Boolean>() {
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
   * An expectation for checking if the given element is selected.
   */
  public static ContextExpectedCondition<Boolean> elementToBeSelected(final WebElement element) {
    return elementSelectionStateToBe(element, true);
  }

  /**
   * An expectation for checking if the given element is selected.
   */
  public static ContextExpectedCondition<Boolean> elementSelectionStateToBe(final WebElement element,
                                                                     final boolean selected) {
    return new ContextExpectedCondition<Boolean>() {
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

  public static ContextExpectedCondition<Boolean> elementToBeSelected(final By locator) {
    return elementSelectionStateToBe(locator, true);
  }

  public static ContextExpectedCondition<Boolean> elementSelectionStateToBe(final By locator,
                                                                     final boolean selected) {
    return new ContextExpectedCondition<Boolean>() {
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

  /**
   * @see GenericConditions#not(com.google.common.base.Function)
   */

  public static ContextExpectedCondition<Boolean> not(ContextExpectedCondition<?> condition) {
    return (ContextExpectedCondition<Boolean>)GenericConditions.not(condition);
  }

  /**
   * @see GenericConditions#refreshed(com.google.common.base.Function)
   */

  public static <T> ContextExpectedCondition<T> refreshed(ContextExpectedCondition<T> condition) {
    return (ContextExpectedCondition<T>)GenericConditions.refreshed(condition);
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
   * @see #findElement(By, SearchContext)
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
