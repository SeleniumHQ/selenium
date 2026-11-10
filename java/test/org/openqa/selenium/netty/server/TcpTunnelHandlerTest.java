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
import io.netty.channel.WriteBufferWaterMark;
import io.netty.channel.embedded.EmbeddedChannel;
import org.junit.jupiter.api.Test;

class TcpTunnelHandlerTest {

  @Test
  void writabilityChangesOnTunnelMirrorToPeerAutoRead() {
    // Source provides bytes; tunnel handler writes them to the slow-draining target.
    EmbeddedChannel target = new EmbeddedChannel();
    EmbeddedChannel source = new EmbeddedChannel(new TcpTunnelHandler(target));

    // Force the target to flip writability after a single small write.
    target.config().setWriteBufferWaterMark(new WriteBufferWaterMark(8, 16));

    // Don't let EmbeddedChannel's outbound queue auto-drain; we want to observe the watermark.
    assertThat(source.config().isAutoRead()).isTrue();

    // A write that exceeds the high-water mark on the *source* channel triggers the
    // channelWritabilityChanged event, which the handler mirrors onto target.setAutoRead().
    source.config().setWriteBufferWaterMark(new WriteBufferWaterMark(8, 16));
    source.write(Unpooled.wrappedBuffer(new byte[64]));

    // Source is now unwritable -> target's autoRead must be paused.
    assertThat(source.isWritable()).isFalse();
    assertThat(target.config().isAutoRead()).isFalse();

    // Drain source; writability flips back and target's autoRead must be re-enabled.
    source.flushOutbound();
    source.releaseOutbound();
    assertThat(source.isWritable()).isTrue();
    assertThat(target.config().isAutoRead()).isTrue();

    target.releaseInbound();
  }
}
