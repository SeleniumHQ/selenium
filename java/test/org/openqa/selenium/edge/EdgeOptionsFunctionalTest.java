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

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.util.Base64;

public class EdgeOptionsFunctionalTest extends JupiterTestBase {

  private static final String EXT_PATH = "common/extensions/webextensions-selenium-example.crx";

  @Test
  @NoDriverBeforeTest
  public void canStartEdgeWithCustomOptions() {
    EdgeOptions options = new EdgeOptions();
    options.addArguments("user-agent=foo;bar");
    localDriver = new WebDriverBuilder().get(options);

    localDriver.get(pages.clickJacker);
    Object userAgent = ((JavascriptExecutor) localDriver).executeScript("return window.navigator.userAgent");
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
  @NoDriverBeforeTest
  public void canSetAcceptInsecureCerts() {
    EdgeOptions options = new EdgeOptions();
    options.setAcceptInsecureCerts(true);
    localDriver = new WebDriverBuilder().get(options);
    System.out.println(((HasCapabilities) localDriver).getCapabilities());

    assertThat(((HasCapabilities) localDriver).getCapabilities().getCapability(ACCEPT_INSECURE_CERTS)).isEqualTo(true);
  }

  @Test
  @NotYetImplemented
  @NoDriverBeforeTest
  public void canAddExtensionFromFile() {
    EdgeOptions options = new EdgeOptions();
    options.addExtensions(InProject.locate(EXT_PATH).toFile());
    localDriver = new WebDriverBuilder().get(options);

    localDriver.get(pages.echoPage);

    WebElement footerElement = localDriver.findElement(By.id("webextensions-selenium-example"));

    String footText = footerElement.getText();
    assertThat(footText).isEqualTo("Content injected by webextensions-selenium-example");
  }

  @Test
  @NotYetImplemented
  @NoDriverBeforeTest
  public void canAddExtensionFromStringEncodedInBase64() throws IOException {
    EdgeOptions options = new EdgeOptions();
    options.addEncodedExtensions(Base64.getEncoder().encodeToString(
        Files.readAllBytes(InProject.locate(EXT_PATH))));
    localDriver = new WebDriverBuilder().get(options);

    localDriver.get(pages.echoPage);

    WebElement footerElement = localDriver.findElement(By.id("webextensions-selenium-example"));

    String footText = footerElement.getText();
    assertThat(footText).isEqualTo("Content injected by webextensions-selenium-example");
  }
}
