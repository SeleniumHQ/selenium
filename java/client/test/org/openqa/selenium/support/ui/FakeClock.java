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

import java.time.Instant;
import java.time.ZoneId;
import java.util.Objects;

/**
 * @deprecated Either extend {@link java.time.Clock} or use
 *   {@link java.time.Clock#fixed(Instant, ZoneId)} for a fixed clock.
 */
@Deprecated
public class FakeClock extends java.time.Clock implements Clock {
  private final ZoneId zoneId;
  private long now = 500000;

  public FakeClock() {
    this(ZoneId.systemDefault());
  }

  private FakeClock(ZoneId zoneId) {
    this.zoneId = Objects.requireNonNull(zoneId);
  }

  public void timePasses(int millisInASecond) {
    now = now + millisInASecond;
  }

  @Deprecated
  public long laterBy(long durationInMillis) {
    return now + durationInMillis;
  }

  @Deprecated
  public boolean isNowBefore(long endInMillis) {
    return now < endInMillis;
  }

  @Deprecated
  public long now() {
    return now;
  }

  @Override
  public ZoneId getZone() {
    return zoneId;
  }

  @Override
  public java.time.Clock withZone(ZoneId zone) {
    return new FakeClock(zone);
  }

  @Override
  public Instant instant() {
    return Instant.ofEpochMilli(now);
  }
}
