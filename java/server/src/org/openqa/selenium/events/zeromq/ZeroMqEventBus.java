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

import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.zeromq.ZContext;

/**
 * An {@link EventBus} backed by ZeroMQ.
 */
public class ZeroMqEventBus {

  private ZeroMqEventBus() {
    // Use the create method.
  }

  public static EventBus create(ZContext context, String publish, String subscribe, boolean bind) {
    if (bind) {
      return new BoundZmqEventBus(context, publish, subscribe);
    }
    return new UnboundZmqEventBus(context, publish, subscribe);
  }

  public static EventBus create(Config config) {
    String publish = config.get("events", "publish")
        .orElseThrow(() -> new IllegalArgumentException(
            "Unable to find address to publish events to."));

    String subscribe = config.get("events", "subscribe")
        .orElseThrow(() -> new IllegalArgumentException(
            "Unable to find address to subscribe for events from."));

    boolean bind = config.getBool("events", "bind").orElse(false);

    return create(new ZContext(), publish, subscribe, bind);
  }

}
