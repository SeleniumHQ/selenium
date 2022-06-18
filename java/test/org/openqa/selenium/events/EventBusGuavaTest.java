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

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.openqa.selenium.events.local.GuavaEventBus;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;

public class EventBusGuavaTest {
  private EventBus bus;

  @BeforeEach
  public void getBus() {
    bus = new GuavaEventBus();
  }

  @AfterEach
  public void closeBus() {
    bus.close();
  }

  @Test
  @Timeout(4)
  public void shouldBeAbleToPublishToAKnownTopic() throws InterruptedException {
    EventName cheese = new EventName("cheese");
    Event event = new Event(cheese, null);

    CountDownLatch latch = new CountDownLatch(1);
    bus.addListener(new EventListener<>(cheese, Object.class, obj -> latch.countDown()));
    bus.fire(event);
    latch.await(1, SECONDS);

    assertThat(latch.getCount()).isEqualTo(0);
  }

  @Test
  @Timeout(4)
  public void shouldNotReceiveEventsNotMeantForTheTopic() {
    AtomicInteger count = new AtomicInteger(0);
    bus.addListener(new EventListener<>(new EventName("peas"), Object.class, obj -> count.incrementAndGet()));

    bus.fire(new Event(new EventName("cheese"), null));

    assertThat(count.get()).isEqualTo(0);
  }

  @Test
  public void shouldBeAbleToFireEventsInParallel() throws InterruptedException {
    int maxCount = 100;
    EventName name = new EventName("cheese");

    CountDownLatch count = new CountDownLatch(maxCount);
    bus.addListener(new EventListener<>(name, Object.class, obj -> count.countDown()));

    ExecutorService executor = Executors.newCachedThreadPool();
    try {
      for (int i = 0; i < maxCount; i++) {
        executor.submit(() -> bus.fire(new Event(name, "")));
      }

      assertThat(count.await(20, SECONDS)).describedAs(count.toString()).isTrue();
    } finally {
      executor.shutdownNow();
    }
  }
}
