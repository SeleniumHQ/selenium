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

import io.netty.buffer.Unpooled;
import io.netty.channel.embedded.EmbeddedChannel;
import io.netty.handler.codec.http.websocketx.ContinuationWebSocketFrame;
import io.netty.handler.codec.http.websocketx.PingWebSocketFrame;
import org.junit.jupiter.api.Test;

class MessageInboundConverterTest {

  @Test
  void orphanContinuationFrameIsForwardedInbound() {
    EmbeddedChannel channel = new EmbeddedChannel(new MessageInboundConverter());

    // No prior Text/Binary frame has set up a continuation context, so this is an orphan.
    ContinuationWebSocketFrame orphan =
        new ContinuationWebSocketFrame(true, 0, Unpooled.wrappedBuffer("x".getBytes()));

    assertThat(channel.writeInbound(orphan)).isTrue();

    // The frame should travel forward through the pipeline, NOT back out as a write.
    Object inbound = channel.readInbound();
    assertThat(inbound).isInstanceOf(ContinuationWebSocketFrame.class);
    assertThat(channel.outboundMessages()).isEmpty();

    ((ContinuationWebSocketFrame) inbound).release();
  }

  @Test
  void unknownFrameTypeIsForwardedInbound() {
    EmbeddedChannel channel = new EmbeddedChannel(new MessageInboundConverter());

    // Ping is not a frame type the converter handles; it should be passed forward
    // for the keepalive/upgrade handler to deal with, not echoed back to the peer.
    PingWebSocketFrame ping = new PingWebSocketFrame();

    assertThat(channel.writeInbound(ping)).isTrue();

    Object inbound = channel.readInbound();
    assertThat(inbound).isInstanceOf(PingWebSocketFrame.class);
    assertThat(channel.outboundMessages()).isEmpty();

    ((PingWebSocketFrame) inbound).release();
  }
}
