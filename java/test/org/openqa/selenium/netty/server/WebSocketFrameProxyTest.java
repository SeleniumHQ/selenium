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

package org.openqa.selenium.netty.server;

import static org.assertj.core.api.Assertions.assertThat;

import io.netty.channel.embedded.EmbeddedChannel;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.WebSocket;

class WebSocketFrameProxyTest {

  @Test
  void marksUpstreamClosingWhenForwardingFails() {
    WebSocket throwingUpstream =
        new WebSocket() {
          @Override
          public WebSocket send(Message message) {
            throw new RuntimeException("upstream gone");
          }

          @Override
          public void close() {}
        };

    AtomicBoolean upstreamClosing = new AtomicBoolean(false);
    EmbeddedChannel channel =
        new EmbeddedChannel(new WebSocketFrameProxy(throwingUpstream, upstreamClosing));

    try {
      channel.writeInbound(new TextWebSocketFrame("hi"));
    } catch (RuntimeException expected) {
      // The proxy fires the exception through the pipeline; EmbeddedChannel rethrows it.
    }

    // First failure should latch upstreamClosing so subsequent frames short-circuit.
    assertThat(upstreamClosing.get()).isTrue();
  }
}
