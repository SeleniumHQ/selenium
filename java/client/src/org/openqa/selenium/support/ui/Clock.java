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


package org.openqa.selenium.support.ui;

/**
 * A simple encapsulation to allowing timing
 */
public interface Clock {

  /**
   * @return The current time in milliseconds since epoch time.
   * @see System#currentTimeMillis()
   */
  long now();

  /**
   * Computes a point of time in the future.
   *
   * @param durationInMillis The point in the future, in milliseconds relative to the {@link #now()
   *        current time}.
   * @return A timestamp representing a point in the future.
   */
  long laterBy(long durationInMillis);

  /**
   * Tests if a point in time occurs before the {@link #now() current time}.
   *
   * @param endInMillis The timestamnp to check.
   * @return Whether the given timestamp represents a point in time before the current time.
   */
  boolean isNowBefore(long endInMillis);

}
