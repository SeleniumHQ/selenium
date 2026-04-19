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

package org.openqa.selenium.environment.webserver;

import static java.util.Objects.requireNonNull;
import static java.util.stream.StreamSupport.stream;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.By.id;
import static org.openqa.selenium.By.tagName;
import static org.openqa.selenium.remote.http.Contents.string;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.time.Duration;
import org.jspecify.annotations.Nullable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

public abstract class AppServerTestBase {
  private static final String APPCACHE_MIME_TYPE = "text/cache-manifest";
  private AppServer server;
  private static @Nullable WebDriver cachedDriver = null;
  private WebDriver driver;

  @BeforeAll
  public static void startDriver() {
    cachedDriver = new WebDriverBuilder().get();
  }

  @BeforeEach
  public void startServer() {
    server = createAppServer();
    server.start();
    driver = requireNonNull(cachedDriver, "Driver is not initialized");
  }

  protected abstract AppServer createAppServer();

  @AfterEach
  public void stopServer() {
    server.stop();
  }

  @AfterAll
  public static void quitDriver() {
    if (cachedDriver != null) {
      cachedDriver.quit();
      cachedDriver = null;
    }
  }

  @Test
  void hostsStaticPages() {
    driver.get(server.whereIs("simpleTest.html"));
    assertThat(driver.getTitle()).isEqualTo("Hello WebDriver");
  }

  @Test
  void servesNumberedPages() {
    driver.get(server.whereIs("page/1"));
    assertThat(driver.getTitle()).isEqualTo("Page1");

    driver.get(server.whereIs("page/2"));
    assertThat(driver.getTitle()).isEqualTo("Page2");
  }

  @Test
  void numberedPagesExcludeQuerystring() {
    driver.get(server.whereIs("page/1?foo=bar"));
    assertThat(driver.findElement(id("pageNumber")).getText()).isEqualTo("1");
  }

  @Test
  void redirects() {
    driver.get(server.whereIs("redirect"));
    assertThat(driver.getTitle()).isEqualTo("We Arrive Here");
    assertThat(driver.getCurrentUrl()).contains("resultPage");
  }

  @Test
  void sleeps() {
    long before = System.currentTimeMillis();
    driver.get(server.whereIs("sleep?time=1"));

    long duration = System.currentTimeMillis() - before;
    assertThat(duration >= 1000).isTrue();
    assertThat(duration < 1500).isTrue();
    assertThat(driver.findElement(tagName("body")).getText()).isEqualTo("Slept for 1s");
  }

  @Test
  void dealsWithUtf16() {
    driver.get(server.whereIs("encoding"));
    String pageText = driver.findElement(By.tagName("body")).getText();
    assertThat(pageText).contains("\u05E9\u05DC\u05D5\u05DD");
  }

  @Test
  void manifestHasCorrectMimeType() throws IOException {
    String url = server.whereIs("html5/test.appcache");
    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    HttpClient client = factory.createClient(new URL(url));
    HttpResponse response = client.execute(new HttpRequest(HttpMethod.GET, url));

    System.out.printf("Content for %s was %s%n", url, string(response));

    assertThat(
            stream(response.getHeaders("Content-Type").spliterator(), false)
                .anyMatch(header -> header.contains(APPCACHE_MIME_TYPE)))
        .isTrue();
  }

  @Test
  void uploadsFile() throws Throwable {
    String FILE_CONTENTS = "Uploaded file";
    File testFile = File.createTempFile("webdriver", "tmp");
    testFile.deleteOnExit();
    Files.writeString(testFile.toPath(), FILE_CONTENTS);

    driver.get(server.whereIs("upload.html"));
    driver.findElement(By.id("upload")).sendKeys(testFile.getAbsolutePath());
    driver.findElement(By.id("go")).submit();

    driver.switchTo().frame("upload_target");
    new WebDriverWait(driver, Duration.ofSeconds(10))
        .until(d -> d.findElement(By.xpath("//body")).getText().equals(FILE_CONTENTS));
  }
}
