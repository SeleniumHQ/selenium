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

package org.openqa.selenium.bidi.log;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatExceptionOfType;
import static org.assertj.core.api.AssertionsForClassTypes.fail;
import static org.openqa.selenium.testing.Safely.safelyCall;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.LogInspector;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.testing.JupiterTestBase;

class LogInspectorTest extends JupiterTestBase {

  String page;
  private AppServer server;

  @BeforeEach
  public void setUp() {
    server = new NettyAppServer();
    server.start();
  }

  @Test
  void canListenToConsoleLog() throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<ConsoleLogEntry> future = new CompletableFuture<>();
      logInspector.onConsoleEntry(future::complete);

      page = server.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("consoleLog")).click();

      ConsoleLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("Hello, world!");
      assertThat(logEntry.getRealm()).isNull();
      assertThat(logEntry.getArgs().size()).isEqualTo(1);
      assertThat(logEntry.getType()).isEqualTo("console");
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.INFO);
      assertThat(logEntry.getMethod()).isEqualTo("log");
    }
  }

  @Test
  void canFilterConsoleLogs() throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<ConsoleLogEntry> future = new CompletableFuture<>();
      logInspector.onConsoleEntry(future::complete, FilterBy.logLevel(LogLevel.INFO));

      page = server.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("consoleLog")).click();

      ConsoleLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("Hello, world!");
      assertThat(logEntry.getRealm()).isNull();
      assertThat(logEntry.getArgs().size()).isEqualTo(1);
      assertThat(logEntry.getType()).isEqualTo("console");
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.INFO);
      assertThat(logEntry.getMethod()).isEqualTo("log");

      CompletableFuture<ConsoleLogEntry> errorLogfuture = new CompletableFuture<>();

      logInspector.onConsoleEntry(errorLogfuture::complete, FilterBy.logLevel(LogLevel.ERROR));
      driver.findElement(By.id("consoleError")).click();

      ConsoleLogEntry errorLogEntry = errorLogfuture.get(5, TimeUnit.SECONDS);

      assertThat(errorLogEntry.getText()).isEqualTo("I am console error");
      assertThat(errorLogEntry.getRealm()).isNull();
      assertThat(errorLogEntry.getArgs().size()).isEqualTo(1);
      assertThat(errorLogEntry.getType()).isEqualTo("console");
      assertThat(errorLogEntry.getLevel()).isEqualTo(LogLevel.ERROR);
      assertThat(errorLogEntry.getMethod()).isEqualTo("error");
      assertThat(errorLogEntry.getStackTrace()).isNotNull();
      assertThat(errorLogEntry.getStackTrace().getCallFrames().size()).isEqualTo(2);
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
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.ERROR);
    }
  }

  @Test
  void canFilterJavascriptLogs() throws ExecutionException, InterruptedException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<JavascriptLogEntry> future = new CompletableFuture<>();
      logInspector.onJavaScriptLog(future::complete, FilterBy.logLevel(LogLevel.ERROR));

      page = server.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("jsException")).click();

      JavascriptLogEntry logEntry = null;
      try {
        logEntry = future.get(5, TimeUnit.SECONDS);
      } catch (TimeoutException e) {
        fail("Time out exception" + e.getMessage());
      }

      assertThat(logEntry.getText()).isEqualTo("Error: Not working");
      assertThat(logEntry.getType()).isEqualTo("javascript");
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.ERROR);

      CompletableFuture<JavascriptLogEntry> infoLogFuture = new CompletableFuture<>();

      logInspector.onJavaScriptLog(infoLogFuture::complete, FilterBy.logLevel(LogLevel.INFO));
      driver.findElement(By.id("jsException")).click();

      assertThatExceptionOfType(TimeoutException.class)
          .isThrownBy(() -> infoLogFuture.get(5, TimeUnit.SECONDS));
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
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.ERROR);
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
    }
  }

  @Test
  void canFilterLogs() throws ExecutionException, InterruptedException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<LogEntry> future = new CompletableFuture<>();
      logInspector.onLog(future::complete, FilterBy.logLevel(LogLevel.INFO));

      page = server.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("consoleLog")).click();

      LogEntry logEntry = null;
      try {
        logEntry = future.get(5, TimeUnit.SECONDS);
      } catch (TimeoutException e) {
        fail("Time out exception" + e.getMessage());
      }

      assertThat(logEntry.getConsoleLogEntry().isPresent()).isTrue();

      ConsoleLogEntry consoleLogEntry = logEntry.getConsoleLogEntry().get();
      assertThat(consoleLogEntry.getText()).isEqualTo("Hello, world!");
      assertThat(consoleLogEntry.getRealm()).isNull();
      assertThat(consoleLogEntry.getArgs().size()).isEqualTo(1);
      assertThat(consoleLogEntry.getType()).isEqualTo("console");
      assertThat(consoleLogEntry.getLevel()).isEqualTo(LogLevel.INFO);
      assertThat(consoleLogEntry.getMethod()).isEqualTo("log");
    }
  }

  @Disabled("Until browsers support subscribing to multiple contexts.")
  @Test
  void canListenToConsoleLogForABrowsingContext()
      throws ExecutionException, InterruptedException, TimeoutException {
    page = server.whereIs("/bidi/logEntryAdded.html");
    String browsingContextId = driver.switchTo().newWindow(WindowType.TAB).getWindowHandle();

    try (LogInspector logInspector = new LogInspector(browsingContextId, driver)) {
      CompletableFuture<ConsoleLogEntry> future = new CompletableFuture<>();
      logInspector.onConsoleEntry(future::complete);

      driver.get(page);
      driver.findElement(By.id("consoleLog")).click();

      ConsoleLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("Hello, world!");
      assertThat(logEntry.getRealm()).isNull();
      assertThat(logEntry.getArgs().size()).isEqualTo(1);
      assertThat(logEntry.getType()).isEqualTo("console");
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.INFO);
      assertThat(logEntry.getMethod()).isEqualTo("log");
    }
  }

  @Disabled("Until browsers support subscribing to multiple contexts.")
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
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.ERROR);
    }
  }

  @Disabled("Until browsers support subscribing to multiple contexts.")
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
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.ERROR);
    }
  }

  @Disabled("Until browsers support subscribing to multiple contexts.")
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
      logInspector.onConsoleEntry(logEntry -> latch.countDown());

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

      assertThat(latch.getCount()).isZero();
    }
  }

  @Disabled("Until browsers support subscribing to multiple contexts.")
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

      assertThat(latch.getCount()).isZero();
    }
  }

  @Disabled("Until browsers support subscribing to multiple contexts.")
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

      assertThat(latch.getCount()).isZero();
    }
  }

  @Disabled("Until browsers support subscribing to multiple contexts.")
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

      assertThat(latch.getCount()).isZero();
    }
  }

  @Test
  void canListenToLogsWithMultipleConsumers()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<JavascriptLogEntry> completableFuture1 = new CompletableFuture<>();
      logInspector.onJavaScriptLog(completableFuture1::complete);

      CompletableFuture<JavascriptLogEntry> completableFuture2 = new CompletableFuture<>();
      logInspector.onJavaScriptLog(completableFuture2::complete);

      page = server.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("jsException")).click();

      JavascriptLogEntry logEntry = completableFuture1.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("Error: Not working");
      assertThat(logEntry.getType()).isEqualTo("javascript");
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.ERROR);

      logEntry = completableFuture2.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("Error: Not working");
      assertThat(logEntry.getType()).isEqualTo("javascript");
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.ERROR);
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
