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

package org.openqa.selenium.remote.server.scheduler;

import java.time.Duration;

public class RetryDelays {

  private RetryDelays() {
    // Utility class
  }

  public static RetryDelay immediately() {
    return after(Duration.ZERO);
  }

  public static RetryDelay after(Duration duration) {
    return () -> duration;
  }

  public static RetryDelay upTo(Duration maximumTimeout) {
    long remaining = maximumTimeout.toMillis();
    RetryDelay delay = immediately();

    long nextDelay = 500;
    long maxDelay = 5000;
    while (remaining > 0) {
      delay = delay.orElse(after(Duration.ofMillis(nextDelay)));
      remaining -= nextDelay;
      nextDelay = Math.min(maxDelay, nextDelay + 500);
    }

    return delay;
  }
}
