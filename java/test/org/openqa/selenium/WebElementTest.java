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
import org.openqa.selenium.testing.JupiterTestBase;

/** Tests for generic WebElement. */
class WebElementTest extends JupiterTestBase {

  @Test
  void testElementImplementsWrapsDriver() {
    driver.get(pages.simpleTestPage);
    WebElement parent = driver.findElement(By.id("containsSomeDiv"));
    assertThat(parent).isInstanceOf(WrapsDriver.class);
  }

  @Test
  void testElementReturnsOriginDriver() {
    driver.get(pages.simpleTestPage);
    WebElement parent = driver.findElement(By.id("containsSomeDiv"));
    assertThat(((WrapsDriver) parent).getWrappedDriver()).isSameAs(driver);
  }
}
