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
import java.util.logging.Logger;
import org.zeromq.ZMQ;

/** Utility methods for ZeroMQ socket configuration. */
class ZmqUtils {

  private static final Logger LOG = Logger.getLogger(ZmqUtils.class.getName());

  private ZmqUtils() {
    // Utility class
  }

  /**
   * Configures ZeroMQ heartbeat settings on a socket to prevent stale connections.
   *
   * @param socket The ZMQ socket to configure
   * @param heartbeatPeriod The heartbeat interval duration
   * @param socketType The socket type name for logging (e.g., "SUB", "PUB", "XPUB", "XSUB")
   */
  static void configureHeartbeat(ZMQ.Socket socket, Duration heartbeatPeriod, String socketType) {
    if (heartbeatPeriod != null && !heartbeatPeriod.isZero() && !heartbeatPeriod.isNegative()) {
      int heartbeatIvl = (int) heartbeatPeriod.toMillis();
      socket.setHeartbeatIvl(heartbeatIvl);
      socket.setHeartbeatTimeout(heartbeatIvl * 3);
      socket.setHeartbeatTtl(heartbeatIvl * 6);
      LOG.info(
          String.format(
              "ZMQ %s socket heartbeat configured: interval=%dms, timeout=%dms, ttl=%dms",
              socketType, heartbeatIvl, heartbeatIvl * 3, heartbeatIvl * 6));
    }
  }
}
