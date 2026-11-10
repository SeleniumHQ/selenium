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

import static java.nio.charset.StandardCharsets.UTF_8;
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

  @Test
  void truncateCloseReasonReturnsShortReasonUnchanged() {
    assertThat(WebSocketFrameProxy.truncateCloseReason("upstream gone")).isEqualTo("upstream gone");
    assertThat(WebSocketFrameProxy.truncateCloseReason("")).isEqualTo("");
    assertThat(WebSocketFrameProxy.truncateCloseReason(null)).isEqualTo("");
  }

  @Test
  void truncateCloseReasonStaysWithinTheWebSocketByteLimit() {
    // RFC 6455 §5.5.1 caps close-frame reasons at 123 bytes UTF-8. Build a 200-byte reason out
    // of a two-byte UTF-8 character ('é') so the truncation is forced to cut where a naïve
    // byte-level approach would split a codepoint and produce a U+FFFD replacement.
    StringBuilder tooLong = new StringBuilder();
    for (int i = 0; i < 100; i++) {
      tooLong.append('é');
    }

    String truncated = WebSocketFrameProxy.truncateCloseReason(tooLong.toString());

    assertThat(truncated.getBytes(UTF_8)).hasSizeLessThanOrEqualTo(123);
    assertThat(truncated).doesNotContain("�");
    assertThat(truncated).endsWith("...");
  }
}
