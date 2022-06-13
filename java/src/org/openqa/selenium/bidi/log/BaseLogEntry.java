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

// @see <a href="https://w3c.github.io/webdriver-bidi/#types-log-logentry">https://w3c.github.io/webdriver-bidi/#types-log-logentry</a>
public class BaseLogEntry {

  private final LogLevel level;
  private final String text;
  private final long timestamp;
  private final StackTrace stackTrace;

  public LogLevel getLevel() {
    return level;
  }

  public String getText() {
    return text;
  }

  public long getTimestamp() {
    return timestamp;
  }

  public StackTrace getStackTrace() {
    return stackTrace;
  }

  public BaseLogEntry(LogLevel level,
                      String text,
                      long timestamp,
                      StackTrace stackTrace) {
    this.level = level;
    this.text = text;
    this.timestamp = timestamp;
    this.stackTrace = stackTrace;
  }

  enum LogLevel {
    DEBUG("debug"),
    ERROR("error"),
    INFO("info"),
    WARNING("warning");

    private final String level;

    LogLevel(String level) {
      this.level = level;
    }

    @Override
    public String toString() {
      return level;
    }
  }
}
