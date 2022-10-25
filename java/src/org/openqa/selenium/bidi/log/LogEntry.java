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

import java.util.Optional;

// @see <a href="https://w3c.github.io/webdriver-bidi/#types-log-logentry">https://w3c.github.io/webdriver-bidi/#types-log-logentry</a>
public class LogEntry {

  private final Optional<GenericLogEntry> genericLogEntry;
  private final Optional<ConsoleLogEntry> consoleLogEntry;
  private final Optional<GenericLogEntry> javascriptLogEntry;

  public LogEntry(Optional<GenericLogEntry> genericLogEntry,
                  Optional<ConsoleLogEntry> consoleLogEntry,
                  Optional<GenericLogEntry> javascriptLogEntry) {
    this.genericLogEntry = genericLogEntry;
    this.consoleLogEntry = consoleLogEntry;
    this.javascriptLogEntry = javascriptLogEntry;
  }

  public Optional<GenericLogEntry> getGenericLogEntry() {
    return genericLogEntry;
  }

  public Optional<ConsoleLogEntry> getConsoleLogEntry() {
    return consoleLogEntry;
  }

  public Optional<GenericLogEntry> getJavascriptLogEntry() {
    return javascriptLogEntry;
  }
}