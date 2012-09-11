/*
Copyright 2011 Software Freedom Conservatory.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.android.library;

import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingHandler;
import org.openqa.selenium.logging.Logs;

import java.util.List;
import java.util.Set;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;

public class AndroidLogs implements Logs {

  public LogEntries get(String logType) {
    if (LogType.CLIENT.equals(logType)) {
      LoggingHandler loggingHandler = LoggingHandler.getInstance();
      List<LogEntry> entries = loggingHandler.getRecords();
      loggingHandler.flush();
      return new LogEntries(entries);
    }
    return new LogEntries(Lists.<LogEntry>newArrayList());
  }
  
  public Set<String> getAvailableLogTypes() {
    return ImmutableSet.<String>of(LogType.CLIENT);
  }
}
