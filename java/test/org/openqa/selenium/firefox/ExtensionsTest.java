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

package org.openqa.selenium.firefox;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.firefox.FirefoxAssumptions.assumeDefaultBrowserLocationUsed;

import java.nio.file.Path;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.testing.JupiterTestBase;

public class ExtensionsTest extends JupiterTestBase {

  private static final String EXT_XPI = "common/extensions/webextensions-selenium-example.xpi";
  private static final String EXT_SIGNED_ZIP =
      "common/extensions/webextensions-selenium-example.zip";
  private static final String EXT_UNSIGNED_ZIP =
      "common/extensions/webextensions-selenium-example-unsigned.zip";
  private static final String EXT_SIGNED_DIR =
      "common/extensions/webextensions-selenium-example-signed";
  private static final String EXT_UNSIGNED_DIR = "common/extensions/webextensions-selenium-example";

  @BeforeEach
  public void checkTestsAreExpectedToRunAndPass() {
    // I can't figure out why this is failing in EngFlow, but XPIs are no
    // longer actively developed (being replaced by Web Extensions), so I
    // think it's okay to skip this test if we're running remotely.
    assumeDefaultBrowserLocationUsed();
  }

  @Test
  void canAddRemoveXpiExtensions() {
    Path extension = InProject.locate(EXT_XPI);

    String id = ((HasExtensions) driver).installExtension(extension);
    assertThat(id).isEqualTo("webextensions-selenium-example-v3@example.com");

    driver.get(pages.blankPage);
    WebElement injected = driver.findElement(By.id("webextensions-selenium-example"));
    assertThat(injected.getText()).isEqualTo("Content injected by webextensions-selenium-example");

    ((HasExtensions) driver).uninstallExtension(id);

    driver.navigate().refresh();
    assertThat(driver.findElements(By.id("webextensions-selenium-example")).size()).isZero();
  }

  @Test
  void canAddRemoveZipUnSignedExtensions() {
    Path extension = InProject.locate(EXT_UNSIGNED_ZIP);

    String id = ((HasExtensions) driver).installExtension(extension, true);
    assertThat(id).isEqualTo("webextensions-selenium-example-v3@example.com");

    driver.get(pages.blankPage);
    WebElement injected = driver.findElement(By.id("webextensions-selenium-example"));
    assertThat(injected.getText()).isEqualTo("Content injected by webextensions-selenium-example");

    ((HasExtensions) driver).uninstallExtension(id);

    driver.navigate().refresh();
    assertThat(driver.findElements(By.id("webextensions-selenium-example")).size()).isZero();
  }

  @Test
  void canAddRemoveZipSignedExtensions() {
    Path extension = InProject.locate(EXT_SIGNED_ZIP);

    String id = ((HasExtensions) driver).installExtension(extension);
    assertThat(id).isEqualTo("webextensions-selenium-example-v3@example.com");

    driver.get(pages.blankPage);
    WebElement injected = driver.findElement(By.id("webextensions-selenium-example"));
    assertThat(injected.getText()).isEqualTo("Content injected by webextensions-selenium-example");

    ((HasExtensions) driver).uninstallExtension(id);

    driver.navigate().refresh();
    assertThat(driver.findElements(By.id("webextensions-selenium-example")).size()).isZero();
  }

  @Test
  void canAddRemoveUnsignedExtensionsDirectory() {
    Path extension = InProject.locate(EXT_UNSIGNED_DIR);

    String id = ((HasExtensions) driver).installExtension(extension, true);
    assertThat(id).isEqualTo("webextensions-selenium-example-v3@example.com");

    driver.get(pages.blankPage);
    WebElement injected = driver.findElement(By.id("webextensions-selenium-example"));
    assertThat(injected.getText()).isEqualTo("Content injected by webextensions-selenium-example");

    ((HasExtensions) driver).uninstallExtension(id);

    driver.navigate().refresh();
    assertThat(driver.findElements(By.id("webextensions-selenium-example")).size()).isZero();
  }

  @Test
  void canAddRemoveSignedExtensionsDirectory() {
    Path extension = InProject.locate(EXT_SIGNED_DIR);

    String id = ((HasExtensions) driver).installExtension(extension);
    assertThat(id).isEqualTo("webextensions-selenium-example-v3@example.com");

    driver.get(pages.blankPage);
    WebElement injected = driver.findElement(By.id("webextensions-selenium-example"));
    assertThat(injected.getText()).isEqualTo("Content injected by webextensions-selenium-example");

    ((HasExtensions) driver).uninstallExtension(id);

    driver.navigate().refresh();
    assertThat(driver.findElements(By.id("webextensions-selenium-example")).size()).isZero();
  }
}
