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

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import java.io.IOException;
import java.io.StringReader;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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

  private Server<?> server;
  private NettyAppServer appServer;
  private Capabilities capabilities;
  private final List<TearDownFixture> tearDowns = new LinkedList<>();
  private final ExecutorService executor =
      Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors() * 2);

  @BeforeEach
  public void setupServers() {
    Browser browser = Browser.detect();
    assert browser != null;
    ChromeOptions options = new ChromeOptions();
    options.setEnableDownloads(true);

    capabilities =
        new PersistentCapabilities(browser.getCapabilities())
            .setCapability("se:downloadsEnabled", true);

    Deployment deployment =
        DeploymentTypes.STANDALONE.start(
            browser.getCapabilities(),
            new TomlConfig(
                new StringReader(
                    "[node]\n"
                        + "selenium-manager = true\n"
                        + "enable-managed-downloads = true\n"
                        + "driver-implementation = "
                        + browser.displayName())));
    tearDowns.add(deployment);

    server = deployment.getServer();
    appServer = new NettyAppServer();
    tearDowns.add(() -> appServer.stop());
    appServer.start();
  }

  @AfterEach
  public void tearDown() {
    tearDowns.parallelStream().forEach(Safely::safelyCall);
    executor.shutdownNow();
  }

  @Test
  @Ignore(IE)
  @Ignore(SAFARI)
  void canListDownloadedFiles() {
    URL gridUrl = server.getUrl();
    WebDriver driver = new RemoteWebDriver(gridUrl, capabilities);
    driver = new Augmenter().augment(driver);

    driver.get(appServer.whereIs("downloads/download.html"));
    driver.findElement(By.id("file-1")).click();
    driver.findElement(By.id("file-2")).click();

    new WebDriverWait(driver, Duration.ofSeconds(5))
        .until(d -> ((HasDownloads) d).getDownloadableFiles().size() == 2);

    List<String> downloadableFiles = ((HasDownloads) driver).getDownloadableFiles();
    assertThat(downloadableFiles).contains("file_1.txt", "file_2.jpg");

    driver.quit();
  }

  @Test
  @Ignore(IE)
  @Ignore(SAFARI)
  void canDownloadFiles() throws IOException {
    URL gridUrl = server.getUrl();
    WebDriver driver = new RemoteWebDriver(gridUrl, capabilities);
    driver = new Augmenter().augment(driver);

    driver.get(appServer.whereIs("downloads/download.html"));
    driver.findElement(By.id("file-1")).click();

    new WebDriverWait(driver, Duration.ofSeconds(5))
        .until(d -> !((HasDownloads) d).getDownloadableFiles().isEmpty());

    String fileName = ((HasDownloads) driver).getDownloadableFiles().get(0);

    Path targetLocation = Files.createTempDirectory("download");
    ((HasDownloads) driver).downloadFile(fileName, targetLocation);

    String fileContent = String.join("", Files.readAllLines(targetLocation.resolve(fileName)));
    assertThat(fileContent).isEqualTo("Hello, World!");

    driver.quit();
  }

  @Test
  @Ignore(IE)
  @Ignore(SAFARI)
  void testCanDeleteFiles() {
    URL gridUrl = server.getUrl();
    WebDriver driver = new RemoteWebDriver(gridUrl, capabilities);
    driver.get(appServer.whereIs("downloads/download.html"));
    driver.findElement(By.id("file-1")).click();

    new WebDriverWait(driver, Duration.ofSeconds(5))
        .until(d -> !((HasDownloads) d).getDownloadableFiles().isEmpty());

    driver = new Augmenter().augment(driver);
    ((HasDownloads) driver).deleteDownloadableFiles();

    List<String> afterDeleteNames = ((HasDownloads) driver).getDownloadableFiles();
    assertThat(afterDeleteNames.isEmpty()).isTrue();

    driver.quit();
  }

  @Test
  void errorsWhenCapabilityMissing() {
    URL gridUrl = server.getUrl();
    Browser browser = Browser.detect();

    Capabilities caps =
        new PersistentCapabilities(Objects.requireNonNull(browser).getCapabilities())
            .setCapability("se:downloadsEnabled", false);

    WebDriver driver = new RemoteWebDriver(gridUrl, caps);
    Assertions.assertThrows(
        WebDriverException.class,
        () -> ((HasDownloads) driver).getDownloadableFiles(),
        "You must enable downloads in order to work with downloadable files");
  }
}
