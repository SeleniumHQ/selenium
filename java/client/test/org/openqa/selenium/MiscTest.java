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

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.testing.Driver.ALL;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.SAFARI;

import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

public class MiscTest extends JUnit4TestBase {

  @Test
  public void testShouldReturnTitleOfPageIfSet() {
    driver.get(pages.xhtmlTestPage);
    assertThat(driver.getTitle(), equalTo(("XHTML Test Page")));

    driver.get(pages.simpleTestPage);
    assertThat(driver.getTitle(), equalTo("Hello WebDriver"));
  }

  @Test
  public void testShouldReportTheCurrentUrlCorrectly() {
    driver.get(pages.simpleTestPage);
    assertTrue(pages.simpleTestPage.equalsIgnoreCase(driver.getCurrentUrl()));

    driver.get(pages.javascriptPage);
    assertTrue(pages.javascriptPage.equalsIgnoreCase(driver.getCurrentUrl()));
  }

  @Test
  public void shouldReturnTagName() {
    driver.get(pages.formPage);
    WebElement selectBox = driver.findElement(By.id("cheese"));
    assertThat(selectBox.getTagName().toLowerCase(), is("input"));
  }

  @Test
  public void testShouldReturnTheSourceOfAPage() {
    driver.get(pages.simpleTestPage);

    String source = driver.getPageSource().toLowerCase();

    assertThat(source.contains("<html"), is(true));
    assertThat(source.contains("</html"), is(true));
    assertThat(source.contains("an inline element"), is(true));
    assertThat(source.contains("<p id="), is(true));
    assertThat(source.contains("lotsofspaces"), is(true));
    assertThat(source.contains("with document.write and with document.write again"), is(true));
  }

  @Test
  @Ignore(value = CHROME, reason = "returns XML content formatted for display as HTML document")
  @Ignore(value = SAFARI, reason = "returns XML content formatted for display as HTML document")
  @Ignore(IE)
  public void testShouldBeAbleToGetTheSourceOfAnXmlDocument() {
    driver.get(pages.simpleXmlDocument);
    String source = driver.getPageSource().toLowerCase();
    assertThat(source.replaceAll("\\s", ""), equalTo("<xml><foo><bar>baz</bar></foo></xml>"));
  }


  @Test
  @Ignore(value = ALL, reason = "issue 2282")
  public void testStimulatesStrangeOnloadInteractionInFirefox()
      throws Exception {
    driver.get(pages.documentWrite);

    // If this command succeeds, then all is well.
    driver.findElement(By.xpath("//body"));

    driver.get(pages.simpleTestPage);
    driver.findElement(By.id("links"));
  }

  @Test
  public void testClickingShouldNotTrampleWOrHInGlobalScope() throws Throwable {
    driver.get(appServer.whereIs("globalscope.html"));
    String[] vars = new String[]{"w", "h"};
    for (String var : vars) {
      assertEquals(var, getGlobalVar(driver, var));
    }
    driver.findElement(By.id("toclick")).click();
    for (String var : vars) {
      assertEquals(var, getGlobalVar(driver, var));
    }
  }

  private String getGlobalVar(WebDriver driver, String var) {
    Object val = ((JavascriptExecutor) driver).executeScript("return window." + var + ";");
    return val == null ? "null" : val.toString();
  }

}
