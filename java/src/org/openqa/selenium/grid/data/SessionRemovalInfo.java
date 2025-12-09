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

package org.openqa.selenium.grid.data;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;

public class SessionRemovalInfo {
  private final Instant removedAt;
  private final String reason;
  private final URI nodeUri;

  public SessionRemovalInfo(String reason, URI nodeUri) {
    this.removedAt = Instant.now();
    this.reason = reason;
    this.nodeUri = nodeUri;
  }

  @Override
  public String toString() {
    Duration elapsed = Duration.between(removedAt, Instant.now());
    long seconds = Math.max(elapsed.toSeconds(), 0);
    String timeAgo = seconds == 1 ? "1 second ago" : seconds + " seconds ago";

    return String.format(
        "removed at %s (%s), reason: %s, node: %s",
        removedAt, timeAgo, reason, nodeUri != null ? nodeUri : "unknown");
  }
}
