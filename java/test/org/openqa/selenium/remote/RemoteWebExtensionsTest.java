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

package org.openqa.selenium.remote;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.openqa.selenium.remote.WebDriverFixture.echoCapabilities;
import static org.openqa.selenium.remote.WebDriverFixture.valueResponder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.InvalidArgumentException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.webextension.FirefoxWebExtensionOptions;
import org.openqa.selenium.webextension.WebExtension;

class RemoteWebExtensionsTest {

  private static final ImmutableCapabilities FIREFOX =
      new ImmutableCapabilities("browserName", "firefox");
  private static final ImmutableCapabilities CHROME =
      new ImmutableCapabilities("browserName", "chrome");

  private static final String BASE64 =
      Base64.getEncoder().encodeToString("an-extension".getBytes());

  @Test
  void firefoxWithoutBiDiInstallsOverTheClassicEndpoint() {
    WebDriverFixture fixture =
        new WebDriverFixture(FIREFOX, echoCapabilities, valueResponder("addon@example.com"));

    WebExtension extension = fixture.driver.installWebExtension(BASE64);

    assertThat(extension.getId()).isEqualTo("addon@example.com");
    fixture.verifyCommands(
        new CommandPayload(DriverCommand.INSTALL_EXTENSION, Map.of("addon", BASE64)));
  }

  @Test
  void firefoxClassicTranslatesPermanentToTemporary() {
    WebDriverFixture fixture =
        new WebDriverFixture(FIREFOX, echoCapabilities, valueResponder("addon@example.com"));

    fixture.driver.installWebExtension(
        BASE64, new FirefoxWebExtensionOptions().permanent(true).allowPrivateBrowsing(true));

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.INSTALL_EXTENSION,
            Map.of("addon", BASE64, "temporary", false, "allowPrivateBrowsing", true)));
  }

  @Test
  void firefoxClassicReadsAnArchiveFromDisk(@TempDir Path dir) throws IOException {
    Path archive = Files.write(dir.resolve("extension.xpi"), "packed".getBytes());
    String expected = Base64.getEncoder().encodeToString("packed".getBytes());
    WebDriverFixture fixture =
        new WebDriverFixture(FIREFOX, echoCapabilities, valueResponder("addon@example.com"));

    fixture.driver.installWebExtension(archive);

    fixture.verifyCommands(
        new CommandPayload(DriverCommand.INSTALL_EXTENSION, Map.of("addon", expected)));
  }

  @Test
  void firefoxWithoutBiDiUninstallsOverTheClassicEndpoint() {
    WebDriverFixture fixture =
        new WebDriverFixture(FIREFOX, echoCapabilities, valueResponder(null));

    fixture.driver.uninstallWebExtension(new WebExtension("addon@example.com"));

    fixture.verifyCommands(
        new CommandPayload(DriverCommand.UNINSTALL_EXTENSION, Map.of("id", "addon@example.com")));
  }

  @Test
  void chromiumWithoutBiDiRaises() {
    WebDriverFixture fixture = new WebDriverFixture(CHROME, echoCapabilities, valueResponder(null));

    assertThatThrownBy(() -> fixture.driver.installWebExtension(BASE64))
        .isInstanceOf(WebDriverException.class)
        .hasMessageContaining("BiDi");
  }

  @Test
  void rejectsFirefoxOptionsOnANonFirefoxSession() {
    WebDriverFixture fixture = new WebDriverFixture(CHROME, echoCapabilities, valueResponder(null));

    assertThatThrownBy(
            () ->
                fixture.driver.installWebExtension(
                    BASE64, new FirefoxWebExtensionOptions().permanent(true)))
        .isInstanceOf(InvalidArgumentException.class)
        .hasMessageContaining("Firefox-only");
  }

  @Test
  void rejectsAPathThatDoesNotExist() {
    WebDriverFixture fixture =
        new WebDriverFixture(FIREFOX, echoCapabilities, valueResponder(null));

    assertThatThrownBy(() -> fixture.driver.installWebExtension(Path.of("no", "such", "extension")))
        .isInstanceOf(InvalidArgumentException.class);
  }

  @Test
  void rejectsInvalidBase64() {
    WebDriverFixture fixture =
        new WebDriverFixture(FIREFOX, echoCapabilities, valueResponder(null));

    assertThatThrownBy(() -> fixture.driver.installWebExtension("not valid base64 !!!"))
        .isInstanceOf(InvalidArgumentException.class);
  }

  @Test
  void classicInstallRejectsANonStringResponseValue() {
    WebDriverFixture fixture =
        new WebDriverFixture(FIREFOX, echoCapabilities, valueResponder(null));

    assertThatThrownBy(() -> fixture.driver.installWebExtension(BASE64))
        .isInstanceOf(WebDriverException.class)
        .hasMessageContaining("no extension id");
  }
}
