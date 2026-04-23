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

import static java.lang.Integer.parseInt;
import static org.openqa.selenium.support.ui.ExpectedConditions.attributeToBe;

import java.util.Map;
import java.util.Set;
import org.openqa.selenium.support.Colors;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class WaitingConditions {

  private WaitingConditions() {
    // utility class
  }

  private abstract static class ElementTextComparator implements ExpectedCondition<String> {
    private String lastText = "";
    private final WebElement element;
    private final String expectedValue;

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
      return String.format(
          "Element text mismatch: expected: \"%s\", but was: \"%s\"", expectedValue, lastText);
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

  public static ExpectedCondition<String> elementTextToEqual(
      final By locator, final String expectedText) {
    return new ExpectedCondition<>() {
      private String actualText;

      @Override
      public String apply(WebDriver driver) {
        actualText = driver.findElement(locator).getText();
        if (expectedText.equals(actualText)) {
          return actualText;
        }

        return null;
      }

      @Override
      public String toString() {
        return String.format(
            "element found by %s to have text \"%s\", but was: \"%s\"",
            locator, expectedText, actualText);
      }
    };
  }

  public static ExpectedCondition<String> elementTextToContain(
      final By locator, final String expected) {
    return new ExpectedCondition<>() {
      private String actualText;

      @Override
      public String apply(WebDriver driver) {
        actualText = driver.findElement(locator).getText();
        return actualText.contains(expected) ? actualText : null;
      }

      @Override
      public String toString() {
        return String.format(
            "element found by %s to contain text \"%s\", but was: \"%s\"",
            locator, expected, actualText);
      }
    };
  }

  public static ExpectedCondition<String> elementTextToMatch(final By locator, final String regex) {
    return new ExpectedCondition<>() {
      private String actualText;

      @Override
      public String apply(WebDriver driver) {
        actualText = driver.findElement(locator).getText();
        return actualText.matches(regex) ? actualText : null;
      }

      @Override
      public String toString() {
        return String.format(
            "element found by %s to match text \"%s\", but was: \"%s\"",
            locator, regex, actualText);
      }
    };
  }

  public static ExpectedCondition<String> elementValueToEqual(
      final WebElement element, final String expectedValue) {
    return new ExpectedCondition<>() {
      private String lastValue = "";

      @Override
      public String apply(WebDriver ignored) {
        lastValue = element.getAttribute("value");
        return expectedValue.equals(lastValue) ? lastValue : null;
      }

      @Override
      public String toString() {
        return String.format(
            "element value to equal: \"%s\", but was: \"%s\"", expectedValue, lastValue);
      }
    };
  }

  public static ExpectedCondition<String> pageSourceToContain(final String expectedText) {
    return new ExpectedCondition<>() {
      private String actualPageSource;

      @Override
      public String apply(WebDriver driver) {
        actualPageSource = driver.getPageSource();
        return actualPageSource != null && actualPageSource.contains(expectedText)
            ? actualPageSource
            : null;
      }

      @Override
      public String toString() {
        return String.format(
            "page source to contain: \"%s\", but was: \"%s\"", expectedText, actualPageSource);
      }
    };
  }

  public static ExpectedCondition<Point> elementLocationToBe(
      final WebElement element, final Point expectedLocation) {
    return new ExpectedCondition<>() {
      private Point currentLocation;

      @Override
      public Point apply(WebDriver ignored) {
        currentLocation = element.getLocation();
        return currentLocation.equals(expectedLocation) ? expectedLocation : null;
      }

      @Override
      public String toString() {
        return "location to be: " + expectedLocation + ", but was: " + currentLocation;
      }
    };
  }

  public static ExpectedCondition<Set<String>> windowHandleCountToBe(
      final int expectedWindowCount) {
    return new ExpectedCondition<>() {
      private Set<String> windowHandles;

      @Override
      public Set<String> apply(WebDriver driver) {
        windowHandles = driver.getWindowHandles();
        return windowHandles.size() == expectedWindowCount ? windowHandles : null;
      }

      @Override
      public String toString() {
        if (windowHandles == null) {
          return String.format("window count to be: %s", expectedWindowCount);
        }
        return String.format(
            "window count to be: %s, but was: %s (%s)",
            expectedWindowCount, windowHandles.size(), windowHandles);
      }
    };
  }

  public static ExpectedCondition<Set<String>> windowHandleCountToBeGreaterThan(final int count) {
    return driver -> {
      Set<String> handles = driver.getWindowHandles();
      return handles.size() > count ? handles : null;
    };
  }

  public static ExpectedCondition<String> newWindowIsOpened(final Set<String> originalHandles) {
    return driver ->
        driver.getWindowHandles().stream()
            .filter(handle -> !originalHandles.contains(handle))
            .findFirst()
            .orElse(null);
  }

  public static ExpectedCondition<WebDriver> windowToBeSwitchedToWithName(final String windowName) {
    return new ExpectedCondition<>() {

      @Override
      public WebDriver apply(WebDriver driver) {
        return driver.switchTo().window(windowName);
      }

      @Override
      public String toString() {
        return String.format("window with name \"%s\" to exist", windowName);
      }
    };
  }

  public static ExpectedCondition<Boolean> elementToBeInViewport(final WebElement element) {
    return new ExpectedCondition<>() {
      private Map<String, Object> viewportState;

      @Override
      public Boolean apply(WebDriver driver) {
        String script =
            "var e = arguments[0];var rect = e.getBoundingClientRect();var inViewport = rect.top <"
                + " window.innerHeight && rect.bottom > 0  && rect.left < window.innerWidth &&"
                + " rect.right > 0;return {  inViewport: inViewport,  rect: {top: rect.top, bottom:"
                + " rect.bottom, left: rect.left, right: rect.right},  scrollX: window.pageXOffset,"
                + "  scrollY: window.pageYOffset,  viewportWidth: window.innerWidth, "
                + " viewportHeight: window.innerHeight};";

        @SuppressWarnings("unchecked")
        Map<String, Object> result =
            (Map<String, Object>) ((JavascriptExecutor) driver).executeScript(script, element);
        viewportState = result;
        return (Boolean) result.get("inViewport");
      }

      @Override
      public String toString() {
        if (viewportState == null) {
          return "element to be in viewport";
        }
        return String.format(
            "element to be in viewport, but was not. "
                + "Element rect: %s, scrollX: %s, scrollY: %s, "
                + "viewportWidth: %s, viewportHeight: %s",
            viewportState.get("rect"),
            viewportState.get("scrollX"),
            viewportState.get("scrollY"),
            viewportState.get("viewportWidth"),
            viewportState.get("viewportHeight"));
      }
    };
  }

  public static ExpectedCondition<Boolean> fuzzyMatchingOfCoordinates(
      final WebElement element, final int x, final int y) {
    return new ExpectedCondition<>() {
      private static final int ALLOWED_DEVIATION_PIXELS = 10;

      @Override
      public Boolean apply(WebDriver ignored) {
        return fuzzyPositionMatching(x, y, element.getText());
      }

      private boolean fuzzyPositionMatching(int expectedX, int expectedY, String locationTuple) {
        String[] splitString = locationTuple.split("[,\\s]+", 2);
        int gotX = parseInt(splitString[0]);
        int gotY = parseInt(splitString[1]);

        return Math.abs(expectedX - gotX) < ALLOWED_DEVIATION_PIXELS
            && Math.abs(expectedY - gotY) < ALLOWED_DEVIATION_PIXELS;
      }

      @Override
      public String toString() {
        return String.format("Coordinates: (%s, %s), but was: (%s)", x, y, element.getText());
      }
    };
  }

  public static ExpectedCondition<Boolean> color(
      final WebElement element, final String cssPropertyName, final Colors expectedColor) {
    return ExpectedConditions.or(
        attributeToBe(element, cssPropertyName, expectedColor.getColorValue().asRgb()),
        attributeToBe(element, cssPropertyName, expectedColor.getColorValue().asRgba()));
  }
}
