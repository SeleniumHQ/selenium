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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.webextension.HasWebExtensions;
import org.openqa.selenium.webextension.WebExtension;

/**
 * Exercises {@link HasWebExtensions} against Edge, which installs only unpacked directories over
 * BiDi.
 */
class WebExtensionsTest extends JupiterTestBase {

  private static final String EXT_DIR = "common/extensions/webextensions-selenium-example";
  private static final String EXT_CRX = "common/extensions/webextensions-selenium-example.crx";
  private static final String INJECTED = "Content injected by webextensions-selenium-example";

  @Test
  void installsAndUninstallsAnUnpackedDirectory(@TempDir Path tmp) throws IOException {
    HasWebExtensions extensions = (HasWebExtensions) driver;

    WebExtension extension = extensions.installWebExtension(copyOutOfRunfiles(EXT_DIR, tmp));
    assertThat(extension.getId()).isNotBlank();

    driver.get(pages.blankPage);
    // The content script injects asynchronously after the page loads.
    WebElement injected =
        wait.until(presenceOfElementLocated(By.id("webextensions-selenium-example")));
    assertThat(injected.getText()).isEqualTo(INJECTED);

    extensions.uninstallWebExtension(extension);
    driver.navigate().refresh();
    assertStaysAbsent(driver, By.id("webextensions-selenium-example"));
  }

  @Test
  void rejectsAPackedArchive() {
    assertThatThrownBy(
            () -> ((HasWebExtensions) driver).installWebExtension(InProject.locate(EXT_CRX)))
        .isInstanceOf(WebDriverException.class);
  }

  // Bazel runfiles are symlinks, and Chromium never answers an install of a symlinked unpacked
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

  // The content script injects asynchronously after load, so an element missing right after a
  // refresh proves nothing; it has to stay missing for longer than injection takes.
  private static void assertStaysAbsent(WebDriver driver, By locator) {
    assertThatThrownBy(() ->
            new WebDriverWait(driver, Duration.ofSeconds(2))
                .until(presenceOfElementLocated(locator)))
        .isInstanceOf(TimeoutException.class);
  }
}
