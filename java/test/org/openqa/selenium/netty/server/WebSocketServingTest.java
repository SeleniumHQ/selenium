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

import com.google.common.collect.ImmutableMap;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.ConnectionFailedException;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.TextMessage;
import org.openqa.selenium.remote.http.WebSocket;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.testing.Safely;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.BiFunction;
import java.util.function.Consumer;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class WebSocketServingTest {

  private Server<?> server;

  @AfterEach
  public void shutDown() {
    Safely.safelyCall(() -> server.stop());
  }

  @Test
  public void clientShouldThrowAnExceptionIfUnableToConnectToAWebSocketEndPoint() {
    assertThrows(ConnectionFailedException.class, () -> {
      server = new NettyServer(defaultOptions(), req -> new HttpResponse()).start();

      HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl());

      client.openSocket(new HttpRequest(GET, "/does-not-exist"), new WebSocket.Listener() {
      });
    });
  }

  @Test
  public void shouldUseUriToChooseWhichWebSocketHandlerToUse() throws InterruptedException {
    AtomicBoolean foo = new AtomicBoolean(false);
    AtomicBoolean bar = new AtomicBoolean(false);

    BiFunction<String, Consumer<Message>, Optional<Consumer<Message>>> factory = (str, sink) -> {
      if ("/foo".equals(str)) {
        return Optional.of(msg -> {
          foo.set(true);
          sink.accept(new TextMessage("Foo called"));
        });
      } else {
        return Optional.of(msg -> {
          bar.set(true);
          sink.accept(new TextMessage("Bar called"));
        });
      }
    };

    server = new NettyServer(
      defaultOptions(),
      req -> new HttpResponse(),
      factory
    ).start();

    CountDownLatch latch = new CountDownLatch(1);
    HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl());
    WebSocket fooSocket = client.openSocket(new HttpRequest(GET, "/foo"), new WebSocket.Listener() {
      @Override
      public void onText(CharSequence data) {
        System.out.println("Called!");
        latch.countDown();
      }
    });
    fooSocket.sendText("Hello, World!");

    latch.await(2, SECONDS);
    assertThat(foo.get()).isTrue();
    assertThat(bar.get()).isFalse();
  }

  @Test
  public void shouldStillBeAbleToServeHttpTraffic() {
    server = new NettyServer(
      defaultOptions(),
      req -> new HttpResponse().setContent(utf8String("Brie!")),
      (uri, sink) -> {
        if ("/foo".equals(uri)) {
          return Optional.of(msg -> sink.accept(new TextMessage("Peas!")));
        }
        return Optional.empty();
      }).start();

    HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl());
    HttpResponse res = client.execute(new HttpRequest(GET, "/cheese"));

    assertThat(Contents.string(res)).isEqualTo("Brie!");
  }

  @Test
  public void shouldPropagateCloseMessage() throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(1);

    server = new NettyServer(
      defaultOptions(),
      req -> new HttpResponse(),
      (uri, sink) -> Optional.of(socket -> latch.countDown())).start();

    HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl());
    WebSocket socket = client.openSocket(new HttpRequest(GET, "/cheese"), new WebSocket.Listener() {});

    socket.close();

    latch.await(2, SECONDS);
  }

  @Test
  public void webSocketHandlersShouldBeAbleToFireMoreThanOneMessage() {
    server = new NettyServer(
      defaultOptions(),
      req -> new HttpResponse(),
      (uri, sink) -> Optional.of(msg -> {
        sink.accept(new TextMessage("beyaz peynir"));
        sink.accept(new TextMessage("cheddar"));
      })).start();

    HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl());
    List<String> messages = new LinkedList<>();
    WebSocket socket = client.openSocket(new HttpRequest(GET, "/cheese"), new WebSocket.Listener() {
      @Override
      public void onText(CharSequence data) {
        messages.add(data.toString());
      }
    });

    socket.send(new TextMessage("Hello"));

    new FluentWait<>(messages).until(msgs -> msgs.size() == 2);
  }

  public void serverShouldBeAbleToPushAMessageWithoutNeedingTheClientToSendAMessage() throws InterruptedException {
    class MyHandler implements Consumer<Message> {

      private final Consumer<Message> sink;
      private final ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor();

      public MyHandler(Consumer<Message> sink) {
        this.sink = sink;

        // Send a message every 250ms
        executor.scheduleAtFixedRate(
          () -> sink.accept(new TextMessage("Calling home.")),
          100,
          250,
          MILLISECONDS);
      }

      @Override
      public void accept(Message message) {
        // Do nothing
      }
    }

    server = new NettyServer(
      defaultOptions(),
      req -> new HttpResponse(),
      (uri, sink) -> Optional.of(new MyHandler(sink))).start();

    CountDownLatch latch = new CountDownLatch(2);
    HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl());
    client.openSocket(new HttpRequest(GET, "/pushit"), new WebSocket.Listener() {
      @Override
      public void onText(CharSequence data) {
        latch.countDown();
      }
    });

    latch.await(2, SECONDS);
  }

  private BaseServerOptions defaultOptions() {
    return new BaseServerOptions(new MapConfig(
      ImmutableMap.of("server", ImmutableMap.of(
        "port", PortProber.findFreePort()
      ))));
  }
}
