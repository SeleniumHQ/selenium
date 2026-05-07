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

package org.openqa.selenium.grid.router;

import static org.assertj.core.api.Assertions.assertThat;

import io.netty.channel.embedded.EmbeddedChannel;
import io.netty.handler.codec.http.websocketx.BinaryWebSocketFrame;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.WebSocket;

class DirectForwardingListenerTest {

  @Test
  void framesReceivedBeforeUpgradeAreDrainedInOrder() {
    HttpClient noopClient = new NoopHttpClient();
    ProxyWebsocketsIntoGrid.DirectForwardingListener listener =
        new ProxyWebsocketsIntoGrid.DirectForwardingListener(new AtomicBoolean(false), noopClient);

    // Two frames arrive from the upstream before the WebSocket upgrade has completed.
    listener.onText("first");
    listener.onBinary(new byte[] {1, 2, 3});

    EmbeddedChannel channel = new EmbeddedChannel();
    listener.onUpgrade(channel);

    Object firstWritten = channel.readOutbound();
    Object secondWritten = channel.readOutbound();
    Object nothingMore = channel.readOutbound();

    assertThat(firstWritten).isInstanceOf(TextWebSocketFrame.class);
    assertThat(((TextWebSocketFrame) firstWritten).text()).isEqualTo("first");
    assertThat(secondWritten).isInstanceOf(BinaryWebSocketFrame.class);
    assertThat(((BinaryWebSocketFrame) secondWritten).content().readableBytes()).isEqualTo(3);
    assertThat(nothingMore).isNull();

    ((TextWebSocketFrame) firstWritten).release();
    ((BinaryWebSocketFrame) secondWritten).release();
  }

  @Test
  void postUpgradeFramesGoStraightToTheChannel() {
    ProxyWebsocketsIntoGrid.DirectForwardingListener listener =
        new ProxyWebsocketsIntoGrid.DirectForwardingListener(
            new AtomicBoolean(false), new NoopHttpClient());

    EmbeddedChannel channel = new EmbeddedChannel();
    listener.onUpgrade(channel);

    listener.onText("after-handshake");

    Object written = channel.readOutbound();
    assertThat(written).isInstanceOf(TextWebSocketFrame.class);
    assertThat(((TextWebSocketFrame) written).text()).isEqualTo("after-handshake");
    ((TextWebSocketFrame) written).release();
  }

  /** Stand-in HttpClient so we don't pull a network factory into a unit test. */
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
}
