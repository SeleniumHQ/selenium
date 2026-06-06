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

package org.openqa.selenium.grid.node;

import static org.assertj.core.api.Assertions.assertThat;

import io.netty.channel.embedded.EmbeddedChannel;
import io.netty.handler.codec.http.websocketx.BinaryWebSocketFrame;
import io.netty.handler.codec.http.websocketx.CloseWebSocketFrame;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import java.net.URI;
import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.WebSocket;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;

class NodeDirectForwardingListenerTest {

  private static final Secret SECRET = new Secret("test");

  @Test
  void framesArrivingBeforeHandshakeAreBufferedAndDrainInOrder() {
    SessionId sessionId = new SessionId(UUID.randomUUID());
    AtomicInteger heartbeats = new AtomicInteger();

    ProxyNodeWebsockets.DirectForwardingListener listener =
        new ProxyNodeWebsockets.DirectForwardingListener(
            new NoopNode(),
            id -> heartbeats.incrementAndGet(),
            sessionId,
            new AtomicBoolean(false),
            new NoopHttpClient(),
            new AtomicBoolean(false));

    listener.onText("first");
    listener.onBinary(new byte[] {7, 8, 9});

    EmbeddedChannel channel = new EmbeddedChannel();
    listener.onUpgrade(channel);

    Object first = channel.readOutbound();
    Object second = channel.readOutbound();

    assertThat(first).isInstanceOf(TextWebSocketFrame.class);
    assertThat(((TextWebSocketFrame) first).text()).isEqualTo("first");
    assertThat(second).isInstanceOf(BinaryWebSocketFrame.class);
    assertThat(((BinaryWebSocketFrame) second).content().readableBytes()).isEqualTo(3);

    // Heartbeats fire per frame regardless of which side of the handshake we're on.
    assertThat(heartbeats.get()).isEqualTo(2);

    ((TextWebSocketFrame) first).release();
    ((BinaryWebSocketFrame) second).release();
  }

  @Test
  void preHandshakeCloseIsSurfacedAndChannelIsTornDown() {
    AtomicInteger releaseCount = new AtomicInteger();
    ProxyNodeWebsockets.DirectForwardingListener listener =
        new ProxyNodeWebsockets.DirectForwardingListener(
            countingReleaseNode(releaseCount),
            id -> {},
            new SessionId(UUID.randomUUID()),
            new AtomicBoolean(false),
            new NoopHttpClient(),
            new AtomicBoolean(false));

    // Upstream queued a frame and then closed, all before the client-side handshake landed.
    listener.onText("buffered");
    listener.onClose(4001, "browser gone");

    EmbeddedChannel channel = new EmbeddedChannel();
    listener.onUpgrade(channel);

    // The buffered text is gone (released on close so the ref-counted buffer cannot leak when
    // the handshake never completes), and the client sees a proper close frame followed by a
    // channel teardown.
    CloseWebSocketFrame close = channel.readOutbound();
    assertThat(close.statusCode()).isEqualTo(4001);
    assertThat(close.reasonText()).isEqualTo("browser gone");
    close.release();
    assertThat((Object) channel.readOutbound()).isNull();
    assertThat(channel.isOpen()).isFalse();
    assertThat(releaseCount.get()).isEqualTo(1);
  }

  @Test
  void closeReasonIsTruncatedSafelyEvenWhenItContainsMultiByteCharacters() {
    ProxyNodeWebsockets.DirectForwardingListener listener =
        new ProxyNodeWebsockets.DirectForwardingListener(
            new NoopNode(),
            id -> {},
            new SessionId(UUID.randomUUID()),
            new AtomicBoolean(false),
            new NoopHttpClient(),
            new AtomicBoolean(false));

    EmbeddedChannel channel = new EmbeddedChannel();
    listener.onUpgrade(channel);

    // RFC 6455 §5.5.1 caps close-frame reasons at 123 bytes UTF-8. Build a 200-byte reason out
    // of a two-byte UTF-8 character ('é') so that any cut at an arbitrary byte offset would
    // split a codepoint and produce a U+FFFD replacement on decode — which re-encodes to three
    // bytes and would push the result back over the limit.
    StringBuilder tooLong = new StringBuilder();
    for (int i = 0; i < 100; i++) {
      tooLong.append('é');
    }
    listener.onClose(4001, tooLong.toString());

    CloseWebSocketFrame close = channel.readOutbound();
    assertThat(close.reasonText().getBytes(java.nio.charset.StandardCharsets.UTF_8))
        .hasSizeLessThanOrEqualTo(123);
    assertThat(close.reasonText()).doesNotContain("�");
    close.release();
  }

  @Test
  void preHandshakeBufferOverflowRecordsCleanCloseAndReleasesSlot() {
    AtomicInteger releaseCount = new AtomicInteger();
    ProxyNodeWebsockets.DirectForwardingListener listener =
        new ProxyNodeWebsockets.DirectForwardingListener(
            countingReleaseNode(releaseCount),
            id -> {},
            new SessionId(UUID.randomUUID()),
            new AtomicBoolean(false),
            new NoopHttpClient(),
            new AtomicBoolean(false));

    // Cap is 128 frames; 200 frames is comfortably past it.
    for (int i = 0; i < 200; i++) {
      listener.onBinary(new byte[] {1});
    }

    EmbeddedChannel channel = new EmbeddedChannel();
    listener.onUpgrade(channel);

    CloseWebSocketFrame close = channel.readOutbound();
    assertThat(close.statusCode()).isEqualTo(1009);
    close.release();
    assertThat((Object) channel.readOutbound()).isNull();
    assertThat(channel.isOpen()).isFalse();

    // Overflow must release the connection slot so the limit counter does not leak.
    assertThat(releaseCount.get()).isEqualTo(1);
  }

  private static Node countingReleaseNode(AtomicInteger releaseCount) {
    return new NoopNode() {
      @Override
      public void releaseConnection(SessionId id) {
        releaseCount.incrementAndGet();
      }
    };
  }

  // ------------------------------------------------------------------
  // Stubs
  // ------------------------------------------------------------------

  private static final class NoopHttpClient implements HttpClient {
    @Override
    public HttpResponse execute(HttpRequest request) {
      throw new UnsupportedOperationException();
    }

    @Override
    public WebSocket openSocket(HttpRequest request, WebSocket.Listener listener) {
      throw new UnsupportedOperationException();
    }

    @Override
    public <T>
        java.util.concurrent.CompletableFuture<java.net.http.HttpResponse<T>> sendAsyncNative(
            java.net.http.HttpRequest request, java.net.http.HttpResponse.BodyHandler<T> handler) {
      throw new UnsupportedOperationException();
    }

    @Override
    public <T> java.net.http.HttpResponse<T> sendNative(
        java.net.http.HttpRequest request, java.net.http.HttpResponse.BodyHandler<T> handler) {
      throw new UnsupportedOperationException();
    }

    @Override
    public void close() {}
  }

  private static class NoopNode extends Node {
    NoopNode() {
      super(
          DefaultTestTracer.createTracer(),
          new NodeId(UUID.randomUUID()),
          URI.create("http://localhost:5555"),
          SECRET,
          Duration.ofSeconds(30));
    }

    @Override
    public Either<WebDriverException, CreateSessionResponse> newSession(
        CreateSessionRequest sessionRequest) {
      throw new UnsupportedOperationException();
    }

    @Override
    public HttpResponse executeWebDriverCommand(HttpRequest req) {
      throw new UnsupportedOperationException();
    }

    @Override
    public Session getSession(SessionId id) {
      throw new UnsupportedOperationException();
    }

    @Override
    public HttpResponse uploadFile(HttpRequest req, SessionId id) {
      throw new UnsupportedOperationException();
    }

    @Override
    public HttpResponse downloadFile(HttpRequest req, SessionId id) {
      throw new UnsupportedOperationException();
    }

    @Override
    public void stop(SessionId id) throws NoSuchSessionException {
      throw new UnsupportedOperationException();
    }

    @Override
    public boolean isSessionOwner(SessionId id) {
      return true;
    }

    @Override
    public boolean isSupporting(Capabilities capabilities) {
      return false;
    }

    @Override
    public NodeStatus getStatus() {
      throw new UnsupportedOperationException();
    }

    @Override
    public HealthCheck getHealthCheck() {
      throw new UnsupportedOperationException();
    }

    @Override
    public void drain() {}

    @Override
    public boolean isReady() {
      return true;
    }

    @Override
    public boolean tryAcquireConnection(SessionId id) {
      return true;
    }

    @Override
    public void releaseConnection(SessionId id) {}
  }
}
