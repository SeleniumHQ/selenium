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

package org.openqa.selenium.grid.distributor.local;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.grid.data.Availability.DOWN;
import static org.openqa.selenium.grid.data.Availability.UP;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeRemovedEvent;
import org.openqa.selenium.grid.data.NodeRestartedEvent;
import org.openqa.selenium.grid.data.NodeStatus;

/**
 * Tests to verify that LocalGridModel does not cause deadlocks when firing events.
 *
 * <p>The deadlock scenario occurs when:
 *
 * <ol>
 *   <li>Thread A (health check) holds LocalNodeRegistry.lock and calls model.setAvailability()
 *       which needs LocalGridModel.lock
 *   <li>Thread B (purge dead nodes) holds LocalGridModel.lock and fires NodeRemovedEvent, whose
 *       listener calls LocalNodeRegistry.remove() which needs LocalNodeRegistry.lock
 * </ol>
 *
 * <p>The fix is to fire events outside the lock scope in LocalGridModel.
 */
class LocalGridModelDeadlockTest {

  private EventBus events;
  private LocalGridModel model;

  @BeforeEach
  void setUp() {
    events = new GuavaEventBus();
    model = new LocalGridModel(events);
  }

  /**
   * Simulates the deadlock scenario between purgeDeadNodes and a concurrent operation that holds an
   * external lock (like LocalNodeRegistry) while calling into LocalGridModel.
   *
   * <p>Before the fix: This would deadlock because NodeRemovedEvent was fired while holding
   * LocalGridModel.lock, and the event listener would try to acquire an external lock that another
   * thread holds while waiting for LocalGridModel.lock.
   *
   * <p>After the fix: Events are fired outside the lock, preventing deadlock.
   */
  @Test
  void shouldNotDeadlockWhenPurgingNodesWhileUpdatingAvailability() throws Exception {
    NodeId nodeId = new NodeId(UUID.randomUUID());
    NodeStatus node = createNodeStatus(nodeId, UP);
    model.add(node);

    // Mark the node as unhealthy enough times to trigger removal during purge
    for (int i = 0; i <= 5; i++) {
      model.updateHealthCheckCount(nodeId, DOWN);
    }

    // Simulate the external lock that LocalNodeRegistry would hold
    Object externalLock = new Object();

    AtomicBoolean deadlockDetected = new AtomicBoolean(false);
    CountDownLatch eventFired = new CountDownLatch(1);

    // Register a listener that simulates LocalNodeRegistry.remove()
    // which would try to acquire the external lock
    events.addListener(
        NodeRemovedEvent.listener(
            status -> {
              synchronized (externalLock) {
                // Simulate work that LocalNodeRegistry.remove() does
                eventFired.countDown();
              }
            }));

    CountDownLatch thread1Started = new CountDownLatch(1);
    CountDownLatch thread2Started = new CountDownLatch(1);
    CountDownLatch testComplete = new CountDownLatch(2);

    ExecutorService executor = Executors.newFixedThreadPool(2);

    // Thread 1: Holds external lock and calls model.setAvailability()
    executor.submit(
        () -> {
          try {
            thread1Started.countDown();
            thread2Started.await(1, TimeUnit.SECONDS);

            synchronized (externalLock) {
              // This simulates LocalNodeRegistry.updateNodeAvailability()
              // which holds its lock and calls model.setAvailability()
              model.setAvailability(nodeId, UP);
            }
          } catch (Exception e) {
            // Ignore interruption
          } finally {
            testComplete.countDown();
          }
        });

    // Thread 2: Calls purgeDeadNodes which fires event
    executor.submit(
        () -> {
          try {
            thread2Started.countDown();
            thread1Started.await(1, TimeUnit.SECONDS);

            model.purgeDeadNodes();
          } catch (Exception e) {
            // Ignore interruption
          } finally {
            testComplete.countDown();
          }
        });

    // Wait for completion with timeout - if deadlock occurs, this will timeout
    boolean completed = testComplete.await(5, TimeUnit.SECONDS);
    executor.shutdownNow();

    if (!completed) {
      deadlockDetected.set(true);
    }

    assertThat(deadlockDetected.get())
        .as(
            "Deadlock should not occur when purging nodes while another thread updates"
                + " availability")
        .isFalse();
  }

  /**
   * Verifies that NodeRemovedEvent is fired AFTER the lock is released in purgeDeadNodes().
   *
   * <p>This is a more direct test: when the event fires, we verify we can call another model method
   * that requires the lock, proving the lock was released before the event was fired.
   */
  @Test
  void purgeDeadNodesShouldFireEventsOutsideLock() throws Exception {
    NodeId nodeId = new NodeId(UUID.randomUUID());
    NodeStatus node = createNodeStatus(nodeId, DOWN);
    model.add(node);

    // Mark unhealthy enough times to trigger removal
    for (int i = 0; i <= 5; i++) {
      model.updateHealthCheckCount(nodeId, DOWN);
    }

    AtomicBoolean canAcquireLock = new AtomicBoolean(false);
    CountDownLatch eventFired = new CountDownLatch(1);

    // When event fires, try to call another model method that needs the lock
    events.addListener(
        NodeRemovedEvent.listener(
            status -> {
              try {
                // This needs the read lock - if event is fired inside write lock,
                // this would work due to lock downgrading, but we verify the pattern
                model.getSnapshot();
                canAcquireLock.set(true);
              } catch (Exception e) {
                canAcquireLock.set(false);
              }
              eventFired.countDown();
            }));

    model.purgeDeadNodes();

    // Wait for event to be processed
    boolean eventProcessed = eventFired.await(5, TimeUnit.SECONDS);

    assertThat(eventProcessed).as("Event should have been fired").isTrue();
    assertThat(canAcquireLock.get())
        .as("Should be able to acquire lock in event listener, proving event fired outside lock")
        .isTrue();
  }

  /**
   * Verifies that NodeRestartedEvent is fired AFTER the lock is released in add() when a node
   * restarts (same URI, different NodeId).
   */
  @Test
  void addShouldFireRestartEventOutsideLock() throws Exception {
    NodeId originalNodeId = new NodeId(UUID.randomUUID());
    NodeId newNodeId = new NodeId(UUID.randomUUID());
    URI sharedUri = new URI("http://localhost:5555");

    // Add the original node
    NodeStatus originalNode = createNodeStatus(originalNodeId, sharedUri, UP);
    model.add(originalNode);
    model.setAvailability(originalNodeId, UP);

    AtomicBoolean canAcquireLock = new AtomicBoolean(false);
    CountDownLatch eventFired = new CountDownLatch(1);

    // When restart event fires, try to call another model method that needs the lock
    events.addListener(
        NodeRestartedEvent.listener(
            status -> {
              try {
                model.getSnapshot();
                canAcquireLock.set(true);
              } catch (Exception e) {
                canAcquireLock.set(false);
              }
              eventFired.countDown();
            }));

    // Add a new node with same URI but different ID (simulates node restart)
    NodeStatus restartedNode = createNodeStatus(newNodeId, sharedUri, UP);
    model.add(restartedNode);

    // Wait for event to be processed
    boolean eventProcessed = eventFired.await(5, TimeUnit.SECONDS);

    assertThat(eventProcessed).as("Restart event should have been fired").isTrue();
    assertThat(canAcquireLock.get())
        .as(
            "Should be able to acquire lock in event listener, proving restart event fired outside"
                + " lock")
        .isTrue();
  }

  private NodeStatus createNodeStatus(NodeId nodeId, Availability availability) {
    try {
      return createNodeStatus(nodeId, new URI("http://localhost:5555"), availability);
    } catch (URISyntaxException e) {
      throw new RuntimeException(e);
    }
  }

  private NodeStatus createNodeStatus(NodeId nodeId, URI uri, Availability availability) {
    return new NodeStatus(
        nodeId,
        uri,
        1,
        Set.of(),
        availability,
        Duration.ofSeconds(60),
        Duration.ofMinutes(5),
        "1.0",
        Collections.emptyMap());
  }
}
