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

import java.io.IOException;
import java.nio.file.Files;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.webextension.FirefoxWebExtensionOptions;
import org.openqa.selenium.webextension.HasWebExtensions;
import org.openqa.selenium.webextension.WebExtension;

/**
 * Exercises the neutral {@link org.openqa.selenium.webextension.HasWebExtensions} API against
 * Firefox, covering the same archive/directory inputs {@link ExtensionsTest} covers for the
 * deprecated {@link HasExtensions}. The dispatch picks BiDi or the classic {@code /moz/addon}
 * endpoint depending on whether the session negotiated {@code webSocketUrl}.
 *
 * <p>Unlike {@link ExtensionsTest}, this suite carries no {@code
 * assumeDefaultBrowserLocationUsed()} guard: that assumption trips under the hermetic Bazel
 * toolchain on every machine (it always sets {@code webdriver.firefox.bin}), which silently skips
 * every test here rather than only on remote/EngFlow execution as intended.
 */
class WebExtensionsTest extends JupiterTestBase {

  private static final String EXT_XPI = "common/extensions/webextensions-selenium-example.xpi";
  private static final String EXT_SIGNED_ZIP =
      "common/extensions/webextensions-selenium-example.zip";
  private static final String EXT_UNSIGNED_ZIP =
      "common/extensions/webextensions-selenium-example-unsigned.zip";
  private static final String EXT_SIGNED_DIR =
      "common/extensions/webextensions-selenium-example-signed";
  private static final String EXT_UNSIGNED_DIR = "common/extensions/webextensions-selenium-example";
  private static final String EXPECTED_ID = "webextensions-selenium-example-v3@example.com";
  private static final String INJECTED = "Content injected by webextensions-selenium-example";

  private HasWebExtensions extensions() {
    return (HasWebExtensions) driver;
  }

  private void assertInstallInjectsAndUninstallRemoves(WebExtension extension) {
    assertThat(extension.getId()).isEqualTo(EXPECTED_ID);

    driver.get(pages.blankPage);
    WebElement injected = driver.findElement(By.id("webextensions-selenium-example"));
    assertThat(injected.getText()).isEqualTo(INJECTED);

    extensions().uninstallWebExtension(extension);
    driver.navigate().refresh();
    assertThat(driver.findElements(By.id("webextensions-selenium-example"))).isEmpty();
  }

  @Test
  void installsAndUninstallsAnXpiArchive() {
    WebExtension extension = extensions().installWebExtension(InProject.locate(EXT_XPI));
    assertInstallInjectsAndUninstallRemoves(extension);
  }

  @Test
  void installsAndUninstallsASignedZipArchive() {
    WebExtension extension = extensions().installWebExtension(InProject.locate(EXT_SIGNED_ZIP));
    assertInstallInjectsAndUninstallRemoves(extension);
  }

  @Test
  void installsAnUnsignedZipArchiveTemporarily() {
    WebExtension extension =
        extensions()
            .installWebExtension(
                InProject.locate(EXT_UNSIGNED_ZIP),
                new FirefoxWebExtensionOptions().permanent(false));
    assertInstallInjectsAndUninstallRemoves(extension);
  }

  @Test
  void installsAndUninstallsASignedDirectory() {
    WebExtension extension = extensions().installWebExtension(InProject.locate(EXT_SIGNED_DIR));
    assertInstallInjectsAndUninstallRemoves(extension);
  }

  @Test
  void installsAnUnsignedDirectoryTemporarily() {
    WebExtension extension =
        extensions()
            .installWebExtension(
                InProject.locate(EXT_UNSIGNED_DIR),
                new FirefoxWebExtensionOptions().permanent(false));
    assertInstallInjectsAndUninstallRemoves(extension);
  }

  @Test
  void installsAndUninstallsFromABase64String() throws IOException {
    String base64 =
        Base64.getEncoder().encodeToString(Files.readAllBytes(InProject.locate(EXT_XPI)));

    WebExtension extension = extensions().installWebExtension(base64);
    assertInstallInjectsAndUninstallRemoves(extension);
  }
}
