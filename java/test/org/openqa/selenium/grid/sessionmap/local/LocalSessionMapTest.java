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

package org.openqa.selenium.grid.sessionmap.local;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeRemovedEvent;
import org.openqa.selenium.grid.data.NodeRestartedEvent;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionClosedEvent;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

class LocalSessionMapTest {

  private LocalSessionMap sessionMap;
  private EventBus eventBus;
  private Tracer tracer;

  @BeforeEach
  void setUp() {
    tracer = DefaultTestTracer.createTracer();
    eventBus = new GuavaEventBus();
    sessionMap = new LocalSessionMap(tracer, eventBus);
  }

  @Test
  void shouldAddAndRetrieveSession() {
    SessionId sessionId = new SessionId("test-session-1");
    URI nodeUri = URI.create("http://localhost:5555");
    Session session = createSession(sessionId, nodeUri);

    boolean added = sessionMap.add(session);
    Session retrieved = sessionMap.get(sessionId);

    assertThat(added).isTrue();
    assertThat(retrieved).isEqualTo(session);
    assertThat(retrieved.getId()).isEqualTo(sessionId);
    assertThat(retrieved.getUri()).isEqualTo(nodeUri);
  }

  @Test
  void shouldThrowNoSuchSessionExceptionForUnknownSession() {
    SessionId unknownSessionId = new SessionId("unknown-session");

    assertThatThrownBy(() -> sessionMap.get(unknownSessionId))
        .isInstanceOf(NoSuchSessionException.class)
        .hasMessageContaining("Unable to find session with ID: " + unknownSessionId);
  }

  @Test
  void shouldRemoveSessionSuccessfully() {
    SessionId sessionId = new SessionId("test-session-2");
    URI nodeUri = URI.create("http://localhost:5555");
    Session session = createSession(sessionId, nodeUri);
    sessionMap.add(session);

    sessionMap.remove(sessionId);

    assertThatThrownBy(() -> sessionMap.get(sessionId)).isInstanceOf(NoSuchSessionException.class);
  }

  @Test
  void shouldHandleSessionClosedEvent() {
    SessionId sessionId = new SessionId("test-session-3");
    URI nodeUri = URI.create("http://localhost:5555");
    Session session = createSession(sessionId, nodeUri);
    sessionMap.add(session);

    eventBus.fire(new SessionClosedEvent(sessionId));

    assertThatThrownBy(() -> sessionMap.get(sessionId)).isInstanceOf(NoSuchSessionException.class);
  }

  @Test
  void shouldRemoveSessionsOnNodeRemovedEvent() {
    URI nodeUri = URI.create("http://localhost:5555");
    SessionId session1Id = new SessionId("session-1");
    SessionId session2Id = new SessionId("session-2");
    SessionId session3Id = new SessionId("session-3");

    Session session1 = createSession(session1Id, nodeUri);
    Session session2 = createSession(session2Id, nodeUri);
    Session session3 = createSession(session3Id, URI.create("http://localhost:6666"));

    sessionMap.add(session1);
    sessionMap.add(session2);
    sessionMap.add(session3);

    NodeStatus nodeStatus = createNodeStatus(nodeUri);

    eventBus.fire(new NodeRemovedEvent(nodeStatus));

    assertThatThrownBy(() -> sessionMap.get(session1Id)).isInstanceOf(NoSuchSessionException.class);
    assertThatThrownBy(() -> sessionMap.get(session2Id)).isInstanceOf(NoSuchSessionException.class);

    assertThat(sessionMap.get(session3Id)).isEqualTo(session3);
  }

  @Test
  void shouldRemoveSessionsOnNodeRestartedEvent() {
    URI nodeUri = URI.create("http://localhost:5555");
    SessionId session1Id = new SessionId("session-1");
    SessionId session2Id = new SessionId("session-2");
    SessionId session3Id = new SessionId("session-3");

    Session session1 = createSession(session1Id, nodeUri);
    Session session2 = createSession(session2Id, nodeUri);
    Session session3 = createSession(session3Id, URI.create("http://localhost:6666"));

    sessionMap.add(session1);
    sessionMap.add(session2);
    sessionMap.add(session3);

    NodeStatus previousNodeStatus = createNodeStatus(nodeUri);

    eventBus.fire(new NodeRestartedEvent(previousNodeStatus));

    assertThatThrownBy(() -> sessionMap.get(session1Id)).isInstanceOf(NoSuchSessionException.class);
    assertThatThrownBy(() -> sessionMap.get(session2Id)).isInstanceOf(NoSuchSessionException.class);

    assertThat(sessionMap.get(session3Id)).isEqualTo(session3);
  }

  @Test
  void shouldHandleConcurrentNodeEvents() throws InterruptedException {
    URI nodeUri1 = URI.create("http://localhost:5555");
    URI nodeUri2 = URI.create("http://localhost:6666");

    for (int i = 0; i < 10; i++) {
      sessionMap.add(createSession(new SessionId("node1-session-" + i), nodeUri1));
      sessionMap.add(createSession(new SessionId("node2-session-" + i), nodeUri2));
    }

    NodeStatus nodeStatus1 = createNodeStatus(nodeUri1);
    NodeStatus nodeStatus2 = createNodeStatus(nodeUri2);

    CountDownLatch latch = new CountDownLatch(2);
    ExecutorService executor = Executors.newFixedThreadPool(2);

    executor.submit(
        () -> {
          try {
            eventBus.fire(new NodeRemovedEvent(nodeStatus1));
          } finally {
            latch.countDown();
          }
        });

    executor.submit(
        () -> {
          try {
            eventBus.fire(new NodeRestartedEvent(nodeStatus2));
          } finally {
            latch.countDown();
          }
        });

    assertThat(latch.await(5, TimeUnit.SECONDS)).isTrue();

    for (int i = 0; i < 10; i++) {
      SessionId node1SessionId = new SessionId("node1-session-" + i);
      SessionId node2SessionId = new SessionId("node2-session-" + i);

      assertThatThrownBy(() -> sessionMap.get(node1SessionId))
          .isInstanceOf(NoSuchSessionException.class);
      assertThatThrownBy(() -> sessionMap.get(node2SessionId))
          .isInstanceOf(NoSuchSessionException.class);
    }

    executor.shutdown();
  }

  @Test
  void shouldHandleConcurrentSessionAccessDuringNodeEvents() throws InterruptedException {
    URI nodeUri = URI.create("http://localhost:5555");
    int sessionCount = 20;

    for (int i = 0; i < sessionCount; i++) {
      sessionMap.add(createSession(new SessionId("session-" + i), nodeUri));
    }

    NodeStatus nodeStatus = createNodeStatus(nodeUri);
    CountDownLatch startLatch = new CountDownLatch(1);
    CountDownLatch completeLatch = new CountDownLatch(sessionCount + 1);
    AtomicInteger successfulGets = new AtomicInteger(0);
    AtomicInteger noSuchSessionExceptions = new AtomicInteger(0);

    ExecutorService executor = Executors.newFixedThreadPool(sessionCount + 1);

    for (int i = 0; i < sessionCount; i++) {
      final int sessionIndex = i;
      executor.submit(
          () -> {
            try {
              startLatch.await();
              SessionId sessionId = new SessionId("session-" + sessionIndex);
              try {
                Session session = sessionMap.get(sessionId);
                if (session != null) {
                  successfulGets.incrementAndGet();
                }
              } catch (NoSuchSessionException e) {
                noSuchSessionExceptions.incrementAndGet();
              }
            } catch (InterruptedException e) {
              Thread.currentThread().interrupt();
            } finally {
              completeLatch.countDown();
            }
          });
    }

    executor.submit(
        () -> {
          try {
            startLatch.await();
            eventBus.fire(new NodeRemovedEvent(nodeStatus));
          } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
          } finally {
            completeLatch.countDown();
          }
        });

    startLatch.countDown();

    assertThat(completeLatch.await(10, TimeUnit.SECONDS)).isTrue();

    assertThat(successfulGets.get() + noSuchSessionExceptions.get()).isEqualTo(sessionCount);

    for (int i = 0; i < sessionCount; i++) {
      SessionId sessionId = new SessionId("session-" + i);
      assertThatThrownBy(() -> sessionMap.get(sessionId))
          .isInstanceOf(NoSuchSessionException.class);
    }

    executor.shutdown();
  }

  @Test
  void shouldHandleHighConcurrencyWithoutDeadlocks() throws InterruptedException {
    int nodeCount = 5;
    int sessionsPerNode = 10;
    int totalOperations = nodeCount * sessionsPerNode * 3; // add, get, remove operations

    CountDownLatch startLatch = new CountDownLatch(1);
    CountDownLatch completeLatch = new CountDownLatch(totalOperations);
    ExecutorService executor = Executors.newFixedThreadPool(20);

    for (int nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
      final URI nodeUri = URI.create("http://localhost:" + (5555 + nodeIndex));
      final NodeStatus nodeStatus = createNodeStatus(nodeUri);

      for (int sessionIndex = 0; sessionIndex < sessionsPerNode; sessionIndex++) {
        final int finalSessionIndex = sessionIndex;
        final SessionId sessionId = new SessionId("node" + nodeIndex + "-session-" + sessionIndex);
        final Session session = createSession(sessionId, nodeUri);

        executor.submit(
            () -> {
              try {
                startLatch.await();
                sessionMap.add(session);
              } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
              } finally {
                completeLatch.countDown();
              }
            });

        executor.submit(
            () -> {
              try {
                startLatch.await();
                Thread.sleep(10); // Small delay to allow add operations
                try {
                  sessionMap.get(sessionId);
                } catch (NoSuchSessionException e) {
                  // Expected in concurrent scenarios
                }
              } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
              } finally {
                completeLatch.countDown();
              }
            });

        executor.submit(
            () -> {
              try {
                startLatch.await();
                Thread.sleep(20); // Small delay to allow add/get operations
                if (finalSessionIndex == 0) { // Only fire node event once per node
                  eventBus.fire(new NodeRemovedEvent(nodeStatus));
                }
              } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
              } finally {
                completeLatch.countDown();
              }
            });
      }
    }

    startLatch.countDown();

    assertThat(completeLatch.await(30, TimeUnit.SECONDS)).isTrue();

    executor.shutdown();
  }

  @Test
  void shouldMaintainIndexConsistencyDuringConcurrentOperations() throws InterruptedException {
    URI nodeUri1 = URI.create("http://localhost:5555");
    URI nodeUri2 = URI.create("http://localhost:6666");
    int sessionsPerNode = 15;

    CountDownLatch startLatch = new CountDownLatch(1);
    CountDownLatch completeLatch =
        new CountDownLatch(sessionsPerNode * 4); // 2 nodes * 2 operations each
    ExecutorService executor = Executors.newFixedThreadPool(10);

    for (int i = 0; i < sessionsPerNode; i++) {
      final int sessionIndex = i;

      executor.submit(
          () -> {
            try {
              startLatch.await();
              SessionId sessionId = new SessionId("node1-session-" + sessionIndex);
              Session session = createSession(sessionId, nodeUri1);
              sessionMap.add(session);
            } catch (InterruptedException e) {
              Thread.currentThread().interrupt();
            } finally {
              completeLatch.countDown();
            }
          });

      executor.submit(
          () -> {
            try {
              startLatch.await();
              SessionId sessionId = new SessionId("node2-session-" + sessionIndex);
              Session session = createSession(sessionId, nodeUri2);
              sessionMap.add(session);
            } catch (InterruptedException e) {
              Thread.currentThread().interrupt();
            } finally {
              completeLatch.countDown();
            }
          });

      executor.submit(
          () -> {
            try {
              startLatch.await();
              Thread.sleep(50); // Allow add operations to complete
              SessionId sessionId = new SessionId("node1-session-" + sessionIndex);
              sessionMap.remove(sessionId);
            } catch (InterruptedException e) {
              Thread.currentThread().interrupt();
            } finally {
              completeLatch.countDown();
            }
          });

      executor.submit(
          () -> {
            try {
              startLatch.await();
              Thread.sleep(100); // Allow add operations to complete
              SessionId sessionId = new SessionId("node2-session-" + sessionIndex);
              if (sessionIndex == sessionsPerNode - 1) { // Only fire event once
                NodeStatus nodeStatus = createNodeStatus(nodeUri2);
                eventBus.fire(new NodeRemovedEvent(nodeStatus));
              }
            } catch (InterruptedException e) {
              Thread.currentThread().interrupt();
            } finally {
              completeLatch.countDown();
            }
          });
    }

    startLatch.countDown();

    assertThat(completeLatch.await(15, TimeUnit.SECONDS)).isTrue();

    for (int i = 0; i < sessionsPerNode; i++) {
      SessionId node1SessionId = new SessionId("node1-session-" + i);
      SessionId node2SessionId = new SessionId("node2-session-" + i);

      assertThatThrownBy(() -> sessionMap.get(node1SessionId))
          .isInstanceOf(NoSuchSessionException.class);
      assertThatThrownBy(() -> sessionMap.get(node2SessionId))
          .isInstanceOf(NoSuchSessionException.class);
    }

    executor.shutdown();
  }

  @Test
  void shouldHandleSessionUpdateWithDifferentUri() {
    SessionId sessionId = new SessionId("test-session-update");
    URI originalUri = URI.create("http://localhost:5555");
    URI newUri = URI.create("http://localhost:6666");

    Session originalSession = createSession(sessionId, originalUri);
    Session updatedSession = createSession(sessionId, newUri);

    sessionMap.add(originalSession);
    sessionMap.add(updatedSession); // This should update the existing session

    Session retrieved = sessionMap.get(sessionId);
    assertThat(retrieved).isEqualTo(updatedSession);
    assertThat(retrieved.getUri()).isEqualTo(newUri);
  }

  @Test
  void shouldHandleSessionsWithDummyUri() {
    SessionId sessionId = new SessionId("dummy-uri-session");
    Session sessionWithDummyUri = createSessionWithNullUri(sessionId);

    boolean added = sessionMap.add(sessionWithDummyUri);
    Session retrieved = sessionMap.get(sessionId);

    assertThat(added).isTrue();
    assertThat(retrieved).isEqualTo(sessionWithDummyUri);
    assertThat(retrieved.getUri()).isEqualTo(URI.create("http://localhost:0"));
  }

  @Test
  void shouldNotRemoveSessionsWithDummyUriOnNodeEvents() {
    SessionId sessionId = new SessionId("dummy-uri-session");
    Session sessionWithDummyUri = createSessionWithNullUri(sessionId);
    sessionMap.add(sessionWithDummyUri);

    URI nodeUri = URI.create("http://localhost:5555");
    NodeStatus nodeStatus = createNodeStatus(nodeUri);

    eventBus.fire(new NodeRemovedEvent(nodeStatus));

    Session retrieved = sessionMap.get(sessionId);
    assertThat(retrieved).isEqualTo(sessionWithDummyUri);
  }

  @Test
  void shouldUpdateUriIndexWhenSessionIsAdded() {
    URI nodeUri1 = URI.create("http://localhost:5555");
    URI nodeUri2 = URI.create("http://localhost:6666");

    SessionId session1Id = new SessionId("session-1");
    SessionId session2Id = new SessionId("session-2");
    SessionId session3Id = new SessionId("session-3");

    Session session1 = createSession(session1Id, nodeUri1);
    Session session2 = createSession(session2Id, nodeUri1); // Same URI as session1
    Session session3 = createSession(session3Id, nodeUri2); // Different URI

    sessionMap.add(session1);
    sessionMap.add(session2);
    sessionMap.add(session3);

    NodeStatus nodeStatus1 = createNodeStatus(nodeUri1);
    NodeStatus nodeStatus2 = createNodeStatus(nodeUri2);

    SessionId testSessionId = new SessionId("test-verification");
    Session testSession = createSession(testSessionId, nodeUri1);
    sessionMap.add(testSession);

    eventBus.fire(new NodeRemovedEvent(nodeStatus1));

    assertThatThrownBy(() -> sessionMap.get(session1Id)).isInstanceOf(NoSuchSessionException.class);
    assertThatThrownBy(() -> sessionMap.get(session2Id)).isInstanceOf(NoSuchSessionException.class);
    assertThatThrownBy(() -> sessionMap.get(testSessionId))
        .isInstanceOf(NoSuchSessionException.class);

    assertThat(sessionMap.get(session3Id)).isEqualTo(session3);
  }

  @Test
  void shouldUpdateUriIndexWhenSessionIsRemoved() {
    URI nodeUri = URI.create("http://localhost:5555");
    SessionId session1Id = new SessionId("session-1");
    SessionId session2Id = new SessionId("session-2");

    Session session1 = createSession(session1Id, nodeUri);
    Session session2 = createSession(session2Id, nodeUri);

    sessionMap.add(session1);
    sessionMap.add(session2);

    sessionMap.remove(session1Id);

    NodeStatus nodeStatus = createNodeStatus(nodeUri);
    eventBus.fire(new NodeRemovedEvent(nodeStatus));

    assertThatThrownBy(() -> sessionMap.get(session1Id)).isInstanceOf(NoSuchSessionException.class);

    assertThatThrownBy(() -> sessionMap.get(session2Id)).isInstanceOf(NoSuchSessionException.class);
  }

  @Test
  void shouldUpdateUriIndexWhenSessionUriChanges() {
    SessionId sessionId = new SessionId("session-uri-change");
    URI originalUri = URI.create("http://localhost:5555");
    URI newUri = URI.create("http://localhost:6666");

    Session originalSession = createSession(sessionId, originalUri);
    Session updatedSession = createSession(sessionId, newUri);

    sessionMap.add(originalSession);
    sessionMap.add(updatedSession); // This should update the URI index

    NodeStatus originalNodeStatus = createNodeStatus(originalUri);
    NodeStatus newNodeStatus = createNodeStatus(newUri);

    eventBus.fire(new NodeRemovedEvent(originalNodeStatus));

    Session retrieved = sessionMap.get(sessionId);
    assertThat(retrieved.getUri()).isEqualTo(newUri);

    eventBus.fire(new NodeRemovedEvent(newNodeStatus));

    assertThatThrownBy(() -> sessionMap.get(sessionId)).isInstanceOf(NoSuchSessionException.class);
  }

  @Test
  void shouldMaintainUriIndexConsistencyDuringConcurrentUpdates() throws InterruptedException {
    URI nodeUri1 = URI.create("http://localhost:5555");
    URI nodeUri2 = URI.create("http://localhost:6666");
    int sessionsPerUri = 10;

    CountDownLatch startLatch = new CountDownLatch(1);
    CountDownLatch completeLatch =
        new CountDownLatch(sessionsPerUri * 4); // add, update, remove, verify
    ExecutorService executor = Executors.newFixedThreadPool(8);

    for (int i = 0; i < sessionsPerUri; i++) {
      final int sessionIndex = i;

      executor.submit(
          () -> {
            try {
              startLatch.await();
              SessionId sessionId = new SessionId("uri-test-" + sessionIndex);
              Session session = createSession(sessionId, nodeUri1);
              sessionMap.add(session);
            } catch (InterruptedException e) {
              Thread.currentThread().interrupt();
            } finally {
              completeLatch.countDown();
            }
          });

      executor.submit(
          () -> {
            try {
              startLatch.await();
              Thread.sleep(10); // Small delay to allow add operation
              SessionId sessionId = new SessionId("uri-test-" + sessionIndex);
              Session updatedSession = createSession(sessionId, nodeUri2);
              sessionMap.add(updatedSession);
            } catch (InterruptedException e) {
              Thread.currentThread().interrupt();
            } finally {
              completeLatch.countDown();
            }
          });

      if (sessionIndex % 2 == 0) {
        executor.submit(
            () -> {
              try {
                startLatch.await();
                Thread.sleep(20); // Allow add/update operations
                SessionId sessionId = new SessionId("uri-test-" + sessionIndex);
                sessionMap.remove(sessionId);
              } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
              } finally {
                completeLatch.countDown();
              }
            });
      } else {
        completeLatch.countDown(); // Account for skipped operation
      }

      executor.submit(
          () -> {
            try {
              startLatch.await();
              Thread.sleep(30); // Allow other operations to complete
              SessionId sessionId = new SessionId("uri-test-" + sessionIndex);
              try {
                sessionMap.get(sessionId);
              } catch (NoSuchSessionException e) {
                // Expected for removed sessions
              }
            } catch (InterruptedException e) {
              Thread.currentThread().interrupt();
            } finally {
              completeLatch.countDown();
            }
          });
    }

    startLatch.countDown();

    assertThat(completeLatch.await(15, TimeUnit.SECONDS)).isTrue();

    NodeStatus nodeStatus1 = createNodeStatus(nodeUri1);
    NodeStatus nodeStatus2 = createNodeStatus(nodeUri2);

    eventBus.fire(new NodeRemovedEvent(nodeStatus1));
    eventBus.fire(new NodeRemovedEvent(nodeStatus2));

    for (int i = 0; i < sessionsPerUri; i++) {
      SessionId sessionId = new SessionId("uri-test-" + i);
      assertThatThrownBy(() -> sessionMap.get(sessionId))
          .isInstanceOf(NoSuchSessionException.class);
    }

    executor.shutdown();
  }

  private Session createSession(SessionId sessionId, URI nodeUri) {
    Capabilities stereotype = new ImmutableCapabilities("browserName", "chrome");
    Capabilities capabilities =
        new ImmutableCapabilities("browserName", "chrome", "version", "latest");
    return new Session(sessionId, nodeUri, stereotype, capabilities, Instant.now());
  }

  private Session createSessionWithNullUri(SessionId sessionId) {
    Capabilities stereotype = new ImmutableCapabilities("browserName", "chrome");
    Capabilities capabilities =
        new ImmutableCapabilities("browserName", "chrome", "version", "latest");
    URI dummyUri = URI.create("http://localhost:0");
    return new Session(sessionId, dummyUri, stereotype, capabilities, Instant.now());
  }

  private NodeStatus createNodeStatus(URI nodeUri) {
    NodeId nodeId = new NodeId(UUID.randomUUID());
    return new NodeStatus(
        nodeId,
        nodeUri,
        1,
        Set.of(
            new Slot(
                new SlotId(nodeId, UUID.randomUUID()),
                new ImmutableCapabilities("browserName", "chrome"),
                Instant.now(),
                null)),
        Availability.UP,
        Duration.ofSeconds(30),
        Duration.ofSeconds(30),
        "1.0.0",
        Map.of());
  }
}
