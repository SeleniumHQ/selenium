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

package org.openqa.selenium.devtools.network.model;

import java.time.Instant;
import java.util.Objects;

public class MonotonicTime {

  private Instant timestamp;

  public static MonotonicTime parse(Number nextNumber) {
    MonotonicTime monotonicTime = new MonotonicTime();
    monotonicTime.setTimeStamp(nextNumber);
    return monotonicTime;
  }

  public Instant getTimeStamp() {
    return timestamp;
  }

  private void setTimeStamp(Number timeStamp) {
    Objects.requireNonNull(timeStamp,"'timestamp' is require for MonotonicTime");
    this.timestamp = Instant.ofEpochSecond(timeStamp.longValue());
  }
}
