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

import static java.util.Objects.requireNonNull;
import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.openqa.selenium.By;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.router.DeploymentTypes.Deployment;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.AbstractDriverOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.Safely;
import org.openqa.selenium.testing.drivers.Browser;

class RemoteRecordingTest extends JupiterTestBase {

  @TempDir Path tempDir;

  private Deployment deployment;

  @AfterEach
  void tearDownDeployment() {
    if (deployment != null) {
      Safely.safelyCall(() -> deployment.tearDown());
    }
  }

  @Test
  @NoDriverBeforeTest
  void recordsARemoteSession() throws IOException {
    Browser browser = requireNonNull(Browser.detect());
    deployment =
        DeploymentTypes.STANDALONE.start(
            browser.getCapabilities(),
            new TomlConfig(
                new StringReader(
                    "[node]\n"
                        + "selenium-manager = false\n"
                        + "driver-implementation = "
                        + String.format("\"%s\"", browser.displayName()))));

    Path trace = traceFile("remote-trace.zip");
    AbstractDriverOptions<?> options = (AbstractDriverOptions<?>) browser.getCapabilities();
    options.setRecord(trace.toString());
    localDriver = new RemoteWebDriver(deployment.getServer().getUrl(), options);

    localDriver.get(appServer.whereIs("bidi/logEntryAdded.html"));
    localDriver.findElement(By.id("consoleLog")).click();
    localDriver.quit();
    localDriver = null;

    try (ZipFile zip = new ZipFile(trace.toFile())) {
      List<Map<String, Object>> events = readNdjson(zip, "trace.trace");
      assertThat(titlesOf(events)).contains("New session", "Click", "Quit");
      assertThat(eventsOfType(events, "screencast-frame")).isNotEmpty();
      assertThat(eventsOfType(events, "console"))
          .extracting(event -> event.get("text"))
          .contains("Hello, world!");
    }
  }

  private Path traceFile(String name) {
    String traceDir = System.getenv("SELENIUM_TRACE_DIR");
    Path dir = traceDir == null || traceDir.isEmpty() ? tempDir : Path.of(traceDir);
    return dir.resolve(getClass().getSimpleName() + "-" + name).toAbsolutePath();
  }

  private static List<String> titlesOf(List<Map<String, Object>> events) {
    List<String> titles = new ArrayList<>();
    for (Map<String, Object> event : eventsOfType(events, "before")) {
      titles.add((String) event.get("title"));
    }
    return titles;
  }

  private static List<Map<String, Object>> eventsOfType(
      List<Map<String, Object>> events, String type) {
    List<Map<String, Object>> matching = new ArrayList<>();
    for (Map<String, Object> event : events) {
      if (type.equals(event.get("type"))) {
        matching.add(event);
      }
    }
    return matching;
  }

  private static List<Map<String, Object>> readNdjson(ZipFile zip, String name)
      throws IOException {
    ZipEntry entry = zip.getEntry(name);
    assertThat(entry).as(name).isNotNull();
    String content;
    try (InputStream in = zip.getInputStream(entry)) {
      content = new String(in.readAllBytes(), StandardCharsets.UTF_8);
    }
    Json json = new Json();
    List<Map<String, Object>> lines = new ArrayList<>();
    for (String line : content.split("\n")) {
      if (!line.isBlank()) {
        lines.add(json.toType(line, Json.MAP_TYPE));
      }
    }
    return lines;
  }
}
