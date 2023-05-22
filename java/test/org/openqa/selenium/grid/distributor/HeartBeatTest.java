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
