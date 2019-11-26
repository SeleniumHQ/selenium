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

package org.openqa.selenium.events;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;

import com.google.common.collect.ImmutableSet;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.events.zeromq.ZeroMqEventBus;
import org.openqa.selenium.net.PortProber;
import org.zeromq.ZContext;

import java.util.Collection;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

@RunWith(Parameterized.class)
public class EventBusTest {

  @Parameterized.Parameters(name = "EventBus {0}")
  public static Collection<Supplier<EventBus>> buildEventBuses() {
    return ImmutableSet.of(
        () -> ZeroMqEventBus.create(
            new ZContext(),
            "inproc://bus-pub",
            "inproc://bus-sub",
            true),
        () -> ZeroMqEventBus.create(
            new ZContext(),
            "tcp://*:" + PortProber.findFreePort(),
            "tcp://*:" + PortProber.findFreePort(),
            true),
        () -> ZeroMqEventBus.create(
            new ZContext(),
            "tcp://localhost:" + PortProber.findFreePort(),
            "tcp://localhost:" + PortProber.findFreePort(),
            true),
        GuavaEventBus::new);
  }

  @Parameterized.Parameter
  public Supplier<EventBus> busSupplier;

  private EventBus bus;

  @Before
  public void getBus() {
    bus = busSupplier.get();
  }

  @After
  public void closeBus() {
    bus.close();
  }

  @Test(timeout = 4000)
  public void shouldBeAbleToPublishToAKnownTopic() throws InterruptedException {
    Type cheese = new Type("cheese");
    Event event = new Event(cheese, null);

    CountDownLatch latch = new CountDownLatch(1);
    bus.addListener(cheese, e -> latch.countDown());
    bus.fire(event);
    latch.await(1, SECONDS);

    assertThat(latch.getCount()).isEqualTo(0);
  }

  @Test(timeout = 4000)
  public void shouldNotReceiveEventsNotMeantForTheTopic() {
    AtomicInteger count = new AtomicInteger(0);
    bus.addListener(new Type("peas"), e -> count.incrementAndGet());

    bus.fire(new Event(new Type("cheese"), null));

    assertThat(count.get()).isEqualTo(0);
  }
}
