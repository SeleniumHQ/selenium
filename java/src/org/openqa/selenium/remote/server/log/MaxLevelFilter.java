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

import java.util.logging.Filter;
import java.util.logging.Level;
import java.util.logging.LogRecord;

/**
 * java.util.logging Filter providing finer grain control over what is logged, beyond the control
 * provided by log levels.
 * <p>
 * This filter will log all log records whose level is equal or lower than a maximum level.
 */
public class MaxLevelFilter implements Filter {

  private final Level maxLevel;

  public MaxLevelFilter(Level maxLevel) {
    this.maxLevel = maxLevel;
  }

  @Override
  public boolean isLoggable(LogRecord record) {
    return record.getLevel().intValue() <= maxLevel.intValue();
  }

}
