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

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.openqa.selenium.testing.Safely.safelyCall;

public class BiDiLogTest {

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
  public void canListenToConsoleLog()
    throws InterruptedException, ExecutionException, TimeoutException {
    page = server.whereIs("/bidi/logEntryAdded.html");

    driver.get(page);

    CompletableFuture<LogEntry> future = new CompletableFuture<>();

    try (BiDi biDi = driver.getBiDi()) {

      biDi.addListener(Log.entryAdded(), future::complete);

      driver.findElement(By.id("consoleLog")).click();
      LogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getConsoleLogEntry().isPresent()).isTrue();

      ConsoleLogEntry consoleLogEntry = logEntry.getConsoleLogEntry().get();
      assertThat(consoleLogEntry.getText()).isEqualTo("Hello, world!");
      assertThat(consoleLogEntry.getRealm()).isNull();
      assertThat(consoleLogEntry.getArgs().size()).isEqualTo(1);
      assertThat(consoleLogEntry.getType()).isEqualTo("console");
      assertThat(consoleLogEntry.getLevel()).isEqualTo(BaseLogEntry.LogLevel.INFO);
      assertThat(consoleLogEntry.getMethod()).isEqualTo("log");
      assertThat(consoleLogEntry.getStackTrace()).isNull();
    }
  }

  @Test
  public void canListenToJavascriptLog()
    throws InterruptedException, ExecutionException, TimeoutException {
    page = server.whereIs("/bidi/logEntryAdded.html");

    driver.get(page);

    CompletableFuture<LogEntry> future = new CompletableFuture<>();

    try (BiDi biDi = driver.getBiDi()) {
      biDi.addListener(Log.entryAdded(), future::complete);

      driver.findElement(By.id("jsException")).click();
      LogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getJavascriptLogEntry().isPresent()).isTrue();

      GenericLogEntry javascriptLogEntry = logEntry.getJavascriptLogEntry().get();
      assertThat(javascriptLogEntry.getText()).isEqualTo("Error: Not working");
      assertThat(javascriptLogEntry.getType()).isEqualTo("javascript");
      assertThat(javascriptLogEntry.getLevel()).isEqualTo(BaseLogEntry.LogLevel.ERROR);
    }
  }

  @Test
  public void canRetrieveStacktraceForALog()
    throws InterruptedException, ExecutionException, TimeoutException {
    page = server.whereIs("/bidi/logEntryAdded.html");

    driver.get(page);

    CompletableFuture<LogEntry> future = new CompletableFuture<>();

    try (BiDi biDi = driver.getBiDi()) {

      biDi.addListener(Log.entryAdded(), future::complete);

      driver.findElement(By.id("logWithStacktrace")).click();
      LogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      assertThat(logEntry.getJavascriptLogEntry().isPresent()).isTrue();
      StackTrace stackTrace = logEntry.getJavascriptLogEntry().get().getStackTrace();
      assertThat(stackTrace).isNotNull();
      assertThat(stackTrace.getCallFrames().size()).isEqualTo(4);
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
