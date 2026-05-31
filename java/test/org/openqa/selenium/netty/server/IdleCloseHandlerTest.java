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
import io.netty.handler.timeout.IdleStateEvent;
import org.junit.jupiter.api.Test;

class IdleCloseHandlerTest {

  @Test
  void idleEventClosesBothChannels() {
    EmbeddedChannel peer = new EmbeddedChannel();
    EmbeddedChannel self = new EmbeddedChannel(new TcpUpgradeTunnelHandler.IdleCloseHandler(peer));

    assertThat(self.config().isAutoRead()).isTrue();
    self.pipeline().fireUserEventTriggered(IdleStateEvent.READER_IDLE_STATE_EVENT);

    assertThat(self.isOpen()).isFalse();
    assertThat(peer.isOpen()).isFalse();
  }

  @Test
  void idleEventIsIgnoredWhileBackpressureHasPausedReads() {
    EmbeddedChannel peer = new EmbeddedChannel();
    EmbeddedChannel self = new EmbeddedChannel(new TcpUpgradeTunnelHandler.IdleCloseHandler(peer));

    // Simulate backpressure: TcpTunnelHandler would have set autoRead=false on this channel
    // because the peer's outbound buffer was full.
    self.config().setAutoRead(false);

    // The read-idle event must NOT tear down the tunnel — no bytes arriving is the expected
    // consequence of pausing reads, not a sign of a dropped connection.
    self.pipeline().fireUserEventTriggered(IdleStateEvent.READER_IDLE_STATE_EVENT);

    assertThat(self.isOpen()).isTrue();
    assertThat(peer.isOpen()).isTrue();
  }
}
