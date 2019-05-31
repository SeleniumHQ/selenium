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
import static org.openqa.selenium.testing.drivers.Browser.EDGE;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.io.IOException;
import java.nio.file.Files;
import java.util.Base64;

public class EdgeOptionsFunctionalTest extends JUnit4TestBase {

  private static final String EXT_PATH = "third_party/chrome_ext/backspace.crx";

  private EdgeDriver edgeDriver = null;

  @After
  public void tearDown() {
    if (edgeDriver != null) {
      edgeDriver.quit();
    }
  }

  @Test
  @Ignore(EDGE)
  public void canStartChromeWithCustomOptions() {
    EdgeOptions options = new EdgeOptions();
    options.addArguments("user-agent=foo;bar");
    edgeDriver = new EdgeDriver(options);

    edgeDriver.get(pages.clickJacker);
    Object userAgent = edgeDriver.executeScript("return window.navigator.userAgent");
    assertThat(userAgent).isEqualTo("foo;bar");
  }

  @Test
  @Ignore(EDGE)
  public void optionsStayEqualAfterSerialization() {
    EdgeOptions options1 = new EdgeOptions();
    EdgeOptions options2 = new EdgeOptions();
    assertThat(options2).isEqualTo(options1);
    options1.asMap();
    assertThat(options2).isEqualTo(options1);
  }

  @Test
  @Ignore(EDGE)
  public void canSetAcceptInsecureCerts() {
    EdgeOptions options = new EdgeOptions();
    options.setAcceptInsecureCerts(true);
    edgeDriver = new EdgeDriver(options);
    System.out.println(edgeDriver.getCapabilities());

    assertThat(edgeDriver.getCapabilities().getCapability(ACCEPT_INSECURE_CERTS)).isEqualTo(true);
  }

  @Test
  @Ignore(EDGE)
  public void canAddExtensionFromFile() {
    EdgeOptions options = new EdgeOptions();
    options.addExtensions(InProject.locate(EXT_PATH).toFile());
    edgeDriver = new EdgeDriver(options);

    edgeDriver.get(pages.clicksPage);

    edgeDriver.findElement(By.id("normal")).click();
    new WebDriverWait(edgeDriver, 10).until(titleIs("XHTML Test Page"));

    edgeDriver.findElement(By.tagName("body")).sendKeys(Keys.BACK_SPACE);
    new WebDriverWait(edgeDriver, 10).until(titleIs("clicks"));
  }

  @Test
  @Ignore(EDGE)
  public void canAddExtensionFromStringEncodedInBase64() throws IOException {
    EdgeOptions options = new EdgeOptions();
    options.addEncodedExtensions(Base64.getEncoder().encodeToString(
        Files.readAllBytes(InProject.locate(EXT_PATH))));
    edgeDriver = new EdgeDriver(options);

    edgeDriver.get(pages.clicksPage);

    edgeDriver.findElement(By.id("normal")).click();
    new WebDriverWait(edgeDriver, 10).until(titleIs("XHTML Test Page"));

    edgeDriver.findElement(By.tagName("body")).sendKeys(Keys.BACK_SPACE);
    new WebDriverWait(edgeDriver, 10).until(titleIs("clicks"));
  }

}
