/*
Copyright 2012-2013 Software Freedom Conservancy
Copyright 2010-2013 Selenium committers

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


package org.openqa.selenium;

import org.openqa.selenium.support.ui.AnticipatedCondition;
import org.openqa.selenium.support.ui.ContextInfo;

import java.util.Set;

public class WaitingConditions {

  private WaitingConditions() {
    // utility class
  }

  private static abstract class ElementTextComperator implements AnticipatedCondition<String> {
    private String lastText = "";
    private WebElement element;
    private String expectedValue;
    ElementTextComperator(WebElement element, String expectedValue) {
      this.element = element;
      this.expectedValue = expectedValue;
    }

    public String apply(SearchContext ignored) {
      lastText = element.getText();
      if (compareText(expectedValue, lastText)) {
        return lastText;
      }

      return null;
    }

    abstract boolean compareText(String expectedValue, String actualValue);

    @Override
    public String toString() {
      return "Element text mismatch: expected: " + expectedValue + " but was: '" + lastText + "'";
    }
  }

  public static AnticipatedCondition<String> elementTextToEqual(
      final WebElement element, final String value) {
    return new ElementTextComperator(element, value) {

      @Override
      boolean compareText(String expectedValue, String actualValue) {
        return expectedValue.equals(actualValue);
      }
    };
  }

  public static AnticipatedCondition<String> elementTextToContain(
      final WebElement element, final String value) {
    return new ElementTextComperator(element, value) {

      @Override
      boolean compareText(String expectedValue, String actualValue) {
        return actualValue.contains(expectedValue);
      }
    };
  }

  public static AnticipatedCondition<String> elementTextToEqual(final By locator, final String value) {
    return new AnticipatedCondition<String>() {

      @Override
      public String apply(SearchContext context) {
        String text = context.findElement(locator).getText();
        if (value.equals(text)) {
          return text;
        }

        return null;
      }


      @Override
      public String toString() {
        return "element text did not equal: " + value;
      }
    };
  }

  public static AnticipatedCondition<String> elementValueToEqual(
      final WebElement element, final String expectedValue) {
    return new AnticipatedCondition<String>() {

      private String lastValue = "";

      @Override
      public String apply(SearchContext ignored) {
        lastValue = element.getAttribute("value");
        if (expectedValue.equals(lastValue)) {
          return lastValue;
        }
        return null;
      }

      @Override
      public String toString() {
        return "element value to equal: " + expectedValue + " was: " + lastValue;
      }
    };
  }

  public static AnticipatedCondition<String> pageSourceToContain(final String expectedText) {
    return new AnticipatedCondition<String>() {
      @Override
      public String apply(SearchContext context) {
        String source = ContextInfo.getDriver(context).getPageSource();

        if (source.contains(expectedText)) {
          return source;
        }
        return null;
      }

      @Override
      public String toString() {
        return "Page source to contain: " + expectedText;
      }
    };
  }

  public static AnticipatedCondition<Point> elementLocationToBe(
      final WebElement element, final Point expectedLocation) {
    return new AnticipatedCondition<Point>() {
      private Point currentLocation = new Point(0, 0);

      public Point apply(SearchContext ignored) {
        currentLocation = element.getLocation();
        if (currentLocation.equals(expectedLocation)) {
          return expectedLocation;
        }

        return null;
      }

      @Override
      public String toString() {
        return "location to be: " + expectedLocation + " is: " + currentLocation;
      }
    };
  }

  public static AnticipatedCondition<Set<String>> windowHandleCountToBe(final int count) {
    return new AnticipatedCondition<Set<String>>() {
      public Set<String> apply(SearchContext context) {
        Set<String> handles = ContextInfo.getDriver(context).getWindowHandles();

        if (handles.size() == count) {
          return handles;
        }
        return null;
      }
    };
  }

  public static AnticipatedCondition<Set<String>> windowHandleCountToBeGreaterThan(final int count) {

    return new AnticipatedCondition<Set<String>>() {
      @Override
      public Set<String> apply(SearchContext context) {
        Set<String> handles = ContextInfo.getDriver(context).getWindowHandles();

        if (handles.size() > count) {
          return handles;
        }
        return null;
      }
    };
  }

  public static AnticipatedCondition<String> newWindowIsOpened(final Set<String> originalHandles) {
    return new AnticipatedCondition<String>() {

      @Override
      public String apply(SearchContext context) {
        Set<String> currentWindowHandles = ContextInfo.getDriver(context).getWindowHandles();
        if (currentWindowHandles.size() > originalHandles.size()) {
          currentWindowHandles.removeAll(originalHandles);
          return currentWindowHandles.iterator().next();
        } else {
          return null;
        }
      }
    };
    
  }

  public static AnticipatedCondition<SearchContext> windowToBeSwitchedToWithName(final String windowName) {
    return new AnticipatedCondition<SearchContext>() {

      @Override
      public WebDriver apply(SearchContext context) {
        return ContextInfo.getDriver(context).switchTo().window(windowName);
      }

      @Override
      public String toString() {
        return String.format("window with name %s to exist", windowName);
      }
    };
  }
}
