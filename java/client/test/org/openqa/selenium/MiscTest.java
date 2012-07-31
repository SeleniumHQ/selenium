/*
Copyright 2012 Software Freedom Conservancy
Copyright 2007-2012 Selenium committers

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

import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

public class MiscTest extends JUnit4TestBase {

  @Test
  public void testShouldReportTheCurrentUrlCorrectly() {
    driver.get(pages.simpleTestPage);
    assertTrue(pages.simpleTestPage.equalsIgnoreCase(driver.getCurrentUrl()));

    driver.get(pages.javascriptPage);
    assertTrue(pages.javascriptPage.equalsIgnoreCase(driver.getCurrentUrl()));
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
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

  @JavascriptEnabled
  @Ignore(value = {ANDROID, CHROME, IE, SELENESE, SAFARI, OPERA, OPERA_MOBILE},
          reason = "Chrome, Safari: returns XML content formatted for display as HTML document"
                   + "Opera: includes XML doctype"
                   + "Others: untested")
  @Test
  public void testShouldBeAbleToGetTheSourceOfAnXmlDocument() {
    driver.get(pages.simpleXmlDocument);
    String source = driver.getPageSource().toLowerCase();
    assertThat(source.replaceAll("\\s", ""), equalTo("<xml><foo><bar>baz</bar></foo></xml>"));
  }


  @Ignore(issues = {2282})
  @Test
  public void testStimulatesStrangeOnloadInteractionInFirefox()
      throws Exception {
    driver.get(pages.documentWrite);

    // If this command succeeds, then all is well.
    driver.findElement(By.xpath("//body"));

    driver.get(pages.simpleTestPage);
    driver.findElement(By.id("links"));
  }

  @JavascriptEnabled
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