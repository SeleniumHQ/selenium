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

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.Color;
import org.openqa.selenium.testing.JupiterTestBase;

public class CssValueTest extends JupiterTestBase {

  @Test
  public void testShouldPickUpStyleOfAnElement() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("green-parent"));
    Color backgroundColour = Color.fromString(element.getCssValue("background-color"));

    assertThat(backgroundColour).isEqualTo(new Color(0, 128, 0, 1));

    element = driver.findElement(By.id("red-item"));
    backgroundColour = Color.fromString(element.getCssValue("background-color"));

    assertThat(backgroundColour).isEqualTo(new Color(255, 0, 0, 1));
  }

  @Test
  public void testGetCssValueShouldReturnStandardizedColour() {
    driver.get(pages.colorPage);

    WebElement element = driver.findElement(By.id("namedColor"));
    Color backgroundColour = Color.fromString(element.getCssValue("background-color"));
    assertThat(backgroundColour).isEqualTo(new Color(0, 128, 0, 1));

    element = driver.findElement(By.id("rgb"));
    backgroundColour = Color.fromString(element.getCssValue("background-color"));
    assertThat(backgroundColour).isEqualTo(new Color(0, 128, 0, 1));
  }

  @Test
  public void testShouldAllowInheritedStylesToBeUsed() {
    driver.get(pages.javascriptPage);

    WebElement element = driver.findElement(By.id("green-item"));
    String backgroundColour = element.getCssValue("background-color");

    // TODO: How should this be standardized? Should it be standardized?
    assertThat(backgroundColour).isIn("transparent", "rgba(0, 0, 0, 0)");
  }

}
