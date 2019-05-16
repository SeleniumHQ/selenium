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

package org.openqa.selenium.devtools;

import java.util.Objects;

public class Runtime {
  private Runtime() {
    // Models a CDP domain
  }

  public static class Timestamp {

    private long epochMillis;

    public Timestamp(long epochMillis) {
      this.epochMillis = epochMillis;
    }

    @Override
    public boolean equals(Object o) {
      if (!(o instanceof Timestamp)) {
        return false;
      }

      Timestamp that = (Timestamp) o;
      return this.epochMillis == that.epochMillis;
    }

    @Override
    public int hashCode() {
      return Objects.hash(epochMillis);
    }

    @Override
    public String toString() {
      return "" + epochMillis;
    }

    public long toMillis() {
      return epochMillis;
    }

    private static Timestamp fromJson(long timestamp) {
      return new Timestamp(timestamp);
    }

    public static Timestamp fromJson(Number timestamp) {
      return fromJson(timestamp.longValue());
    }

    private long toJson() {
      return epochMillis;
    }
  }
}
