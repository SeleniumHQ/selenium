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

package org.openqa.selenium.docker;

import org.openqa.selenium.internal.Require;

/**
 * Models simple version strings. Does not attempt to be semver compatible,
 * and gleefully fails to handle non-numerical values, except accidentally.
 * This is sufficient for handling the version strings we care about from
 * Docker.
 */
class Version {

  private final String versionString;
  private final String[] segments;

  public Version(String versionString) {
    this.versionString = Require.nonNull("Version string", versionString);

    this.segments = versionString.split("\\.");
  }

  public boolean equalTo(Version other) {
    int max = Math.max(segments.length, other.segments.length);

    for (int i = 0; i < max; i++) {
      if (compare(segments, other.segments, i) != 0) {
        return false;
      }
    }

    return true;
  }

  public boolean isLessThan(Version other) {
    int max = Math.max(segments.length, other.segments.length);

    for (int i = 0; i < max; i++) {
      if (compare(segments, other.segments, i) > 0) {
        return false;
      }
    }

    return !equalTo(other);
  }

  public boolean isGreaterThan(Version other) {
    int max = Math.max(segments.length, other.segments.length);

    for (int i = 0; i < max; i++) {
      if (compare(segments, other.segments, i) < 0) {
        return false;
      }
    }

    return !equalTo(other);
  }

  public String toString() {
    return versionString;
  }

  // Returns a negative integer, zero, or a positive integer as the first
  // argument is less than, equal to, or greater than the second. We attempt
  // numerical comparisons first, and then a lexical comparison
  private int compare(String[] ours, String[] theirs, int index) {
    try {
      long mine = index < ours.length ? Long.parseLong(ours[index]) : 0L;
      long others = index < theirs.length ? Long.parseLong(theirs[index]) : 0L;

      return Long.compare(mine, others);
    } catch (NumberFormatException e) {
      String mine = index < ours.length ? ours[index] : "";
      if (mine == null) {
        mine = "";
      }
      String others = index < theirs.length ? theirs[index] : "";
      if (others == null) {
        others = "";
      }

      return mine.compareTo(others);
    }
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof Version)) {
      return false;
    }

    Version that = (Version) o;
    return this.equalTo(that);
  }

  @Override
  public int hashCode() {
    return versionString.hashCode();
  }
}
