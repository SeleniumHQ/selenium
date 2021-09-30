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

package org.openqa.selenium;

import org.openqa.selenium.support.ui.ExpectedCondition;

import java.util.Set;

public class WaitingConditions {

  private WaitingConditions() {
    // utility class
  }

  private static abstract class ElementTextComparator implements ExpectedCondition<String> {
    private String lastText = "";
    private WebElement element;
    private String expectedValue;

    ElementTextComparator(WebElement element, String expectedValue) {
      this.element = element;
      this.expectedValue = expectedValue;
    }

    @Override
    public String apply(WebDriver ignored) {
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

  public static ExpectedCondition<String> elementTextToEqual(
      final WebElement element, final String value) {
    return new ElementTextComparator(element, value) {

      @Override
      boolean compareText(String expectedValue, String actualValue) {
        return expectedValue.equals(actualValue);
      }
    };
  }

  public static ExpectedCondition<String> elementTextToContain(
      final WebElement element, final String value) {
    return new ElementTextComparator(element, value) {

      @Override
      boolean compareText(String expectedValue, String actualValue) {
        return actualValue.contains(expectedValue);
      }
    };
  }

  public static ExpectedCondition<String> elementTextToEqual(final By locator, final String value) {
    return new ExpectedCondition<String>() {

      @Override
      public String apply(WebDriver driver) {
        String text = driver.findElement(locator).getText();
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

  public static ExpectedCondition<String> elementValueToEqual(
      final WebElement element, final String expectedValue) {
    return new ExpectedCondition<String>() {

      private String lastValue = "";

      @Override
      public String apply(WebDriver ignored) {
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

  public static ExpectedCondition<String> pageSourceToContain(final String expectedText) {
    return new ExpectedCondition<String>() {
      @Override
      public String apply(WebDriver driver) {
        String source = driver.getPageSource();

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

  public static ExpectedCondition<Point> elementLocationToBe(
      final WebElement element, final Point expectedLocation) {
    return new ExpectedCondition<Point>() {
      private Point currentLocation = new Point(0, 0);

      @Override
      public Point apply(WebDriver ignored) {
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

  public static ExpectedCondition<Set<String>> windowHandleCountToBe(final int count) {
    return driver -> {
      Set<String> handles = driver.getWindowHandles();
      return handles.size() == count ? handles : null;
    };
  }

  public static ExpectedCondition<Set<String>> windowHandleCountToBeGreaterThan(final int count) {
    return driver -> {
      Set<String> handles = driver.getWindowHandles();
      return handles.size() > count ? handles : null;
    };
  }

  public static ExpectedCondition<String> newWindowIsOpened(final Set<String> originalHandles) {
    return driver -> driver.getWindowHandles().stream()
        .filter(handle -> ! originalHandles.contains(handle)).findFirst().orElse(null);
  }

  public static ExpectedCondition<WebDriver> windowToBeSwitchedToWithName(final String windowName) {
    return new ExpectedCondition<WebDriver>() {

      @Override
      public WebDriver apply(WebDriver driver) {
        return driver.switchTo().window(windowName);
      }

      @Override
      public String toString() {
        return String.format("window with name %s to exist", windowName);
      }
    };
  }
}
