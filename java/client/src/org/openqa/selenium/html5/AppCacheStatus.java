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

package org.openqa.selenium.html5;

/**
 * Represents the application cache status.
 */
public enum AppCacheStatus {
  UNCACHED(0),
  IDLE(1),
  CHECKING(2),
  DOWNLOADING(3),
  UPDATE_READY(4),
  OBSOLETE(5);

  private final int value;

  private AppCacheStatus(int value) {
    this.value = value;
  }

  public int value() {
    return value;
  }

  /**
   * Gets the AppCacheStatus for the given int value.
   *
   * @param value The input value
   * @return {@link AppCacheStatus} The corresponding appcache status
   */
  public static AppCacheStatus getEnum(int value) {
    for (AppCacheStatus status : AppCacheStatus.values()) {
      if (value == status.value()) {
        return status;
      }
    }
    return null;
  }

  public static AppCacheStatus getEnum(String value) {
    for (AppCacheStatus status : AppCacheStatus.values()) {
      if (status.toString().equalsIgnoreCase(value)) {
        return status;
      }
    }
    return null;
  }


}
