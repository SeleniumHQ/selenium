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

package org.openqa.selenium.grid.distributor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.NodeHeartBeatEvent;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.testing.TestSessionFactory;

public class HeartBeatTest extends DistributorTestBase {

  @Test
  void shouldStartHeartBeatOnNodeStart() {
    EventBus bus = new GuavaEventBus();

    LocalNode node =
        LocalNode.builder(tracer, bus, routableUri, routableUri, registrationSecret)
            .add(
                caps,
                new TestSessionFactory(
                    (id, c) -> new Session(id, nodeUri, stereotype, c, Instant.now())))
            .heartbeatPeriod(Duration.ofSeconds(1))
            .build();

    AtomicBoolean heartbeatStarted = new AtomicBoolean();
    CountDownLatch latch = new CountDownLatch(1);

    bus.addListener(
        NodeHeartBeatEvent.listener(
            nodeStatus -> {
              if (node.getId().equals(nodeStatus.getNodeId())) {
                latch.countDown();
                heartbeatStarted.set(true);
              }
            }));

    boolean eventFiredAndListenedTo = false;
    try {
      eventFiredAndListenedTo = latch.await(30, TimeUnit.SECONDS);
    } catch (InterruptedException e) {
      fail("Thread Interrupted");
    }

    assertThat(eventFiredAndListenedTo).isTrue();
    assertThat(heartbeatStarted.get()).isTrue();
  }
}
