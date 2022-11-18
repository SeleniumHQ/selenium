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

package org.openqa.selenium.bidi;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.log.BaseLogEntry;
import org.openqa.selenium.bidi.log.ConsoleLogEntry;
import org.openqa.selenium.bidi.log.JavascriptLogEntry;
import org.openqa.selenium.bidi.log.StackTrace;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.openqa.selenium.testing.Safely.safelyCall;

public class LogInspectorTest {

  String page;
  private AppServer server;
  private FirefoxDriver driver;

  @BeforeEach
  public void setUp() {
    FirefoxOptions options = new FirefoxOptions();
    options.setCapability("webSocketUrl", true);

    driver = new FirefoxDriver(options);

    server = new NettyAppServer();
    server.start();
  }

  @Test
  void canListenToConsoleLog() throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<ConsoleLogEntry> future = new CompletableFuture<>();
      logInspector.onConsoleLog(future::complete);

      page = server.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("consoleLog")).click();

      ConsoleLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("Hello, world!");
      assertThat(logEntry.getRealm()).isNull();
      assertThat(logEntry.getArgs().size()).isEqualTo(1);
      assertThat(logEntry.getType()).isEqualTo("console");
      assertThat(logEntry.getLevel()).isEqualTo(BaseLogEntry.LogLevel.INFO);
      assertThat(logEntry.getMethod()).isEqualTo("log");
      assertThat(logEntry.getStackTrace()).isNull();
    }
  }

  @Test
  void canListenToJavascriptLog()
    throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<JavascriptLogEntry> future = new CompletableFuture<>();
      logInspector.onJavaScriptLog(future::complete);

      page = server.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("jsException")).click();

      JavascriptLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("Error: Not working");
      assertThat(logEntry.getType()).isEqualTo("javascript");
      assertThat(logEntry.getLevel()).isEqualTo(BaseLogEntry.LogLevel.ERROR);
    }
  }

  @Test
  void canListenToJavascriptErrorLog()
    throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<JavascriptLogEntry> future = new CompletableFuture<>();
      logInspector.onJavaScriptException(future::complete);

      page = server.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("jsException")).click();

      JavascriptLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("Error: Not working");
      assertThat(logEntry.getType()).isEqualTo("javascript");
      assertThat(logEntry.getLevel()).isEqualTo(BaseLogEntry.LogLevel.ERROR);
    }
  }

  @Test
  void canRetrieveStacktraceForALog()
    throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<JavascriptLogEntry> future = new CompletableFuture<>();
      logInspector.onJavaScriptException(future::complete);

      page = server.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("logWithStacktrace")).click();

      JavascriptLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      StackTrace stackTrace = logEntry.getStackTrace();
      assertThat(stackTrace).isNotNull();
      assertThat(stackTrace.getCallFrames().size()).isEqualTo(4);
    }
  }

  @Test
  void canListenToConsoleLogForABrowsingContext()
    throws ExecutionException, InterruptedException, TimeoutException {
    page = server.whereIs("/bidi/logEntryAdded.html");
    String browsingContextId = driver.switchTo().newWindow(WindowType.TAB).getWindowHandle();

    try (LogInspector logInspector = new LogInspector(browsingContextId, driver)) {
      CompletableFuture<ConsoleLogEntry> future = new CompletableFuture<>();
      logInspector.onConsoleLog(future::complete);

      driver.get(page);
      driver.findElement(By.id("consoleLog")).click();

      ConsoleLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("Hello, world!");
      assertThat(logEntry.getRealm()).isNull();
      assertThat(logEntry.getArgs().size()).isEqualTo(1);
      assertThat(logEntry.getType()).isEqualTo("console");
      assertThat(logEntry.getLevel()).isEqualTo(BaseLogEntry.LogLevel.INFO);
      assertThat(logEntry.getMethod()).isEqualTo("log");
      assertThat(logEntry.getStackTrace()).isNull();
    }
  }

  @Test
  void canListenToJavascriptLogForABrowsingContext()
    throws ExecutionException, InterruptedException, TimeoutException {
    page = server.whereIs("/bidi/logEntryAdded.html");
    String browsingContextId = driver.switchTo().newWindow(WindowType.TAB).getWindowHandle();

    try (LogInspector logInspector = new LogInspector(browsingContextId, driver)) {
      CompletableFuture<JavascriptLogEntry> future = new CompletableFuture<>();
      logInspector.onJavaScriptLog(future::complete);

      driver.get(page);
      driver.findElement(By.id("jsException")).click();

      JavascriptLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("Error: Not working");
      assertThat(logEntry.getType()).isEqualTo("javascript");
      assertThat(logEntry.getLevel()).isEqualTo(BaseLogEntry.LogLevel.ERROR);
    }
  }

  @Test
  void canListenToJavascriptErrorLogForABrowsingContext()
    throws ExecutionException, InterruptedException, TimeoutException {
    page = server.whereIs("/bidi/logEntryAdded.html");
    String browsingContextId = driver.switchTo().newWindow(WindowType.TAB).getWindowHandle();

    try (LogInspector logInspector = new LogInspector(browsingContextId, driver)) {
      CompletableFuture<JavascriptLogEntry> future = new CompletableFuture<>();
      logInspector.onJavaScriptException(future::complete);

      driver.get(page);
      driver.findElement(By.id("jsException")).click();

      JavascriptLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("Error: Not working");
      assertThat(logEntry.getType()).isEqualTo("javascript");
      assertThat(logEntry.getLevel()).isEqualTo(BaseLogEntry.LogLevel.ERROR);
    }
  }

  @Test
  void canListenToConsoleLogForMultipleBrowsingContexts()
    throws ExecutionException, InterruptedException, TimeoutException {
    page = server.whereIs("/bidi/logEntryAdded.html");
    String firstBrowsingContextId = driver.getWindowHandle();
    String secondBrowsingContextId = driver.switchTo().newWindow(WindowType.TAB).getWindowHandle();

    Set<String> browsingContextIds = new HashSet<>();
    browsingContextIds.add(firstBrowsingContextId);
    browsingContextIds.add(secondBrowsingContextId);

    CountDownLatch latch = new CountDownLatch(2);

    try (LogInspector logInspector = new LogInspector(browsingContextIds, driver)) {
      logInspector.onConsoleLog(logEntry -> latch.countDown());

      driver.get(page);
      // Triggers console event in the second tab
      driver.findElement(By.id("consoleLog")).click();

      driver.switchTo().window(firstBrowsingContextId);

      driver.get(page);
      // Triggers console event in the first tab
      driver.findElement(By.id("consoleLog")).click();

      driver.switchTo().newWindow(WindowType.TAB);
      driver.get(page);
      // Triggers console event in the third tab, but we have not subscribed for that
      driver.findElement(By.id("consoleLog")).click();

      latch.await();

      assertThat(latch.getCount()).isEqualTo(0);
    }
  }

  @Test
  void canListenToJavascriptLogForMultipleBrowsingContexts() throws InterruptedException {
    page = server.whereIs("/bidi/logEntryAdded.html");
    String firstBrowsingContextId = driver.getWindowHandle();
    String secondBrowsingContextId = driver.switchTo().newWindow(WindowType.TAB).getWindowHandle();

    Set<String> browsingContextIds = new HashSet<>();
    browsingContextIds.add(firstBrowsingContextId);
    browsingContextIds.add(secondBrowsingContextId);

    CountDownLatch latch = new CountDownLatch(2);

    try (LogInspector logInspector = new LogInspector(browsingContextIds, driver)) {
      logInspector.onJavaScriptLog(logEntry -> latch.countDown());

      driver.get(page);
      // Triggers console event in the second tab
      driver.findElement(By.id("jsException")).click();

      driver.switchTo().window(firstBrowsingContextId);

      driver.get(page);
      // Triggers console event in the first tab
      driver.findElement(By.id("jsException")).click();

      driver.switchTo().newWindow(WindowType.TAB);
      driver.get(page);
      // Triggers console event in the third tab, but we have not subscribed for that
      driver.findElement(By.id("jsException")).click();

      latch.await();

      assertThat(latch.getCount()).isEqualTo(0);
    }
  }

  @Test
  void canListenToJavascriptErrorLogForMultipleBrowsingContexts() throws InterruptedException {
    page = server.whereIs("/bidi/logEntryAdded.html");
    String firstBrowsingContextId = driver.getWindowHandle();
    String secondBrowsingContextId = driver.switchTo().newWindow(WindowType.TAB).getWindowHandle();

    Set<String> browsingContextIds = new HashSet<>();
    browsingContextIds.add(firstBrowsingContextId);
    browsingContextIds.add(secondBrowsingContextId);

    CountDownLatch latch = new CountDownLatch(2);

    try (LogInspector logInspector = new LogInspector(browsingContextIds, driver)) {
      logInspector.onJavaScriptException(logEntry -> latch.countDown());

      driver.get(page);
      // Triggers console event in the second tab
      driver.findElement(By.id("jsException")).click();

      driver.switchTo().window(firstBrowsingContextId);

      driver.get(page);
      // Triggers console event in the first tab
      driver.findElement(By.id("jsException")).click();

      driver.switchTo().newWindow(WindowType.TAB);
      driver.get(page);
      // Triggers console event in the third tab, but we have not subscribed for that
      driver.findElement(By.id("consoleLog")).click();

      latch.await();

      assertThat(latch.getCount()).isEqualTo(0);
    }
  }

  @Test
  void canListenToAnyTypeOfLogForMultipleBrowsingContexts() throws InterruptedException {
    page = server.whereIs("/bidi/logEntryAdded.html");
    String firstBrowsingContextId = driver.getWindowHandle();
    String secondBrowsingContextId = driver.switchTo().newWindow(WindowType.TAB).getWindowHandle();

    Set<String> browsingContextIds = new HashSet<>();
    browsingContextIds.add(firstBrowsingContextId);
    browsingContextIds.add(secondBrowsingContextId);

    CountDownLatch latch = new CountDownLatch(2);

    try (LogInspector logInspector = new LogInspector(browsingContextIds, driver)) {
      logInspector.onLog(logEntry -> latch.countDown());

      driver.get(page);
      driver.findElement(By.id("jsException")).click();

      driver.switchTo().window(firstBrowsingContextId);

      driver.get(page);
      driver.findElement(By.id("consoleLog")).click();

      latch.await();

      assertThat(latch.getCount()).isEqualTo(0);
    }
  }

  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
    safelyCall(server::stop);
  }
}
