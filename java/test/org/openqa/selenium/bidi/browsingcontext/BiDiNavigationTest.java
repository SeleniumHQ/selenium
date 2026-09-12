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

package org.openqa.selenium.bidi.browsingcontext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfElementLocated;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;

import java.net.MalformedURLException;
import java.net.URL;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NotYetImplemented;

class BiDiNavigationTest extends JupiterTestBase {

  @Test
  @NeedsFreshDriver
  void driverGetNavigatesToUrlViaBiDi() {
    String url = appServer.whereIs("formPage.html");
    driver.get(url);
    assertThat(driver.getCurrentUrl()).contains("formPage.html");
    assertThat(driver.getTitle()).isEqualTo("We Leave From Here");
  }

  @Test
  @NeedsFreshDriver
  void driverGetNavigatesToSecondUrlViaBiDi() {
    driver.get(pages.formPage);
    String url = appServer.whereIs("simpleTest.html");
    driver.get(url);
    assertThat(driver.getCurrentUrl()).contains("simpleTest.html");
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(EDGE)
  void navigateToStringUrlViaNavigationTo() {
    String url = appServer.whereIs("formPage.html");
    driver.navigate().to(url);
    assertThat(driver.getCurrentUrl()).contains("formPage.html");
    assertThat(driver.getTitle()).isEqualTo("We Leave From Here");
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(EDGE)
  void navigateToUrlObjectViaNavigationTo() throws MalformedURLException {
    URL url = new URL(appServer.whereIs("formPage.html"));
    driver.navigate().to(url);
    assertThat(driver.getCurrentUrl()).contains("formPage.html");
    assertThat(driver.getTitle()).isEqualTo("We Leave From Here");
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(EDGE)
  void navigateBackTraversesHistory() {
    driver.get(pages.formPage);
    wait.until(visibilityOfElementLocated(By.id("imageButton"))).submit();
    wait.until(titleIs("We Arrive Here"));

    driver.navigate().back();
    wait.until(titleIs("We Leave From Here"));
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(EDGE)
  void navigateForwardTraversesHistory() {
    driver.get(pages.formPage);
    wait.until(visibilityOfElementLocated(By.id("imageButton"))).submit();
    wait.until(titleIs("We Arrive Here"));

    driver.navigate().back();
    wait.until(titleIs("We Leave From Here"));

    driver.navigate().forward();
    wait.until(titleIs("We Arrive Here"));
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(EDGE)
  void refreshReloadsCurrentPage() {
    String url = appServer.whereIs("formPage.html");
    driver.get(url);
    assertThat(driver.getTitle()).isEqualTo("We Leave From Here");

    driver.navigate().refresh();

    assertThat(driver.getCurrentUrl()).contains("formPage.html");
    assertThat(driver.getTitle()).isEqualTo("We Leave From Here");
  }
}
