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

package org.openqa.selenium.grid.log;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.logging.Formatter;
import java.util.logging.Level;
import java.util.logging.LogRecord;

/** Custom java.util.logging formatter providing compact output. */
public class TerseFormatter extends Formatter {

  /** The string to write at the beginning of all log headers (e.g. "[FINE core]") */
  private static final String PREFIX = "";

  /**
   * The string to write at the end of every log header (e.g. "[FINE core]"). It should includes the
   * spaces between the header and the message body.
   */
  private static final String SUFFIX = " - ";

  /**
   * Line separator string. This is the value of the line.separator property at the moment that the
   * TerseFormatter was created.
   */
  private final String lineSeparator = System.getProperty("line.separator");

  /*
   * DGF - These have to be compile time constants to be used with switch
   */
  private static final int FINE = 500; /* Derived from Level.FINE.intValue(); */
  private static final int INFO = 800; /* Derived from Level.INFO.intValue(); */
  private static final int WARNING = 900; /* Derived from Level.WARNING.intValue(); */
  private static final int SEVERE = 1000; /* Derived from Level.SEVERE.intValue(); */

  /**
   * Buffer for formatting messages. We will reuse this buffer in order to reduce memory
   * allocations.
   */
  private final StringBuilder buffer;

  private final SimpleDateFormat timestampFormatter;

  public TerseFormatter(String logTimestampFormat) {
    buffer = new StringBuilder();
    buffer.append(PREFIX);
    timestampFormatter = new SimpleDateFormat(logTimestampFormat);
  }

  /**
   * Format the given log record and return the formatted string.
   *
   * @param record the log record to be formatted.
   * @return a formatted log record
   */
  @Override
  public synchronized String format(final LogRecord record) {
    buffer.setLength(PREFIX.length());
    buffer.append(timestampFormatter.format(new Date(record.getMillis())));
    buffer.append(' ');
    buffer.append(levelNumberToCommonsLevelName(record.getLevel()));
    String[] parts = record.getSourceClassName().split("\\.");
    buffer.append(" [" + parts[parts.length - 1] + "." + record.getSourceMethodName() + "]");
    buffer.append(SUFFIX);
    buffer.append(formatMessage(record)).append(lineSeparator);
    if (record.getThrown() != null) {
      final StringWriter trace = new StringWriter();
      record.getThrown().printStackTrace(new PrintWriter(trace));
      buffer.append(trace);
    }

    return buffer.toString();
  }

  private String levelNumberToCommonsLevelName(Level level) {
    switch (level.intValue()) {
      case FINE:
        return "DEBUG";
      case INFO:
        return "INFO";
      case WARNING:
        return "WARN";
      case SEVERE:
        return "ERROR";
      default:
        return level.getLocalizedName();
    }
  }
}
