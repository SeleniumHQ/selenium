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
package org.openqa.selenium.bidi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.TextMessage;
import org.openqa.selenium.remote.http.WebSocket;

@Tag("UnitTests")
class BiDiUnsubscribeTest {

  private static final Json JSON = new Json();
  private static final Event<Object> REALM_CREATED =
      new Event<>("script.realmCreated", params -> params);
  private static final Event<Object> REALM_DESTROYED =
      new Event<>("script.realmDestroyed", params -> params);
  private static final String REALM_CREATED_FRAME =
      "{\"type\": \"event\", \"method\": \"script.realmCreated\", \"params\": {\"realm\": \"r1\"}}";

  private WebSocket.Listener listener;

  @Test
  void clearedListenerDoesNotReceiveEventsArrivingDuringUnsubscribe() throws Exception {
    CountDownLatch delivered = new CountDownLatch(1);
    Connection connection =
        connect(
            (id, socketListener) -> {
              socketListener.onText(REALM_CREATED_FRAME);
              awaitQuietly(delivered);
              socketListener.onText(success(id));
            });
    connection.addListener("sub-1", REALM_CREATED, event -> delivered.countDown());

    new BiDi(connection, Duration.ofSeconds(5)).clearListener(REALM_CREATED);

    assertThat(delivered.getCount()).isOne();
    assertThat(connection.isEventSubscribed(REALM_CREATED)).isFalse();
  }

  @Test
  void removedListenerDoesNotReceiveEventsArrivingDuringUnsubscribe() throws Exception {
    CountDownLatch delivered = new CountDownLatch(1);
    Connection connection =
        connect(
            (id, socketListener) -> {
              socketListener.onText(REALM_CREATED_FRAME);
              awaitQuietly(delivered);
              socketListener.onText(success(id));
            });
    connection.addListener("sub-1", REALM_CREATED, event -> delivered.countDown());

    new BiDi(connection, Duration.ofSeconds(5)).removeListener("sub-1");

    assertThat(delivered.getCount()).isOne();
    assertThat(connection.isSubscribed("sub-1")).isFalse();
  }

  @Test
  void keepsListenerWhenTheRemoteEndRejectsUnsubscribe() {
    Connection connection = connect((id, socketListener) -> socketListener.onText(error(id)));
    connection.addListener("sub-1", REALM_CREATED, event -> {});
    BiDi bidi = new BiDi(connection, Duration.ofSeconds(5));

    assertThatThrownBy(() -> bidi.clearListener(REALM_CREATED));
    assertThat(connection.isEventSubscribed(REALM_CREATED)).isTrue();

    assertThatThrownBy(() -> bidi.removeListener("sub-1"));
    assertThat(connection.isSubscribed("sub-1")).isTrue();
  }

  @Test
  void clearDuringARejectedUnsubscribeStillUnsubscribes() throws Exception {
    assertCallDuringRejectedUnsubscribeIsHonoured(bidi -> bidi.clearListener(REALM_CREATED));
  }

  @Test
  void removeDuringARejectedUnsubscribeStillUnsubscribes() throws Exception {
    assertCallDuringRejectedUnsubscribeIsHonoured(bidi -> bidi.removeListener("sub-1"));
  }

  @Test
  void closeDuringARejectedUnsubscribeStillClearsListeners() throws Exception {
    assertCallDuringRejectedUnsubscribeIsHonoured(BiDi::close);
  }

  @Test
  void addListenerDoesNotSubscribeWhileAnUnsubscribeIsInFlight() throws Exception {
    AtomicBoolean unsubscribing = new AtomicBoolean();
    AtomicBoolean subscribedDuringUnsubscribe = new AtomicBoolean();
    AtomicReference<BiDi> bidi = new AtomicReference<>();
    AtomicReference<Thread> adding = new AtomicReference<>();
    Connection connection =
        connectHandling(
            (frame, socketListener) -> {
              long id = ((Number) frame.get("id")).longValue();
              if ("session.subscribe".equals(frame.get("method"))) {
                subscribedDuringUnsubscribe.compareAndSet(false, unsubscribing.get());
                socketListener.onText(subscribed(id, "sub-2"));
              } else if ("session.unsubscribe".equals(frame.get("method"))) {
                unsubscribing.set(true);
                adding.set(
                    startAndAwaitBlocked(() -> bidi.get().addListener(REALM_CREATED, e -> {})));
                unsubscribing.set(false);
                socketListener.onText(success(id));
              }
            });
    connection.addListener("sub-1", REALM_CREATED, event -> {});
    bidi.set(new BiDi(connection, Duration.ofSeconds(5)));

    bidi.get().clearListener(REALM_CREATED);
    adding.get().join(5000);

    assertThat(subscribedDuringUnsubscribe).isFalse();
    assertThat(connection.isSubscribed("sub-2")).isTrue();
  }

  @Test
  void handlerCanClearAnUnsubscribedEventWhenNoOtherChangeIsInProgress() throws Exception {
    Connection connection = connect((id, socketListener) -> socketListener.onText(success(id)));
    BiDi bidi = new BiDi(connection, Duration.ofSeconds(5));
    CountDownLatch cleared = new CountDownLatch(1);
    connection.addListener(
        "sub-1",
        REALM_CREATED,
        event -> {
          bidi.clearListener(REALM_DESTROYED);
          cleared.countDown();
        });

    listener.onText(REALM_CREATED_FRAME);

    assertThat(cleared.await(5, TimeUnit.SECONDS)).isTrue();
  }

  @Test
  void handlerChangingSubscriptionsDuringAConcurrentClearFailsInsteadOfDeadlocking()
      throws Exception {
    Connection connection = connect((id, socketListener) -> socketListener.onText(success(id)));
    BiDi bidi = new BiDi(connection, Duration.ofSeconds(5));
    CountDownLatch handlerRunning = new CountDownLatch(1);
    CountDownLatch handlerFinished = new CountDownLatch(1);
    AtomicReference<Thread> clearing = new AtomicReference<>();
    AtomicReference<Throwable> handlerFailure = new AtomicReference<>();
    connection.addListener(
        "sub-1",
        REALM_CREATED,
        event -> {
          handlerRunning.countDown();
          // The concurrent clear now holds the subscription lock and waits for this handler to
          // release the callbacks it is being run from
          awaitBlocked(awaitSet(clearing));
          try {
            bidi.clearListener(REALM_DESTROYED);
          } catch (RuntimeException e) {
            handlerFailure.set(e);
          } finally {
            handlerFinished.countDown();
          }
        });

    listener.onText(REALM_CREATED_FRAME);
    assertThat(handlerRunning.await(5, TimeUnit.SECONDS)).isTrue();
    Thread thread = new Thread(() -> bidi.clearListener(REALM_CREATED));
    thread.start();
    clearing.set(thread);

    assertThat(handlerFinished.await(5, TimeUnit.SECONDS)).isTrue();
    assertThat(handlerFailure.get()).isInstanceOf(BiDiException.class);
    thread.join(5000);
    assertThat(connection.isEventSubscribed(REALM_CREATED)).isFalse();
  }

  @Test
  void handlerForOneConnectionWaitsForAChangeInProgressOnAnother() throws Exception {
    Connection handling = connect((id, socketListener) -> socketListener.onText(success(id)));
    WebSocket.Listener handlingSocket = listener;
    AtomicReference<Thread> handler = new AtomicReference<>();
    CountDownLatch unsubscribing = new CountDownLatch(1);
    Connection changing =
        connect(
            (id, socketListener) -> {
              unsubscribing.countDown();
              awaitBlocked(awaitSet(handler));
              socketListener.onText(success(id));
            });
    changing.addListener("sub-2", REALM_CREATED, event -> {});
    BiDi otherSession = new BiDi(changing, Duration.ofSeconds(5));
    CountDownLatch handlerFinished = new CountDownLatch(1);
    AtomicReference<Throwable> handlerFailure = new AtomicReference<>();
    handling.addListener(
        "sub-1",
        REALM_CREATED,
        event -> {
          try {
            assertThat(unsubscribing.await(5, TimeUnit.SECONDS)).isTrue();
            handler.set(Thread.currentThread());
            otherSession.clearListener(REALM_DESTROYED);
          } catch (Throwable e) {
            handlerFailure.set(e);
          } finally {
            handlerFinished.countDown();
          }
        });
    Thread clearing = new Thread(() -> otherSession.clearListener(REALM_CREATED));
    clearing.start();

    handlingSocket.onText(REALM_CREATED_FRAME);

    assertThat(handlerFinished.await(5, TimeUnit.SECONDS)).isTrue();
    assertThat(handlerFailure.get()).isNull();
    clearing.join(5000);
    assertThat(changing.isEventSubscribed(REALM_CREATED)).isFalse();
  }

  // A clear, remove or close that overlaps a rejected unsubscribe must not be undone when the
  // rejected call puts its callbacks back
  private void assertCallDuringRejectedUnsubscribeIsHonoured(Consumer<BiDi> overlappingCall)
      throws InterruptedException {
    AtomicInteger unsubscribes = new AtomicInteger();
    AtomicReference<BiDi> bidi = new AtomicReference<>();
    AtomicReference<Thread> overlapping = new AtomicReference<>();
    Connection connection =
        connect(
            (id, socketListener) -> {
              if (unsubscribes.getAndIncrement() > 0) {
                socketListener.onText(success(id));
                return;
              }
              overlapping.set(startAndAwaitBlocked(() -> overlappingCall.accept(bidi.get())));
              socketListener.onText(error(id));
            });
    connection.addListener("sub-1", REALM_CREATED, event -> {});
    bidi.set(new BiDi(connection, Duration.ofSeconds(5)));

    assertThatThrownBy(() -> bidi.get().clearListener(REALM_CREATED));
    overlapping.get().join(5000);

    assertThat(connection.isEventSubscribed(REALM_CREATED)).isFalse();
    assertThat(connection.isSubscribed("sub-1")).isFalse();
  }

  private Connection connect(BiConsumer<Long, WebSocket.Listener> onUnsubscribe) {
    return connectHandling(
        (frame, socketListener) -> {
          if ("session.unsubscribe".equals(frame.get("method"))) {
            onUnsubscribe.accept(((Number) frame.get("id")).longValue(), socketListener);
          }
        });
  }

  private Connection connectHandling(
      BiConsumer<Map<String, Object>, WebSocket.Listener> onCommand) {
    WebSocket socket =
        new WebSocket() {
          @Override
          public WebSocket send(Message message) {
            onCommand.accept(JSON.toType(((TextMessage) message).text(), Json.MAP_TYPE), listener);
            return this;
          }

          @Override
          public void close() {}
        };
    return new Connection(
        new HttpClient() {
          @Override
          public WebSocket openSocket(HttpRequest request, WebSocket.Listener l) {
            listener = l;
            return socket;
          }

          @Override
          public HttpResponse execute(HttpRequest request) {
            throw new UnsupportedOperationException("execute");
          }
        },
        "ws://localhost:4444/session/1/se/bidi");
  }

  // Gives a wrongly delivered event time to reach the listener before the unsubscribe completes
  private static void awaitQuietly(CountDownLatch latch) {
    try {
      latch.await(500, TimeUnit.MILLISECONDS);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
  }

  // Runs a call that should be held back by the in-flight unsubscribe, returning once it is
  // waiting, or once it has wrongly finished first
  private static Thread startAndAwaitBlocked(Runnable call) {
    Thread thread = new Thread(call);
    thread.start();
    awaitBlocked(thread);
    return thread;
  }

  private static void awaitBlocked(Thread thread) {
    long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);
    while (System.nanoTime() < deadline) {
      Thread.State state = thread.getState();
      if (state == Thread.State.WAITING
          || state == Thread.State.BLOCKED
          || state == Thread.State.TERMINATED) {
        return;
      }
      Thread.onSpinWait();
    }
    throw new AssertionError(thread + " neither blocked nor finished: " + thread.getState());
  }

  private static <T> T awaitSet(AtomicReference<T> reference) {
    long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);
    while (reference.get() == null) {
      if (System.nanoTime() > deadline) {
        throw new AssertionError("Timed out waiting for a value");
      }
      Thread.onSpinWait();
    }
    return reference.get();
  }

  private static String subscribed(long id, String subscription) {
    return "{\"type\": \"success\", \"id\": "
        + id
        + ", \"result\": {\"subscription\": \""
        + subscription
        + "\"}}";
  }

  private static String success(long id) {
    return "{\"type\": \"success\", \"id\": " + id + ", \"result\": {}}";
  }

  private static String error(long id) {
    return "{\"type\": \"error\", \"id\": "
        + id
        + ", \"error\": \"invalid argument\", \"message\": \"nope\"}";
  }
}
