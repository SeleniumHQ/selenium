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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.module.LogInspector;
import org.openqa.selenium.bidi.script.Source;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;

class LogInspectorTest extends JupiterTestBase {

  String page;

  @Test
  @NeedsFreshDriver
  void canListenToConsoleLog() throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<ConsoleLogEntry> future = new CompletableFuture<>();
      logInspector.onConsoleEntry(future::complete);

      page = appServer.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("consoleLog")).click();

      ConsoleLogEntry logEntry = future.get(5, TimeUnit.SECONDS);
      Source source = logEntry.getSource();
      assertThat(source.getBrowsingContext()).isPresent();
      assertThat(source.getRealm()).isNotNull();
      assertThat(logEntry.getText()).isEqualTo("Hello, world!");
      assertThat(logEntry.getArgs()).hasSize(1);
      assertThat(logEntry.getArgs().get(0).getType()).isEqualTo("string");
      assertThat(logEntry.getType()).isEqualTo("console");
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.INFO);
      assertThat(logEntry.getMethod()).isEqualTo("log");
    }
  }

  @Test
  @NeedsFreshDriver
  void canFilterConsoleLogs() throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<ConsoleLogEntry> future = new CompletableFuture<>();
      logInspector.onConsoleEntry(future::complete, FilterBy.logLevel(LogLevel.INFO));

      page = appServer.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("consoleLog")).click();

      ConsoleLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("Hello, world!");
      assertThat(logEntry.getArgs()).hasSize(1);
      assertThat(logEntry.getType()).isEqualTo("console");
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.INFO);
      assertThat(logEntry.getMethod()).isEqualTo("log");

      CompletableFuture<ConsoleLogEntry> errorLogFuture = new CompletableFuture<>();

      logInspector.onConsoleEntry(errorLogFuture::complete, FilterBy.logLevel(LogLevel.ERROR));
      driver.findElement(By.id("consoleError")).click();

      ConsoleLogEntry errorLogEntry = errorLogFuture.get(5, TimeUnit.SECONDS);

      assertThat(errorLogEntry.getText()).isEqualTo("I am console error");
      assertThat(errorLogEntry.getArgs()).hasSize(1);
      assertThat(errorLogEntry.getType()).isEqualTo("console");
      assertThat(errorLogEntry.getLevel()).isEqualTo(LogLevel.ERROR);
      assertThat(errorLogEntry.getMethod()).isEqualTo("error");
      assertThat(errorLogEntry.getStackTrace()).isNotNull();
      assertThat(errorLogEntry.getStackTrace().getCallFrames()).hasSize(2);
    }
  }

  @Test
  @NeedsFreshDriver
  void canListenToJavascriptLog()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<JavascriptLogEntry> future = new CompletableFuture<>();
      logInspector.onJavaScriptLog(future::complete);

      page = appServer.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("jsException")).click();

      JavascriptLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      Source source = logEntry.getSource();
      assertThat(source.getBrowsingContext()).isPresent();
      assertThat(source.getRealm()).isNotNull();

      assertThat(logEntry.getText()).isEqualTo("Error: Not working");
      assertThat(logEntry.getType()).isEqualTo("javascript");
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.ERROR);
    }
  }

  @Test
  @NeedsFreshDriver
  void canFilterJavascriptLogs() throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<JavascriptLogEntry> future = new CompletableFuture<>();
      logInspector.onJavaScriptLog(future::complete, FilterBy.logLevel(LogLevel.ERROR));

      page = appServer.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("jsException")).click();

      JavascriptLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

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
  @NeedsFreshDriver
  void canListenToJavascriptErrorLog()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<JavascriptLogEntry> future = new CompletableFuture<>();
      logInspector.onJavaScriptException(future::complete);

      page = appServer.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("jsException")).click();

      JavascriptLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("Error: Not working");
      assertThat(logEntry.getType()).isEqualTo("javascript");
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.ERROR);
    }
  }

  @Test
  @NeedsFreshDriver
  void canRetrieveStacktraceForALog()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<JavascriptLogEntry> future = new CompletableFuture<>();
      logInspector.onJavaScriptException(future::complete);

      page = appServer.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("logWithStacktrace")).click();

      JavascriptLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      StackTrace stackTrace = logEntry.getStackTrace();
      assertThat(stackTrace).isNotNull();
    }
  }

  @Test
  @NeedsFreshDriver
  void canFilterLogs() throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<LogEntry> future = new CompletableFuture<>();
      logInspector.onLog(future::complete, FilterBy.logLevel(LogLevel.INFO));

      page = appServer.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("consoleLog")).click();

      LogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getConsoleLogEntry()).isPresent();

      ConsoleLogEntry consoleLogEntry = logEntry.getConsoleLogEntry().get();
      assertThat(consoleLogEntry.getText()).isEqualTo("Hello, world!");
      assertThat(consoleLogEntry.getArgs()).hasSize(1);
      assertThat(consoleLogEntry.getType()).isEqualTo("console");
      assertThat(consoleLogEntry.getLevel()).isEqualTo(LogLevel.INFO);
      assertThat(consoleLogEntry.getMethod()).isEqualTo("log");
    }
  }

  @Disabled("Until browsers support subscribing to multiple contexts.")
  @Test
  @NeedsFreshDriver
  void canListenToConsoleLogForABrowsingContext()
      throws ExecutionException, InterruptedException, TimeoutException {
    page = appServer.whereIs("/bidi/logEntryAdded.html");
    String browsingContextId = driver.switchTo().newWindow(WindowType.TAB).getWindowHandle();

    try (LogInspector logInspector = new LogInspector(browsingContextId, driver)) {
      CompletableFuture<ConsoleLogEntry> future = new CompletableFuture<>();
      logInspector.onConsoleEntry(future::complete);

      driver.get(page);
      driver.findElement(By.id("consoleLog")).click();

      ConsoleLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getText()).isEqualTo("Hello, world!");
      assertThat(logEntry.getArgs()).hasSize(1);
      assertThat(logEntry.getType()).isEqualTo("console");
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.INFO);
      assertThat(logEntry.getMethod()).isEqualTo("log");
    }
  }

  @Disabled("Until browsers support subscribing to multiple contexts.")
  @Test
  @NeedsFreshDriver
  void canListenToJavascriptLogForABrowsingContext()
      throws ExecutionException, InterruptedException, TimeoutException {
    page = appServer.whereIs("/bidi/logEntryAdded.html");
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
  @NeedsFreshDriver
  void canListenToJavascriptErrorLogForABrowsingContext()
      throws ExecutionException, InterruptedException, TimeoutException {
    page = appServer.whereIs("/bidi/logEntryAdded.html");
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
  @NeedsFreshDriver
  void canListenToConsoleLogForMultipleBrowsingContexts() throws InterruptedException {
    page = appServer.whereIs("/bidi/logEntryAdded.html");
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
  @NeedsFreshDriver
  void canListenToJavascriptLogForMultipleBrowsingContexts() throws InterruptedException {
    page = appServer.whereIs("/bidi/logEntryAdded.html");
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
  @NeedsFreshDriver
  void canListenToJavascriptErrorLogForMultipleBrowsingContexts() throws InterruptedException {
    page = appServer.whereIs("/bidi/logEntryAdded.html");
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
  @NeedsFreshDriver
  void canListenToAnyTypeOfLogForMultipleBrowsingContexts() throws InterruptedException {
    page = appServer.whereIs("/bidi/logEntryAdded.html");
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
  @NeedsFreshDriver
  void canListenToLogsWithMultipleConsumers()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<JavascriptLogEntry> completableFuture1 = new CompletableFuture<>();
      logInspector.onJavaScriptLog(completableFuture1::complete);

      CompletableFuture<JavascriptLogEntry> completableFuture2 = new CompletableFuture<>();
      logInspector.onJavaScriptLog(completableFuture2::complete);

      page = appServer.whereIs("/bidi/logEntryAdded.html");
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
}
