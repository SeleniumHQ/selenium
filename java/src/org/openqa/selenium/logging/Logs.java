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

package org.openqa.selenium.logging;

import java.util.Set;
import org.openqa.selenium.Beta;

/** Interface for providing logs. */
@Beta
public interface Logs {

  /**
   * Fetches available log entries for the given log type.
   *
   * <p>Note that log buffers are reset after each call, meaning that available log entries
   * correspond to those entries not yet returned for a given log type. In practice, this means that
   * this call will return the available log entries since the last call, or from the start of the
   * session.
   *
   * <p>For more info on enabling logging, look at {@link LoggingPreferences}.
   *
   * @param logType The log type.
   * @return Available log entries for the specified log type.
   */
  LogEntries get(String logType);

  /**
   * Queries for available log types.
   *
   * @return A set of available log types.
   */
  Set<String> getAvailableLogTypes();
}
