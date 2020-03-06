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
import static org.junit.Assume.assumeFalse;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;
import static org.openqa.selenium.testing.TestUtilities.getFirefoxVersion;
import static org.openqa.selenium.testing.TestUtilities.isFirefox;
import static org.openqa.selenium.testing.TestUtilities.isOldIe;

import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NotYetImplemented;

public class SvgDocumentTest extends JUnit4TestBase {

  @Test
  @Ignore(value = HTMLUNIT, reason = "test should enable JavaScript")
  @NotYetImplemented(SAFARI)
  public void testClickOnSvgElement() {
    assumeFalse("IE version < 9 doesn't support SVG", isOldIe(driver));
    assumeFalse("Firefox < 21 fails this test", isFirefox(driver) && (getFirefoxVersion(driver) < 21));

    driver.get(pages.svgTestPage);
    WebElement rect = driver.findElement(By.id("rect"));

    assertThat(rect.getAttribute("fill")).isEqualTo("blue");
    rect.click();
    assertThat(rect.getAttribute("fill")).isEqualTo("green");
  }

  @Test
  @Ignore(value = HTMLUNIT, reason="test should enable JavaScript")
  public void testExecuteScriptInSvgDocument() {
    assumeFalse("IE version < 9 doesn't support SVG", isOldIe(driver));

    driver.get(pages.svgTestPage);
    WebElement rect = driver.findElement(By.id("rect"));

    assertThat(rect.getAttribute("fill")).isEqualTo("blue");
    ((JavascriptExecutor) driver).executeScript("document.getElementById('rect').setAttribute('fill', 'yellow');");
    assertThat(rect.getAttribute("fill")).isEqualTo("yellow");
  }

}
