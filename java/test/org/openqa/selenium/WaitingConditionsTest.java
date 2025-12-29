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

import static org.openqa.selenium.WaitingConditions.*;
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
  void textContains() {
    wait.until(elementTextToContain(driver.findElement(header), "he Tragedy of"));
    wait.until(elementTextToContain(driver.findElement(header), "The Tragedy"));
    wait.until(elementTextToContain(driver.findElement(header), "of Macbeth"));
  }

  @Test
  void textMatches() {
    wait.until(elementTextToMatch(header, "The Tragedy of Macbeth"));
    wait.until(elementTextToMatch(header, ".+ Tragedy of .+"));
  }
}
