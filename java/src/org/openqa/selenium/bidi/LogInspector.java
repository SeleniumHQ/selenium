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

import org.openqa.selenium.WebDriver;

import org.openqa.selenium.bidi.log.BaseLogEntry;
import org.openqa.selenium.bidi.log.ConsoleLogEntry;
import org.openqa.selenium.bidi.log.GenericLogEntry;
import org.openqa.selenium.bidi.log.JavascriptLogEntry;
import org.openqa.selenium.bidi.log.Log;
import org.openqa.selenium.bidi.log.LogEntry;
import org.openqa.selenium.internal.Require;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.function.Consumer;

public class LogInspector implements AutoCloseable {

  private final List<Consumer<ConsoleLogEntry>> consoleLogListeners = new LinkedList<>();
  private final List<Consumer<JavascriptLogEntry>> jsExceptionLogListeners = new LinkedList<>();
  private final List<Consumer<JavascriptLogEntry>> jsLogListeners = new LinkedList<>();
  private final List<Consumer<GenericLogEntry>> genericLogListeners = new LinkedList<>();
  private final Set<String> browsingContextIds;

  private final BiDi bidi;

  public LogInspector(WebDriver driver) {
    this(new HashSet<>(), driver);
  }

  public LogInspector(String browsingContextId, WebDriver driver) {
    Require.nonNull("WebDriver", driver);
    Require.nonNull("Browsing context id", browsingContextId);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.bidi = ((HasBiDi) driver).getBiDi();
    this.browsingContextIds = Collections.singleton(browsingContextId);
    initializeLogListener();
  }

  public LogInspector(Set<String> browsingContextIds, WebDriver driver) {
    Require.nonNull("WebDriver", driver);
    Require.nonNull("Browsing context id list", browsingContextIds);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.bidi = ((HasBiDi) driver).getBiDi();
    this.browsingContextIds = browsingContextIds;
    initializeLogListener();
  }

  private void initializeLogListener() {
    Consumer<LogEntry> logEntryConsumer = logEntry -> {
      logEntry.getConsoleLogEntry().ifPresent(
        consoleLogEntry -> consoleLogListeners.forEach(
          consumer -> consumer.accept(consoleLogEntry)));

      logEntry.getJavascriptLogEntry().ifPresent(
        jsLogEntry -> {
          if (jsLogEntry.getLevel() == BaseLogEntry.LogLevel.ERROR) {
            jsExceptionLogListeners.forEach(
              consumer -> consumer.accept(jsLogEntry));
          }
          jsLogListeners.forEach(
            consumer -> consumer.accept(jsLogEntry));
        }
      );

      logEntry.getGenericLogEntry().ifPresent(
        genericLogEntry -> genericLogListeners.forEach(
          consumer -> consumer.accept(genericLogEntry)));

    };

    if (browsingContextIds.isEmpty()) {
      this.bidi.addListener(Log.entryAdded(), logEntryConsumer);
    } else {
      this.bidi.addListener(browsingContextIds, Log.entryAdded(), logEntryConsumer);
    }
  }

  public void onConsoleLog(Consumer<ConsoleLogEntry> consumer) {
    consoleLogListeners.add(consumer);
  }

  public void onJavaScriptLog(Consumer<JavascriptLogEntry> consumer) {
    jsLogListeners.add(consumer);
  }

  public void onJavaScriptException(Consumer<JavascriptLogEntry> consumer) {
    jsExceptionLogListeners.add(consumer);
  }

  public void onGenericLog(Consumer<GenericLogEntry> consumer) {
    genericLogListeners.add(consumer);
  }

  public void onLog(Consumer<LogEntry> consumer) {
    this.bidi.addListener(Log.entryAdded(), consumer);
  }

  @Override
  public void close() {
    this.bidi.clearListener(Log.entryAdded());
  }
}
