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

package org.openqa.selenium.bidi.protocol.module;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.bidi.protocol.log.ConsoleLogEntry;
import org.openqa.selenium.bidi.protocol.log.Entry;
import org.openqa.selenium.bidi.protocol.log.JavascriptLogEntry;
import org.openqa.selenium.bidi.protocol.log.Level;
import org.openqa.selenium.bidi.protocol.script.StringValue;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;

class LogModuleTest extends JupiterTestBase {

  private String page;

  @Test
  @NeedsFreshDriver
  void canListenToConsoleLogEntry() throws Exception {
    Log log = new Log(driver);
    CompletableFuture<ConsoleLogEntry> future = new CompletableFuture<>();
    log.subscribe(
        Log.ENTRY_ADDED,
        entry -> {
          if (entry instanceof ConsoleLogEntry) {
            future.complete((ConsoleLogEntry) entry);
          }
        });

    page = appServer.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);
    driver.findElement(By.id("consoleLog")).click();

    ConsoleLogEntry logEntry = future.get(5, TimeUnit.SECONDS);
    assertThat(logEntry.getSource().getContext()).isPresent();
    assertThat(logEntry.getSource().getRealm()).isNotNull();
    assertThat(logEntry.getText()).isEqualTo("Hello, world!");
    assertThat(logEntry.getArgs()).hasSize(1);
    assertThat(logEntry.getArgs().get(0)).isInstanceOf(StringValue.class);
    assertThat(logEntry.getType()).isEqualTo("console");
    assertThat(logEntry.getLevel()).isEqualTo(Level.INFO);
    assertThat(logEntry.getMethod()).isEqualTo("log");
  }

  @Test
  @NeedsFreshDriver
  void canListenToJavascriptLogEntry() throws Exception {
    Log log = new Log(driver);
    CompletableFuture<JavascriptLogEntry> future = new CompletableFuture<>();
    log.subscribe(
        Log.ENTRY_ADDED,
        entry -> {
          if (entry instanceof JavascriptLogEntry) {
            future.complete((JavascriptLogEntry) entry);
          }
        });

    page = appServer.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);
    driver.findElement(By.id("jsException")).click();

    JavascriptLogEntry logEntry = future.get(5, TimeUnit.SECONDS);
    assertThat(logEntry.getSource().getContext()).isPresent();
    assertThat(logEntry.getSource().getRealm()).isNotNull();
    assertThat(logEntry.getText()).isEqualTo("Error: Not working");
    assertThat(logEntry.getType()).isEqualTo("javascript");
    assertThat(logEntry.getLevel()).isEqualTo(Level.ERROR);
  }

  @Test
  @NeedsFreshDriver
  void canRetrieveStackTraceForALog() throws Exception {
    Log log = new Log(driver);
    CompletableFuture<JavascriptLogEntry> future = new CompletableFuture<>();
    log.subscribe(
        Log.ENTRY_ADDED,
        entry -> {
          if (entry instanceof JavascriptLogEntry) {
            future.complete((JavascriptLogEntry) entry);
          }
        });

    page = appServer.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);
    driver.findElement(By.id("logWithStacktrace")).click();

    JavascriptLogEntry logEntry = future.get(5, TimeUnit.SECONDS);
    assertThat(logEntry.getStackTrace()).isPresent();
    assertThat(logEntry.getStackTrace().get().getCallFrames()).isNotEmpty();
  }

  @Test
  @NeedsFreshDriver
  void canListenToLogEntriesWithMultipleConsumers() throws Exception {
    Log log = new Log(driver);
    CompletableFuture<Entry> future1 = new CompletableFuture<>();
    log.subscribe(Log.ENTRY_ADDED, future1::complete);

    CompletableFuture<Entry> future2 = new CompletableFuture<>();
    log.subscribe(Log.ENTRY_ADDED, future2::complete);

    page = appServer.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);
    driver.findElement(By.id("consoleLog")).click();

    Entry entry1 = future1.get(5, TimeUnit.SECONDS);
    Entry entry2 = future2.get(5, TimeUnit.SECONDS);

    assertThat(entry1).isInstanceOf(ConsoleLogEntry.class);
    assertThat(entry2).isInstanceOf(ConsoleLogEntry.class);
    assertThat(((ConsoleLogEntry) entry1).getText()).isEqualTo("Hello, world!");
    assertThat(((ConsoleLogEntry) entry2).getText()).isEqualTo("Hello, world!");
  }

  @Test
  @NeedsFreshDriver
  void canUnsubscribeFromLogEntries() throws Exception {
    Log log = new Log(driver);
    AtomicInteger callCount = new AtomicInteger();
    CompletableFuture<Entry> firstEvent = new CompletableFuture<>();
    String subscriptionId =
        log.subscribe(
            Log.ENTRY_ADDED,
            entry -> {
              callCount.incrementAndGet();
              firstEvent.complete(entry);
            });

    page = appServer.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);
    driver.findElement(By.id("consoleLog")).click();

    assertThat(firstEvent.get(5, TimeUnit.SECONDS)).isInstanceOf(ConsoleLogEntry.class);
    assertThat(callCount.get()).isEqualTo(1);

    log.unsubscribe(subscriptionId);

    // A second, still-active subscription acts as a synchronization point: once its event
    // arrives, the browser has finished dispatching for this click, so it's safe to check whether
    // the unsubscribed callback's counter moved.
    CompletableFuture<Entry> sentinel = new CompletableFuture<>();
    log.subscribe(Log.ENTRY_ADDED, sentinel::complete);
    driver.findElement(By.id("consoleLog")).click();
    sentinel.get(5, TimeUnit.SECONDS);

    assertThat(callCount.get()).isEqualTo(1);
  }
}
