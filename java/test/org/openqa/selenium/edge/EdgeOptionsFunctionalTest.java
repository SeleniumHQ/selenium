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

package org.openqa.selenium.edge;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_INSECURE_CERTS;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.time.Duration;
import java.util.Base64;

public class EdgeOptionsFunctionalTest extends JUnit4TestBase {

  private static final String EXT_PATH = "common/extensions/webextensions-selenium-example.crx";

  private WebDriver edgeDriver = null;

  @After
  public void tearDown() {
    if (edgeDriver != null) {
      edgeDriver.quit();
    }
  }

  @Test
  public void canStartChromeWithCustomOptions() {
    EdgeOptions options = new EdgeOptions();
    options.addArguments("user-agent=foo;bar");
    edgeDriver = new WebDriverBuilder().get(options);

    edgeDriver.get(pages.clickJacker);
    Object userAgent = ((JavascriptExecutor) edgeDriver).executeScript("return window.navigator.userAgent");
    assertThat(userAgent).isEqualTo("foo;bar");
  }

  @Test
  public void optionsStayEqualAfterSerialization() {
    EdgeOptions options1 = new EdgeOptions();
    EdgeOptions options2 = new EdgeOptions();
    assertThat(options2).isEqualTo(options1);
    options1.asMap();
    assertThat(options2).isEqualTo(options1);
  }

  @Test
  public void canSetAcceptInsecureCerts() {
    EdgeOptions options = new EdgeOptions();
    options.setAcceptInsecureCerts(true);
    edgeDriver = new WebDriverBuilder().get(options);
    System.out.println(((HasCapabilities) edgeDriver).getCapabilities());

    assertThat(((HasCapabilities) edgeDriver).getCapabilities().getCapability(ACCEPT_INSECURE_CERTS)).isEqualTo(true);
  }

  @Test
  @NotYetImplemented
  public void canAddExtensionFromFile() {
    EdgeOptions options = new EdgeOptions();
    options.addExtensions(InProject.locate(EXT_PATH).toFile());
    edgeDriver = new WebDriverBuilder().get(options);

    edgeDriver.get(pages.echoPage);

    WebElement footerElement = driver.findElement(By.id("webextensions-selenium-example"));

    String footText = footerElement.getText();
    assertThat(footText).isEqualTo("Content injected by webextensions-selenium-example");

  }

  @Test
  @NotYetImplemented
  public void canAddExtensionFromStringEncodedInBase64() throws IOException {
    EdgeOptions options = new EdgeOptions();
    options.addEncodedExtensions(Base64.getEncoder().encodeToString(
        Files.readAllBytes(InProject.locate(EXT_PATH))));
    edgeDriver = new WebDriverBuilder().get(options);

    edgeDriver.get(pages.echoPage);

    WebElement footerElement = driver.findElement(By.id("webextensions-selenium-example"));

    String footText = footerElement.getText();
    assertThat(footText).isEqualTo("Content injected by webextensions-selenium-example");
  }

}
