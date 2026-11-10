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
import io.netty.handler.codec.http.DefaultFullHttpRequest;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.HttpHeaderNames;
import io.netty.handler.codec.http.HttpMethod;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.codec.http.HttpVersion;
import io.netty.util.AttributeKey;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.remote.http.CloseMessage;
import org.openqa.selenium.remote.http.Message;

class WebSocketUpgradeHandlerTest {

  @Test
  void unsupportedWebSocketVersionDrivesConsumerCleanup() {
    AtomicReference<Message> receivedByConsumer = new AtomicReference<>();

    AttributeKey<java.util.function.Consumer<Message>> key =
        AttributeKey.valueOf("ws-upgrade-handler-test");
    WebSocketUpgradeHandler handler =
        new WebSocketUpgradeHandler(key, (uri, downstream) -> Optional.of(receivedByConsumer::set));

    EmbeddedChannel channel = new EmbeddedChannel(new HttpServerCodec(), handler);

    FullHttpRequest req =
        new DefaultFullHttpRequest(HttpVersion.HTTP_1_1, HttpMethod.GET, "/session/abc/se/bidi");
    req.headers().set(HttpHeaderNames.HOST, "localhost");
    req.headers().set(HttpHeaderNames.CONNECTION, "Upgrade");
    req.headers().set(HttpHeaderNames.UPGRADE, "websocket");
    // Version 99 is not in Netty's supported set, so newHandshaker() returns null.
    req.headers().set(HttpHeaderNames.SEC_WEBSOCKET_VERSION, "99");
    req.headers().set(HttpHeaderNames.SEC_WEBSOCKET_KEY, "dGhlIHNhbXBsZSBub25jZQ==");

    channel.writeInbound(req);

    // Without the cleanup, the consumer is dropped and any acquired resources leak.
    assertThat(receivedByConsumer.get()).isInstanceOf(CloseMessage.class);
  }
}
