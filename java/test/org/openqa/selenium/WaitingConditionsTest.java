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

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.openqa.selenium.WaitingConditions.elementLocationToBe;
import static org.openqa.selenium.WaitingConditions.elementTextToContain;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.WaitingConditions.elementTextToMatch;
import static org.openqa.selenium.WaitingConditions.pageSourceToContain;
import static org.openqa.selenium.WaitingConditions.windowHandleCountToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfElementLocated;

import java.time.Duration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.JupiterTestBase;

class WaitingConditionsTest extends JupiterTestBase {

  private final By header = By.tagName("h1");
  private WebDriverWait wait;

  @BeforeEach
  void setUp() {
    wait = new WebDriverWait(driver, Duration.ofMillis(1));
    driver.get(pages.macbethPage);
    shortWait.until(visibilityOfElementLocated(header));
  }

  @Test
  void textEquals() {
    wait.until(elementTextToEqual(header, "The Tragedy of Macbeth"));
  }

  @Test
  void textEquals_errorMessage() {
    assertThatThrownBy(() -> wait.until(elementTextToEqual(header, "WRONG TEXT")))
        .isInstanceOf(TimeoutException.class)
        .hasMessageStartingWith(
            "Expected condition failed: waiting for element found by By.tagName: h1 to have text"
                + " \"WRONG TEXT\", but was: \"The Tragedy of Macbeth\"")
        .hasMessageContaining("(tried for 0.001 seconds with 500 milliseconds interval)")
        .hasMessageContaining("Build info: version:")
        .hasMessageContaining("The Tragedy of Macbeth");
  }

  @Test
  void textContains() {
    wait.until(elementTextToContain(driver.findElement(header), "he Tragedy of"));
    wait.until(elementTextToContain(driver.findElement(header), "The Tragedy"));
    wait.until(elementTextToContain(driver.findElement(header), "of Macbeth"));
  }

  @Test
  void textContains_errorMessage() {
    assertThatThrownBy(() -> wait.until(elementTextToContain(header, "WRONG TEXT")))
        .isInstanceOf(TimeoutException.class)
        .hasMessageStartingWith(
            "Expected condition failed: waiting for element found by By.tagName: h1 to contain text"
                + " \"WRONG TEXT\", but was: \"The Tragedy of Macbeth\"")
        .hasMessageContaining("(tried for 0.001 seconds with 500 milliseconds interval)")
        .hasMessageContaining("Build info: version:")
        .hasMessageContaining("The Tragedy of Macbeth");
  }

  @Test
  void textMatches() {
    wait.until(elementTextToMatch(header, "The Tragedy of Macbeth"));
    wait.until(elementTextToMatch(header, ".+ Tragedy of .+"));
  }

  @Test
  void textMatches_errorMessage() {
    assertThatThrownBy(() -> wait.until(elementTextToMatch(header, "WRONG TEXT")))
        .isInstanceOf(TimeoutException.class)
        .hasMessageStartingWith(
            "Expected condition failed: waiting for element found by By.tagName: h1 to match text"
                + " \"WRONG TEXT\", but was: \"The Tragedy of Macbeth\"")
        .hasMessageContaining("(tried for 0.001 seconds with 500 milliseconds interval)")
        .hasMessageContaining("Build info: version:")
        .hasMessageContaining("The Tragedy of Macbeth");
  }

  @Test
  void pageSource() {
    wait.until(pageSourceToContain("The Tragedy of Macbeth"));
  }

  @Test
  void pageSource_errorMessage() {
    assertThatThrownBy(() -> wait.until(pageSourceToContain("WRONG TEXT")))
        .isInstanceOf(TimeoutException.class)
        .hasMessageStartingWith(
            "Expected condition failed: waiting for page source to contain: \"WRONG TEXT\", but"
                + " was: \"<html>")
        .hasMessageContaining("(tried for 0.001 seconds with 500 milliseconds interval)")
        .hasMessageContaining("Build info: version:")
        .hasMessageContaining("The Tragedy of Macbeth");
  }

  @Test
  void elementLocation() {
    WebElement element = driver.findElement(header);
    wait.until(elementLocationToBe(element, element.getLocation()));
  }

  @Test
  void elementLocation_errorMessage() {
    assertThatThrownBy(
            () ->
                wait.until(elementLocationToBe(driver.findElement(header), new Point(1000, 2000))))
        .isInstanceOf(TimeoutException.class)
        .hasMessageStartingWith(
            "Expected condition failed: waiting for location to be: (1000, 2000), but was: (")
        .hasMessageContaining("(tried for 0.001 seconds with 500 milliseconds interval)");
  }

  @Test
  void windowCount() {
    wait.until(windowHandleCountToBe(driver.getWindowHandles().size()));
  }

  @Test
  void windowCount_errorMessage() {
    assertThatThrownBy(() -> wait.until(windowHandleCountToBe(666)))
        .isInstanceOf(TimeoutException.class)
        .hasMessageStartingWith(
            "Expected condition failed: waiting for window count to be: 666, but was: "
                + driver.getWindowHandles().size())
        .hasMessageContaining("(tried for 0.001 seconds with 500 milliseconds interval)")
        .hasMessageContaining("Build info: version:");
  }
}
