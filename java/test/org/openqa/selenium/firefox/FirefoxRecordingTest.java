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
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.openqa.selenium.By;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.drivers.Browser;

class FirefoxRecordingTest extends JupiterTestBase {

  @TempDir Path tempDir;

  @Test
  @NoDriverBeforeTest
  void recordsCommandsScreenshotsAndBiDiEvents() throws IOException {
    Path trace = traceFile("bidi-trace.zip");
    FirefoxOptions options = (FirefoxOptions) Browser.FIREFOX.getCapabilities();
    // The test environment enables BiDi for the binding; leave it to the recording proxy instead.
    options.setCapability("webSocketUrl", (Object) null);
    options.setRecord(trace.toString());
    localDriver = new FirefoxDriver(options);

    // The recording proxy owns the BiDi connection, so the binding must not try to use it.
    assertThat(((HasCapabilities) localDriver).getCapabilities().getCapability("webSocketUrl"))
        .isNull();

    localDriver.get(pages.formPage);
    localDriver.findElement(By.id("working")).sendKeys("Selenium");
    localDriver.findElement(By.id("checky")).click();
    localDriver.get(appServer.whereIs("login.html"));
    localDriver.findElement(By.id("password-field")).sendKeys("top-secret");
    localDriver.get(appServer.whereIs("bidi/logEntryAdded.html"));
    localDriver.findElement(By.id("consoleLog")).click();
    localDriver.findElement(By.id("consoleError")).click();
    quit();

    try (ZipFile zip = new ZipFile(trace.toFile())) {
      List<Map<String, Object>> events = readNdjson(zip, "trace.trace");

      Map<String, Object> context = events.get(0);
      assertThat(context).containsEntry("type", "context-options");
      assertThat(((Number) context.get("version")).intValue()).isEqualTo(8);
      assertThat(context)
          .containsEntry("browserName", "firefox")
          .containsEntry("sdkLanguage", "java");

      assertThat(titlesOf(events))
          .contains("New session", "Type \"Selenium\"", "Click", "Quit")
          .anyMatch(title -> title.startsWith("Navigate to") && title.contains("formPage.html"));
      assertScreenshotsArePackaged(zip, events);
      assertThat(titlesOf(events)).contains("Type \"********\"");
      assertThat(readEntry(zip, "trace.trace")).doesNotContain("top-secret");

      assertThat(eventsOfType(events, "console"))
          .extracting(event -> event.get("text"))
          .contains("Hello, world!", "I am console error");

      assertThat(readNdjson(zip, "trace.network"))
          .extracting(entry -> requestUrlOf(entry))
          .anyMatch(url -> url.endsWith("logEntryAdded.html"));
    }
  }

  @Test
  @NoDriverBeforeTest
  void fallsBackToClassicWebDriverWhenTheBindingUsesBiDi() throws IOException {
    Path trace = traceFile("classic-trace.zip");
    FirefoxOptions options = (FirefoxOptions) Browser.FIREFOX.getCapabilities();
    options.enableBiDi();
    options.setRecord(trace.toString());
    localDriver = new FirefoxDriver(options);

    assertThat(((HasCapabilities) localDriver).getCapabilities().getCapability("webSocketUrl"))
        .isNotNull();

    localDriver.get(pages.formPage);
    localDriver.findElement(By.id("checky")).click();
    new WebDriverWait(localDriver, Duration.ofSeconds(5))
        .until(ExpectedConditions.elementToBeSelected(By.id("checky")));
    quit();

    try (ZipFile zip = new ZipFile(trace.toFile())) {
      List<Map<String, Object>> events = readNdjson(zip, "trace.trace");
      assertThat(titlesOf(events)).contains("Click", "Quit");
      assertScreenshotsArePackaged(zip, events);
    }
  }

  private Path traceFile(String name) {
    String traceDir = System.getenv("SELENIUM_TRACE_DIR");
    Path dir = traceDir == null || traceDir.isEmpty() ? tempDir : Path.of(traceDir);
    return dir.resolve(getClass().getSimpleName() + "-" + name).toAbsolutePath();
  }

  /** Quits explicitly: the trace is only complete once the session is closed. */
  private void quit() {
    localDriver.quit();
    localDriver = null;
  }

  private static void assertScreenshotsArePackaged(ZipFile zip, List<Map<String, Object>> events) {
    List<Map<String, Object>> frames = eventsOfType(events, "screencast-frame");
    assertThat(frames).isNotEmpty();
    for (Map<String, Object> frame : frames) {
      ZipEntry resource = zip.getEntry("resources/" + frame.get("sha1"));
      assertThat(resource).as("screenshot %s", frame.get("sha1")).isNotNull();
      assertThat(resource.getSize()).isPositive();
    }
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

  @SuppressWarnings("unchecked")
  private static String requestUrlOf(Map<String, Object> networkEntry) {
    Map<String, Object> snapshot = (Map<String, Object>) networkEntry.get("snapshot");
    Map<String, Object> request = (Map<String, Object>) snapshot.get("request");
    return (String) request.get("url");
  }

  private static String readEntry(ZipFile zip, String name) throws IOException {
    ZipEntry entry = zip.getEntry(name);
    assertThat(entry).as(name).isNotNull();
    try (InputStream in = zip.getInputStream(entry)) {
      return new String(in.readAllBytes(), StandardCharsets.UTF_8);
    }
  }

  private static List<Map<String, Object>> readNdjson(ZipFile zip, String name) throws IOException {
    String content = readEntry(zip, name);
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
