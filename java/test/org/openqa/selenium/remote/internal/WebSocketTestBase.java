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

package org.openqa.selenium.remote.internal;

import static java.nio.charset.StandardCharsets.UTF_8;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.Safely.safelyCall;

import com.google.common.collect.ImmutableMap;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.http.BinaryMessage;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.TextMessage;
import org.openqa.selenium.remote.http.WebSocket;

public abstract class WebSocketTestBase {

  private HttpClient client;

  protected abstract HttpClient.Factory createFactory();

  private static Server<?> server;

  @BeforeAll
  public static void setUp() {
    server =
        new NettyServer(
            defaultOptions(),
            req -> new HttpResponse().setContent(Contents.utf8String("Hello, World!")),
            (uri, sink) -> {
              if ("/text".equals(uri)) {
                return Optional.of(
                    msg ->
                        sink.accept(
                            new TextMessage(
                                String.format("Hello, %s!", ((TextMessage) msg).text()))));
              }

              if ("/binary".equals(uri)) {
                return Optional.of(msg -> sink.accept(new BinaryMessage("brie".getBytes(UTF_8))));
              }

              return Optional.of(msg -> sink.accept(new TextMessage("Nope")));
            });
    server.start();
  }

  @AfterAll
  public static void tearDown() {
    server.stop();
  }

  @BeforeEach
  public void createClient() {
    client = createFactory().createClient(server.getUrl());
  }

  @AfterEach
  public void closeClient() {
    safelyCall(() -> client.close());
  }

  @Test
  void shouldBeAbleToSendATextMessage() throws InterruptedException {
    AtomicReference<String> message = new AtomicReference<>();
    CountDownLatch latch = new CountDownLatch(1);

    WebSocket.Listener listener =
        new WebSocket.Listener() {
          @Override
          public void onText(CharSequence data) {
            message.set(data.toString());
            latch.countDown();
          }
        };

    try (WebSocket socket = client.openSocket(new HttpRequest(HttpMethod.GET, "/text"), listener)) {
      socket.sendText("World");
      assertThat(latch.await(10, SECONDS)).isTrue();
    }

    assertThat(message.get()).isEqualTo("Hello, World!");
  }

  @Test
  void shouldBeAbleToSendABinaryMessage() throws InterruptedException {
    AtomicReference<byte[]> message = new AtomicReference<>();
    CountDownLatch latch = new CountDownLatch(1);

    WebSocket.Listener listener =
        new WebSocket.Listener() {
          @Override
          public void onBinary(byte[] data) {
            message.set(data);
            latch.countDown();
          }
        };

    try (WebSocket socket =
        client.openSocket(new HttpRequest(HttpMethod.GET, "/binary"), listener)) {
      socket.sendBinary("cheese".getBytes(UTF_8));
      assertThat(latch.await(10, SECONDS)).isTrue();
    }

    assertThat(message.get()).isEqualTo("brie".getBytes(UTF_8));
  }

  private static BaseServerOptions defaultOptions() {
    return new BaseServerOptions(
        new MapConfig(
            ImmutableMap.of("server", ImmutableMap.of("port", PortProber.findFreePort()))));
  }
}
