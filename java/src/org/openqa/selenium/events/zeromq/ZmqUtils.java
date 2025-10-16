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

package org.openqa.selenium.events.zeromq;

import java.time.Duration;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.zeromq.ZMQ;

class ZmqUtils {

  private static final Logger LOG = Logger.getLogger(ZmqUtils.class.getName());

  // Minimum heartbeat interval: 1 second
  private static final long MIN_HEARTBEAT_MS = 1_000L;
  // Maximum heartbeat interval: ~24 days (to prevent overflow when multiplied by 6)
  private static final long MAX_HEARTBEAT_MS = Integer.MAX_VALUE / 6;

  private ZmqUtils() {}

  /**
   * Configures ZeroMQ heartbeat settings on a socket to prevent stale connections.
   *
   * <p>The heartbeat interval is clamped between 1 second and ~24 days to prevent integer overflow
   * and ensure reasonable values. If the provided duration is outside this range, it will be
   * adjusted and a warning will be logged.
   *
   * @param socket The ZMQ socket to configure
   * @param heartbeatPeriod The heartbeat interval duration
   * @param socketType The socket type name for logging (e.g., "SUB", "PUB", "XPUB", "XSUB")
   */
  static void configureHeartbeat(ZMQ.Socket socket, Duration heartbeatPeriod, String socketType) {
    if (heartbeatPeriod != null && !heartbeatPeriod.isZero() && !heartbeatPeriod.isNegative()) {
      long heartbeatMs = heartbeatPeriod.toMillis();
      long clampedHeartbeatMs = clampHeartbeatInterval(heartbeatMs, socketType);

      // Safe to cast to int now
      int heartbeatIvl = (int) clampedHeartbeatMs;
      int heartbeatTimeout = heartbeatIvl * 3;
      int heartbeatTtl = heartbeatIvl * 6;

      socket.setHeartbeatIvl(heartbeatIvl);
      socket.setHeartbeatTimeout(heartbeatTimeout);
      socket.setHeartbeatTtl(heartbeatTtl);

      LOG.info(
          String.format(
              "ZMQ %s socket heartbeat configured: interval=%ds, timeout=%ds, ttl=%ds",
              socketType, heartbeatIvl / 1000, heartbeatTimeout / 1000, heartbeatTtl / 1000));
    }
  }

  /**
   * Clamps the heartbeat interval to safe bounds and logs warnings if adjustments are made.
   *
   * @param heartbeatMs The heartbeat interval in milliseconds
   * @param socketType The socket type for logging
   * @return The clamped heartbeat interval
   */
  private static long clampHeartbeatInterval(long heartbeatMs, String socketType) {
    if (heartbeatMs < MIN_HEARTBEAT_MS) {
      logHeartbeatClampWarning(socketType, heartbeatMs, MIN_HEARTBEAT_MS, "below minimum");
      return MIN_HEARTBEAT_MS;
    }
    if (heartbeatMs > MAX_HEARTBEAT_MS) {
      logHeartbeatClampWarning(socketType, heartbeatMs, MAX_HEARTBEAT_MS, "exceeds maximum");
      return MAX_HEARTBEAT_MS;
    }
    return heartbeatMs;
  }

  /**
   * Logs a warning when the heartbeat interval is clamped.
   *
   * @param socketType The socket type
   * @param originalMs The original interval value in milliseconds
   * @param clampedMs The clamped interval value in milliseconds
   * @param reason The reason for clamping
   */
  private static void logHeartbeatClampWarning(
      String socketType, long originalMs, long clampedMs, String reason) {
    LOG.log(
        Level.WARNING,
        String.format(
            "ZMQ %s socket heartbeat interval %ds is %s, clamping to %ds",
            socketType, originalMs / 1000, reason, clampedMs / 1000));
  }
}
