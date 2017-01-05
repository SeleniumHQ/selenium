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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import com.google.common.base.Charsets;
import com.google.common.base.Throwables;
import com.google.common.io.Files;

import org.apache.http.Header;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.File;

@RunWith(JUnit4.class)
public class AppServerTest {
  private static final String APPCACHE_MIME_TYPE = "text/cache-manifest";
  private AppServer server;
  private static WebDriver driver;

  @BeforeClass
  public static void startDriver() throws Throwable {
    driver = new WebDriverBuilder().get();
  }

  @Before
  public void startServer() throws Throwable {
    server = new JettyAppServer();
    server.start();
  }

  @After
  public void stopServer() {
    server.stop();
  }

  @AfterClass
  public static void quitDriver() {
    driver.quit();
  }

  @Test
  public void hostsStaticPages() {
    driver.get(server.whereIs("simpleTest.html"));
    assertEquals("Hello WebDriver", driver.getTitle());
  }

  @Test
  public void servesNumberedPages() {
    driver.get(server.whereIs("page/1"));
    assertEquals("Page1", driver.getTitle());

    driver.get(server.whereIs("page/2"));
    assertEquals("Page2", driver.getTitle());
  }

  @Test
  public void numberedPagesExcludeQuerystring() {
    driver.get(server.whereIs("page/1?foo=bar"));
    assertEquals("1", driver.findElement(By.id("pageNumber")).getText());
  }

  @Test
  public void redirects() {
    driver.get(server.whereIs("redirect"));
    assertEquals("We Arrive Here", driver.getTitle());
    assertTrue(driver.getCurrentUrl().contains("resultPage"));
  }

  @Test
  public void sleeps() {
    long before = System.currentTimeMillis();
    driver.get(server.whereIs("sleep?time=1"));

    long duration = System.currentTimeMillis() - before;
    assertTrue(duration >= 1000);
    assertTrue(duration < 1500);
    assertEquals("Slept for 1s", driver.findElement(By.tagName("body")).getText());
  }

  @Test
  public void dealsWithUtf16() {
    driver.get(server.whereIs("encoding"));
    String pageText = driver.findElement(By.tagName("body")).getText();
    assertTrue(pageText.contains("\u05E9\u05DC\u05D5\u05DD"));
  }

  @Test
  public void manifestHasCorrectMimeType() {
    assertUrlHasContentType(server.whereIs("html5/test.appcache"), APPCACHE_MIME_TYPE);
  }

  @Test
  public void manifestHasCorrectMimeTypeUnderJavascript() {
    String appcacheUrl =
        server.whereIs("/javascript/atoms/test/html5/testdata/with_fallback.appcache");
    assertUrlHasContentType(appcacheUrl, APPCACHE_MIME_TYPE);
  }

  @Test
  public void uploadsFile() throws Throwable {
    String FILE_CONTENTS = "Uploaded file";
    File testFile = File.createTempFile("webdriver", "tmp");
    testFile.deleteOnExit();
    Files.write(FILE_CONTENTS, testFile, Charsets.UTF_8);

    driver.get(server.whereIs("upload.html"));
    driver.findElement(By.id("upload")).sendKeys(testFile.getAbsolutePath());
    driver.findElement(By.id("go")).submit();

    // Nasty. Sorry.
    Thread.sleep(50);

    driver.switchTo().frame("upload_target");
    WebElement body = driver.findElement(By.xpath("//body"));
    assertEquals(FILE_CONTENTS, body.getText());
  }

  private void assertUrlHasContentType(String url, String appcacheMimeType) {
    HttpClient httpclient = HttpClientBuilder.create().build();
    HttpGet httpget = new HttpGet(url);
    HttpResponse response;

    try {
      response = httpclient.execute(httpget);
    } catch (Throwable t) {
      throw Throwables.propagate(t);
    }

    Header[] contentTypeHeaders = response.getHeaders("Content-Type");
    assertEquals(1, contentTypeHeaders.length);
    assertTrue(contentTypeHeaders[0].getValue().contains(appcacheMimeType));
  }
}
