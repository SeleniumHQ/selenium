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

package org.openqa.selenium.grid.router;

import static java.time.Duration.ofSeconds;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.openqa.selenium.HasDownloads.DownloadedFile;
import static org.openqa.selenium.remote.CapabilityType.ENABLE_DOWNLOADS;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasDownloads;
import org.openqa.selenium.PersistentCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.router.DeploymentTypes.Deployment;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.Safely;
import org.openqa.selenium.testing.TearDownFixture;
import org.openqa.selenium.testing.drivers.Browser;

class RemoteWebDriverDownloadTest {

  private static final Set<String> FILE_EXTENSIONS = Set.of(".txt", ".jpg");

  private Server<?> server;
  private NettyAppServer appServer;
  private Capabilities capabilities;
  private WebDriver driver;
  private final List<TearDownFixture> tearDowns = new ArrayList<>(2);

  @BeforeEach
  public void setupServers() {
    Browser browser = Browser.detect();
    assert browser != null;
    ChromeOptions options = new ChromeOptions();
    options.setEnableDownloads(true);

    capabilities =
        new PersistentCapabilities(browser.getCapabilities()).setCapability(ENABLE_DOWNLOADS, true);

    Deployment deployment =
        DeploymentTypes.STANDALONE.start(
            browser.getCapabilities(),
            new TomlConfig(
                new StringReader(
                    "[node]\n"
                        + "selenium-manager = true\n"
                        + "enable-managed-downloads = true\n"
                        + "driver-implementation = "
                        + String.format("\"%s\"", browser.displayName()))));
    tearDowns.add(deployment);

    server = deployment.getServer();
    appServer = new NettyAppServer(false);
    tearDowns.add(() -> appServer.stop());
    appServer.start();
  }

  @AfterEach
  public void tearDown() {
    if (driver != null) {
      driver.quit();
    }
    tearDowns.parallelStream().forEach(Safely::safelyCall);
  }

  @Test
  @Ignore(IE)
  @Ignore(SAFARI)
  void canListDownloadedFiles() {
    driver = createWebdriver(capabilities);

    driver.get(appServer.whereIs("downloads/download.html"));
    driver.findElement(By.id("file-1")).click();
    driver.findElement(By.id("file-2")).click();
    driver.findElement(By.id("file-3")).click();
    waitForDownloadedFiles(driver, 3);

    @SuppressWarnings("deprecation")
    List<String> downloadableFiles = ((HasDownloads) driver).getDownloadableFiles();
    assertThat(downloadableFiles)
        .contains("file_1.txt", "file_2.jpg", "file-with-space 0 & _ ' ~.txt");

    List<DownloadedFile> downloadedFiles = ((HasDownloads) driver).getDownloadedFiles();
    assertThat(downloadedFiles.stream().map(f -> f.getName()).collect(Collectors.toList()))
        .contains("file_1.txt", "file_2.jpg", "file-with-space 0 & _ ' ~.txt");
  }

  @ParameterizedTest
  @MethodSource("downloadableFiles")
  @Ignore(IE)
  @Ignore(SAFARI)
  void canDownloadFiles(By selector, String expectedFileName, String expectedFileContent)
      throws IOException {
    driver = createWebdriver(capabilities);

    driver.get(appServer.whereIs("downloads/download.html"));
    driver.findElement(selector).click();
    waitForDownloadedFiles(driver, 1);

    DownloadedFile file = ((HasDownloads) driver).getDownloadedFiles().get(0);
    assertThat(file.getName()).isEqualTo(expectedFileName);

    Path targetLocation = Files.createTempDirectory("download");
    ((HasDownloads) driver).downloadFile(file.getName(), targetLocation);

    File localFile = targetLocation.resolve(expectedFileName).toFile();
    assertThat(localFile).hasName(expectedFileName);
    assertThat(localFile).hasSize(file.getSize());
    assertThat(localFile).content().isEqualToIgnoringNewLines(expectedFileContent);
  }

  static Stream<Arguments> downloadableFiles() {
    return Stream.of(
        Arguments.of(By.id("file-1"), "file_1.txt", "Hello, World!"),
        Arguments.of(
            By.id("file-3"), "file-with-space 0 & _ ' ~.txt", "Hello, filename with space!"));
  }

  @Test
  @Ignore(IE)
  @Ignore(SAFARI)
  void testCanDeleteFiles() {
    driver = createWebdriver(capabilities);
    driver.get(appServer.whereIs("downloads/download.html"));
    driver.findElement(By.id("file-1")).click();
    waitForDownloadedFiles(driver, 1);

    ((HasDownloads) driver).deleteDownloadableFiles();

    var afterDeleteNames = ((HasDownloads) driver).getDownloadedFiles();
    assertThat(afterDeleteNames).isEmpty();
  }

  @Test
  void errorsWhenCapabilityMissing() {
    Browser browser = Browser.detect();

    Capabilities caps =
        new PersistentCapabilities(Objects.requireNonNull(browser).getCapabilities())
            .setCapability(ENABLE_DOWNLOADS, false);

    driver = createWebdriver(caps);
    assertThatThrownBy(() -> ((HasDownloads) driver).getDownloadedFiles())
        .isInstanceOf(WebDriverException.class)
        .hasMessageStartingWith(
            "You must enable downloads in order to work with downloadable files");

    //noinspection deprecation
    assertThatThrownBy(() -> ((HasDownloads) driver).getDownloadableFiles())
        .isInstanceOf(WebDriverException.class)
        .hasMessageStartingWith(
            "You must enable downloads in order to work with downloadable files");
  }

  private WebDriver createWebdriver(Capabilities capabilities) {
    return new Augmenter().augment(new RemoteWebDriver(server.getUrl(), capabilities));
  }

  /** ensure we hit no temporary file created by the browser while downloading */
  private void waitForDownloadedFiles(WebDriver driver, int expectedFilesCount) {
    HasDownloads hasDownloads = (HasDownloads) driver;

    new WebDriverWait(driver, ofSeconds(5))
        .until(
            __ -> {
              long actualFilesCount =
                  hasDownloads.getDownloadedFiles().stream()
                      .filter((f) -> FILE_EXTENSIONS.stream().anyMatch(f::hasExtension))
                      .count();
              return actualFilesCount == expectedFilesCount;
            });
  }
}
