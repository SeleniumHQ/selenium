/*
Copyright 2012 Software Freedom Conservatory.

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

package org.openqa.selenium.logging;

public class LogEntriesChecks {

  /** 
   * Checks if there are overlapping entries in the given logs.
   * 
   * @param firstLog The first log.
   * @param secondLog The second log.
   * @return true if an overlapping entry is discovered, otherwise false.
   */
  public static boolean hasOverlappingLogEntries(LogEntries firstLog, LogEntries secondLog) {
    for (LogEntry firstEntry : firstLog) { 
      for (LogEntry secondEntry : secondLog) {
        if (firstEntry.getLevel().getName().equals(secondEntry.getLevel().getName()) &&
            firstEntry.getMessage().equals(secondEntry.getMessage()) &&
            firstEntry.getTimestamp() == secondEntry.getTimestamp()) {
          return true;
        }
      }
    }
    return false;
  }
}
