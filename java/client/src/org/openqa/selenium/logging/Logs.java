/*
Copyright 2007-2011 WebDriver committers

Portions copyright 2011 Software Freedom Conservatory

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

/**
 * Logs's interface.
 */
public interface Logs {

  /**
   * Fetches the logs for the givem log type.
   * 
   * For more info on enabling logging, look at {@link LoggingPreferences}.
   *
   * @param logType String. Can be any of the values in {@link LogType}.
   * @return all log entries for the specified logtype if enabled. Returns null
   *     if the log type is unknown by the dtiver.
   */
  LogEntries get(String logType);
}
