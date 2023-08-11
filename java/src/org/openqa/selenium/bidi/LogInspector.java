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

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.log.BaseLogEntry;
import org.openqa.selenium.bidi.log.ConsoleLogEntry;
import org.openqa.selenium.bidi.log.FilterBy;
import org.openqa.selenium.bidi.log.GenericLogEntry;
import org.openqa.selenium.bidi.log.JavascriptLogEntry;
import org.openqa.selenium.bidi.log.Log;
import org.openqa.selenium.bidi.log.LogEntry;
import org.openqa.selenium.bidi.log.LogLevel;
import org.openqa.selenium.internal.Require;

public class LogInspector implements AutoCloseable {

  private final Set<String> browsingContextIds;

  private final BiDi bidi;

  public LogInspector(WebDriver driver) {
    this(new HashSet<>(), driver);
  }

  public LogInspector(String browsingContextId, WebDriver driver) {
    this(Collections.singleton(Require.nonNull("Browsing context id", browsingContextId)), driver);
  }

  public LogInspector(Set<String> browsingContextIds, WebDriver driver) {
    Require.nonNull("WebDriver", driver);
    Require.nonNull("Browsing context id list", browsingContextIds);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.bidi = ((HasBiDi) driver).getBiDi();
    this.browsingContextIds = browsingContextIds;
  }

  @Deprecated
  public void onConsoleLog(Consumer<ConsoleLogEntry> consumer) {
    Consumer<LogEntry> logEntryConsumer =
        logEntry -> logEntry.getConsoleLogEntry().ifPresent(consumer);

    addLogEntryAddedListener(logEntryConsumer);
  }

  public void onConsoleEntry(Consumer<ConsoleLogEntry> consumer) {
    Consumer<LogEntry> logEntryConsumer =
        logEntry -> logEntry.getConsoleLogEntry().ifPresent(consumer);

    addLogEntryAddedListener(logEntryConsumer);
  }

  public void onConsoleEntry(Consumer<ConsoleLogEntry> consumer, FilterBy filter) {
    Consumer<LogEntry> logEntryConsumer =
        logEntry ->
            logEntry
                .getConsoleLogEntry()
                .ifPresent(
                    entry -> {
                      if (filter.getLevel() != null && entry.getLevel() == filter.getLevel()) {
                        consumer.accept(entry);
                      }
                    });

    addLogEntryAddedListener(logEntryConsumer);
  }

  public void onJavaScriptLog(Consumer<JavascriptLogEntry> consumer) {
    Consumer<LogEntry> logEntryConsumer =
        logEntry -> logEntry.getJavascriptLogEntry().ifPresent(consumer);

    addLogEntryAddedListener(logEntryConsumer);
  }

  public void onJavaScriptLog(Consumer<JavascriptLogEntry> consumer, FilterBy filter) {
    Consumer<LogEntry> logEntryConsumer =
        logEntry ->
            logEntry
                .getJavascriptLogEntry()
                .ifPresent(
                    entry -> {
                      if (filter.getLevel() != null && entry.getLevel() == filter.getLevel()) {
                        consumer.accept(entry);
                      }
                    });

    addLogEntryAddedListener(logEntryConsumer);
  }

  public void onJavaScriptException(Consumer<JavascriptLogEntry> consumer) {
    Consumer<LogEntry> logEntryConsumer =
        logEntry ->
            logEntry
                .getJavascriptLogEntry()
                .ifPresent(
                    entry -> {
                      if (entry.getLevel() == LogLevel.ERROR) {
                        consumer.accept(entry);
                      }
                    });

    addLogEntryAddedListener(logEntryConsumer);
  }

  public void onGenericLog(Consumer<GenericLogEntry> consumer) {
    Consumer<LogEntry> logEntryConsumer =
        logEntry -> logEntry.getGenericLogEntry().ifPresent(consumer);

    addLogEntryAddedListener(logEntryConsumer);
  }

  public void onGenericLog(Consumer<GenericLogEntry> consumer, FilterBy filter) {
    Consumer<LogEntry> logEntryConsumer =
        logEntry ->
            logEntry
                .getGenericLogEntry()
                .ifPresent(
                    entry -> {
                      if (filter.getLevel() != null && entry.getLevel() == filter.getLevel()) {
                        consumer.accept(entry);
                      }
                    });

    addLogEntryAddedListener(logEntryConsumer);
  }

  public void onLog(Consumer<LogEntry> consumer) {
    addLogEntryAddedListener(consumer);
  }

  public void onLog(Consumer<LogEntry> consumer, FilterBy filter) {
    Consumer<LogEntry> logEntryConsumer =
        logEntry -> {
          AtomicReference<BaseLogEntry> baseLogEntry = new AtomicReference<>();

          logEntry.getGenericLogEntry().ifPresent(baseLogEntry::set);
          logEntry.getConsoleLogEntry().ifPresent(baseLogEntry::set);
          logEntry.getJavascriptLogEntry().ifPresent(baseLogEntry::set);

          if (filter.getLevel() != null && baseLogEntry.get().getLevel() == filter.getLevel()) {
            consumer.accept(logEntry);
          }
        };

    addLogEntryAddedListener(logEntryConsumer);
  }

  private void addLogEntryAddedListener(Consumer<LogEntry> consumer) {
    if (browsingContextIds.isEmpty()) {
      this.bidi.addListener(Log.entryAdded(), consumer);
    } else {
      this.bidi.addListener(browsingContextIds, Log.entryAdded(), consumer);
    }
  }

  @Override
  public void close() {
    this.bidi.clearListener(Log.entryAdded());
  }
}
