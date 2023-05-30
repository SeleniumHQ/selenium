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
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import com.google.common.collect.ImmutableMap;
import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.net.URL;
import java.nio.file.Files;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.PersistentCapabilities;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.router.DeploymentTypes.Deployment;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.io.Zip;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
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
  void testCanListDownloadedFiles() throws InterruptedException {
    URL gridUrl = server.getUrl();
    RemoteWebDriver driver = new RemoteWebDriver(gridUrl, capabilities);
    driver.get(appServer.whereIs("downloads/download.html"));
    driver.findElement(By.id("file-1")).click();
    driver.findElement(By.id("file-2")).click();
    SessionId sessionId = driver.getSessionId();

    // Waiting for the file to be remotely downloaded
    TimeUnit.SECONDS.sleep(3);

    HttpRequest request = new HttpRequest(GET, String.format("/session/%s/se/files", sessionId));
    try (HttpClient client = HttpClient.Factory.createDefault().createClient(gridUrl)) {
      HttpResponse response = client.execute(request);
      Map<String, Object> jsonResponse = new Json().toType(string(response), Json.MAP_TYPE);
      @SuppressWarnings("unchecked")
      Map<String, Object> value = (Map<String, Object>) jsonResponse.get("value");
      @SuppressWarnings("unchecked")
      List<String> names = (List<String>) value.get("names");
      assertThat(names).contains("file_1.txt", "file_2.jpg");
    } finally {
      driver.quit();
    }
  }

  @Test
  @Ignore(IE)
  @Ignore(SAFARI)
  void testCanDownloadFiles() throws InterruptedException, IOException {
    URL gridUrl = server.getUrl();
    RemoteWebDriver driver = new RemoteWebDriver(gridUrl, capabilities);
    driver.get(appServer.whereIs("downloads/download.html"));
    driver.findElement(By.id("file-1")).click();
    SessionId sessionId = driver.getSessionId();

    // Waiting for the file to be remotely downloaded
    TimeUnit.SECONDS.sleep(3);

    HttpRequest request = new HttpRequest(POST, String.format("/session/%s/se/files", sessionId));
    request.setContent(asJson(ImmutableMap.of("name", "file_1.txt")));
    try (HttpClient client = HttpClient.Factory.createDefault().createClient(gridUrl)) {
      HttpResponse response = client.execute(request);
      Map<String, Object> jsonResponse = new Json().toType(string(response), Json.MAP_TYPE);
      @SuppressWarnings("unchecked")
      Map<String, Object> value = (Map<String, Object>) jsonResponse.get("value");
      String zippedContents = value.get("contents").toString();
      File downloadDir = Zip.unzipToTempDir(zippedContents, "download", "");
      File downloadedFile = Optional.ofNullable(downloadDir.listFiles()).orElse(new File[] {})[0];
      String fileContent = String.join("", Files.readAllLines(downloadedFile.toPath()));
      assertThat(fileContent).isEqualTo("Hello, World!");
    } finally {
      driver.quit();
    }
  }
}
