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

package org.openqa.selenium.chrome;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.webextension.HasWebExtensions;
import org.openqa.selenium.webextension.WebExtension;

/**
 * Exercises {@link HasWebExtensions} against Chromium, which installs only unpacked directories
 * over BiDi and only when launched with {@code --enable-unsafe-extension-debugging} and {@code
 * --remote-debugging-pipe}.
 */
class WebExtensionsTest extends JupiterTestBase {

  private static final String EXT_DIR = "common/extensions/webextensions-selenium-example";
  private static final String EXT_CRX = "common/extensions/webextensions-selenium-example.crx";
  private static final String INJECTED = "Content injected by webextensions-selenium-example";

  @AfterAll
  public static void resetBrowser() {
    seleniumExtension.removeDriver();
  }

  @Test
  @NoDriverBeforeTest
  void installsAndUninstallsAnUnpackedDirectory(@TempDir Path tmp) throws IOException {
    localDriver = seleniumExtension.createNewDriver(extensionOptions());
    HasWebExtensions extensions = (HasWebExtensions) localDriver;

    WebExtension extension = extensions.installWebExtension(copyOutOfRunfiles(EXT_DIR, tmp));
    assertThat(extension.getId()).isNotBlank();

    localDriver.get(pages.blankPage);
    assertThat(localDriver.findElement(By.id("webextensions-selenium-example")).getText())
        .isEqualTo(INJECTED);

    extensions.uninstallWebExtension(extension);
    localDriver.navigate().refresh();
    assertThat(localDriver.findElements(By.id("webextensions-selenium-example"))).isEmpty();
  }

  @Test
  @NoDriverBeforeTest
  void rejectsAPackedArchive() {
    localDriver = seleniumExtension.createNewDriver(extensionOptions());

    assertThatThrownBy(
            () -> ((HasWebExtensions) localDriver).installWebExtension(InProject.locate(EXT_CRX)))
        .isInstanceOf(WebDriverException.class);
  }

  // Bazel runfiles are symlinks, and Chrome never answers an install of a symlinked unpacked
  // directory, so hand it a real copy.
  private static Path copyOutOfRunfiles(String relativePath, Path tmp) throws IOException {
    Path source = InProject.locate(relativePath).toRealPath();
    Path target = tmp.resolve(source.getFileName().toString());
    try (Stream<Path> paths = Files.walk(source)) {
      for (Path path : (Iterable<Path>) paths::iterator) {
        Path dest = target.resolve(source.relativize(path).toString());
        if (Files.isDirectory(path)) {
          Files.createDirectories(dest);
        } else {
          Files.copy(path.toRealPath(), dest);
        }
      }
    }
    return target;
  }

  // The shared test options pass disable-extensions, so build Chrome's options from scratch.
  private ChromeOptions extensionOptions() {
    Browser.CHROME.getCapabilities();
    ChromeOptions options = new ChromeOptions();
    String binary = InProject.resolveRunfilesPath(System.getProperty("webdriver.chrome.binary"));
    if (binary != null) {
      options.setBinary(binary);
    }
    if (Boolean.getBoolean("webdriver.headless")) {
      options.addArguments("--headless");
    }
    options.addArguments(
        "--enable-unsafe-extension-debugging",
        "--remote-debugging-pipe",
        "no-sandbox",
        "disable-dev-shm-usage");
    options.enableBiDi();
    return options;
  }
}
