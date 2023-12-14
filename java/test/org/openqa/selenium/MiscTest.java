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
import static org.openqa.selenium.testing.drivers.Browser.ALL;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;

class MiscTest extends JupiterTestBase {

  @Test
  void testShouldReturnTitleOfPageIfSet() {
    driver.get(pages.xhtmlTestPage);
    assertThat(driver.getTitle()).isEqualTo(("XHTML Test Page"));

    driver.get(pages.simpleTestPage);
    assertThat(driver.getTitle()).isEqualTo("Hello WebDriver");
  }

  @Test
  void testShouldReportTheCurrentUrlCorrectly() {
    driver.get(pages.simpleTestPage);
    assertThat(driver.getCurrentUrl()).isEqualToIgnoringCase(pages.simpleTestPage);

    driver.get(pages.javascriptPage);
    assertThat(driver.getCurrentUrl()).isEqualToIgnoringCase(pages.javascriptPage);
  }

  @Test
  void shouldReturnTagName() {
    driver.get(pages.formPage);
    WebElement selectBox = driver.findElement(By.id("cheese"));
    assertThat(selectBox.getTagName()).isEqualToIgnoringCase("input");
  }

  @Test
  void testShouldReturnTheSourceOfAPage() {
    driver.get(pages.simpleTestPage);

    String source = driver.getPageSource().toLowerCase();

    assertThat(source)
        .contains(
            "<html",
            "</html",
            "an inline element",
            "<p id=",
            "lotsofspaces",
            "with document.write and with document.write again");
  }

  @Test
  @Ignore(value = CHROME, reason = "returns XML content formatted for display as HTML document")
  @Ignore(value = EDGE, reason = "returns XML content formatted for display as HTML document")
  @NotYetImplemented(
      value = SAFARI,
      reason = "returns XML content formatted for display as HTML document")
  @Ignore(IE)
  public void testShouldBeAbleToGetTheSourceOfAnXmlDocument() {
    driver.get(pages.simpleXmlDocument);
    String source = driver.getPageSource().toLowerCase();
    assertThat(source).isEqualToIgnoringWhitespace("<xml><foo><bar>baz</bar></foo></xml>");
  }

  @Test
  @Ignore(value = ALL, reason = "issue 2282")
  public void testStimulatesStrangeOnloadInteractionInFirefox() {
    driver.get(pages.documentWrite);

    // If this command succeeds, then all is well.
    driver.findElement(By.xpath("//body"));

    driver.get(pages.simpleTestPage);
    driver.findElement(By.id("links"));
  }

  @Test
  void testClickingShouldNotTrampleWOrHInGlobalScope() {
    driver.get(appServer.whereIs("globalscope.html"));
    String[] vars = new String[] {"w", "h"};
    for (String var : vars) {
      assertThat(getGlobalVar(driver, var)).isEqualTo(var);
    }
    driver.findElement(By.id("toclick")).click();
    for (String var : vars) {
      assertThat(getGlobalVar(driver, var)).isEqualTo(var);
    }
  }

  private String getGlobalVar(WebDriver driver, String var) {
    Object val = ((JavascriptExecutor) driver).executeScript("return window." + var + ";");
    return val == null ? "null" : val.toString();
  }
}
