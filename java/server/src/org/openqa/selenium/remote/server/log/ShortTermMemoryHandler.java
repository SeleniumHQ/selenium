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


package org.openqa.selenium.remote.server.log;

import java.io.StringWriter;
import java.util.ArrayList;
import java.util.logging.Formatter;
import java.util.logging.Level;
import java.util.logging.LogRecord;


/**
 * RestishHandler who keeps in memory the last N records as is so that then can be retrieved "as is" on
 * demand.
 */
public class ShortTermMemoryHandler extends java.util.logging.Handler {

  private final LogRecord[] lastRecords;
  private final int capacity;
  private final Formatter formatter;
  private int minimumLevel;
  private int currentIndex;

  /**
   * New handler keeping track of the last N records above a specific log level.
   *
   * @param capacity Maximum number of records to keep in memory (i.e. N).
   * @param minimumLevel Only keep track of records whose level is equal or greater than
   *        minimumLevel.
   * @param formatter Formmatter to use when retrieving log messages.
   */
  public ShortTermMemoryHandler(int capacity, Level minimumLevel, Formatter formatter) {
    this.capacity = capacity;
    this.formatter = formatter;
    this.minimumLevel = minimumLevel.intValue();
    this.lastRecords = new LogRecord[capacity];
    this.currentIndex = 0;
  }


  @Override
  public synchronized void publish(LogRecord record) {
    if (record.getLevel().intValue() < minimumLevel) {
      return;
    }
    lastRecords[currentIndex] = record;
    currentIndex++;
    if (currentIndex >= capacity) {
      currentIndex = 0;
    }
  }

  @Override
  public synchronized void flush() {
    /* NOOP */
  }

  @Override
  public synchronized void close() throws SecurityException {
    for (int i = 0; i < capacity; i++) {
      lastRecords[i] = null;
    }
  }

  public synchronized LogRecord[] records() {
    final ArrayList<LogRecord> validRecords;

    validRecords = new ArrayList<>(capacity);
    for (int i = currentIndex; i < capacity; i++) {
      if (null != lastRecords[i]) {
        validRecords.add(lastRecords[i]);
      }
    }
    for (int i = 0; i < currentIndex; i++) {
      if (null != lastRecords[i]) {
        validRecords.add(lastRecords[i]);
      }
    }
    return validRecords.toArray(new LogRecord[validRecords.size()]);
  }

  public synchronized String formattedRecords() {
    final StringWriter writer;

    writer = new StringWriter();
    for (LogRecord record : records()) {
      writer.append(formatter.format(record));
      writer.append("\n");
    }
    return writer.toString();
  }

}
