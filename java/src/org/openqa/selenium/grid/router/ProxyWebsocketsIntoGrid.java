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

import static org.openqa.selenium.remote.http.HttpMethod.GET;

import io.netty.channel.Channel;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelPipeline;
import io.netty.handler.codec.http.websocketx.CloseWebSocketFrame;
import java.net.URI;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.netty.server.PostUpgradeHook;
import org.openqa.selenium.netty.server.WebSocketFrameProxy;
import org.openqa.selenium.remote.HttpSessionId;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.BinaryMessage;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.CloseMessage;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.TextMessage;
import org.openqa.selenium.remote.http.WebSocket;

/**
 * Proxies WebSocket connections from the Router to a Grid node.
 *
 * <p>After the Netty-side upgrade handshake completes ({@link PostUpgradeHook}), the pipeline is
 * simplified: {@code MessageInboundConverter}, {@code MessageOutboundConverter}, and {@code
 * WebSocketMessageHandler} are replaced by a {@link WebSocketFrameProxy} that forwards {@link
 * io.netty.handler.codec.http.websocketx.WebSocketFrame} objects directly to the node-side {@link
 * WebSocket}. This eliminates one intermediate object allocation and one executor-task submission
 * per frame in each direction.
 */
public class ProxyWebsocketsIntoGrid
    implements BiFunction<String, Consumer<Message>, Optional<Consumer<Message>>> {

  private static final Logger LOG = Logger.getLogger(ProxyWebsocketsIntoGrid.class.getName());
  private final HttpClient.Factory clientFactory;
  private final SessionMap sessions;

  public ProxyWebsocketsIntoGrid(HttpClient.Factory clientFactory, SessionMap sessions) {
    this.clientFactory = Objects.requireNonNull(clientFactory);
    this.sessions = Objects.requireNonNull(sessions);
  }

  @Override
  public Optional<Consumer<Message>> apply(String uri, Consumer<Message> downstream) {
    Require.nonNull("uri", uri);
    Require.nonNull("downstream", downstream);

    Optional<SessionId> sessionId = HttpSessionId.getSessionId(uri).map(SessionId::new);
    if (sessionId.isEmpty()) {
      LOG.warning("Session not found for uri " + uri);
      return Optional.empty();
    }

    URI sessionUri;
    try {
      sessionUri = sessions.getUri(sessionId.get());
    } catch (NoSuchSessionException e) {
      LOG.warning("Attempt to connect to non-existent session: " + uri);
      return Optional.empty();
    }

    AtomicBoolean upstreamClosing = new AtomicBoolean(false);
    // Holds the client channel once onUpgradeComplete fires; used by DirectForwardingListener
    // to write frames without going through MessageOutboundConverter.
    AtomicReference<Channel> clientChannelRef = new AtomicReference<>();

    HttpClient client =
        clientFactory.createClient(ClientConfig.defaultConfig().baseUri(sessionUri));
    try {
      WebSocket upstream =
          client.openSocket(
              new HttpRequest(GET, uri),
              new DirectForwardingListener(downstream, clientChannelRef, upstreamClosing, client));

      return Optional.of(
          new FrameProxyConsumer(upstream, client, clientChannelRef, upstreamClosing));

    } catch (Exception e) {
      LOG.log(Level.WARNING, "Connecting to upstream websocket failed", e);
      client.close();
      return Optional.empty();
    }
  }

  // ---------------------------------------------------------------------------
  // Consumer returned to WebSocketUpgradeHandler — also implements PostUpgradeHook
  // ---------------------------------------------------------------------------

  private static class FrameProxyConsumer implements Consumer<Message>, PostUpgradeHook {

    private final WebSocket upstream;
    private final HttpClient client;
    private final AtomicReference<Channel> clientChannelRef;
    private final AtomicBoolean upstreamClosing;

    FrameProxyConsumer(
        WebSocket upstream,
        HttpClient client,
        AtomicReference<Channel> clientChannelRef,
        AtomicBoolean upstreamClosing) {
      this.upstream = upstream;
      this.client = client;
      this.clientChannelRef = clientChannelRef;
      this.upstreamClosing = upstreamClosing;
    }

    /**
     * Called by {@link org.openqa.selenium.netty.server.WebSocketUpgradeHandler} on the Netty IO
     * thread after the client-side handshake completes. Install {@link WebSocketFrameProxy} and
     * strip the three {@code Message}-layer handlers so subsequent data frames never pass through
     * the full Selenium handler chain.
     */
    @Override
    public void onUpgradeComplete(ChannelHandlerContext ctx) {
      Channel ch = ctx.channel();
      clientChannelRef.set(ch);

      WebSocketFrameProxy proxy = new WebSocketFrameProxy(upstream, upstreamClosing);
      ChannelPipeline pipeline = ctx.pipeline();

      // Insert the frame proxy just before the inbound Message converter so it intercepts
      // WebSocketFrame objects first, then remove the three now-redundant handlers.
      pipeline.addBefore("netty-to-se-messages", "frame-proxy", proxy);
      removeIfPresent(pipeline, "netty-to-se-messages"); // MessageInboundConverter
      removeIfPresent(pipeline, "se-to-netty-messages"); // MessageOutboundConverter
      removeIfPresent(pipeline, "se-websocket-handler"); // WebSocketMessageHandler
    }

    private static void removeIfPresent(ChannelPipeline pipeline, String name) {
      if (pipeline.get(name) != null) {
        pipeline.remove(name);
      }
    }

    /**
     * After pipeline rewiring this consumer is only called for {@link CloseMessage} (fired by
     * {@link org.openqa.selenium.netty.server.WebSocketUpgradeHandler} on the close handshake).
     * Data frames are handled directly by {@link WebSocketFrameProxy}.
     */
    @Override
    public void accept(Message msg) {
      if (upstreamClosing.get()) {
        if (msg instanceof CloseMessage) {
          closeClient();
        }
        return;
      }

      try {
        upstream.send(msg);
      } catch (Exception e) {
        LOG.log(
            Level.FINE,
            "Could not forward message to node WebSocket (connection likely closed)",
            e);
        closeClient();
        return;
      }

      if (msg instanceof CloseMessage) {
        closeClient();
      }
    }

    private void closeClient() {
      try {
        client.close();
      } catch (Exception e) {
        LOG.log(Level.WARNING, "Failed to close upstream client", e);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Listener for node → client messages (fast path via direct frame writes)
  // ---------------------------------------------------------------------------

  /**
   * Writes node-side messages directly to the client {@link Channel} as Netty WebSocket frames,
   * bypassing {@code MessageOutboundConverter}. Falls back to the {@code downstream} consumer
   * before the client channel reference is set (i.e. before {@link
   * PostUpgradeHook#onUpgradeComplete} fires, which is rare).
   */
  private static class DirectForwardingListener implements WebSocket.Listener {

    private final Consumer<Message> fallbackDownstream;
    private final AtomicReference<Channel> clientChannelRef;
    private final AtomicBoolean upstreamClosing;
    private final HttpClient client;

    DirectForwardingListener(
        Consumer<Message> fallbackDownstream,
        AtomicReference<Channel> clientChannelRef,
        AtomicBoolean upstreamClosing,
        HttpClient client) {
      this.fallbackDownstream = Objects.requireNonNull(fallbackDownstream);
      this.clientChannelRef = Objects.requireNonNull(clientChannelRef);
      this.upstreamClosing = Objects.requireNonNull(upstreamClosing);
      this.client = Objects.requireNonNull(client);
    }

    @Override
    public void onText(CharSequence data) {
      Channel ch = clientChannelRef.get();
      if (ch != null) {
        // Fast path: write TextWebSocketFrame directly, skipping MessageOutboundConverter.
        WebSocketFrameProxy.writeTextFrame(ch, data);
      } else {
        fallbackDownstream.accept(new TextMessage(data));
      }
    }

    @Override
    public void onBinary(byte[] data) {
      Channel ch = clientChannelRef.get();
      if (ch != null) {
        // Fast path: write BinaryWebSocketFrame directly, skipping MessageOutboundConverter.
        WebSocketFrameProxy.writeBinaryFrame(ch, data);
      } else {
        fallbackDownstream.accept(new BinaryMessage(data));
      }
    }

    @Override
    public void onClose(int code, String reason) {
      upstreamClosing.set(true);
      // After onUpgradeComplete the pipeline no longer contains MessageOutboundConverter, so
      // writing a CloseMessage object via fallbackDownstream would fail to encode. Write the
      // Netty frame directly once the client channel reference is available.
      Channel ch = clientChannelRef.get();
      if (ch != null && ch.isActive()) {
        ch.writeAndFlush(new CloseWebSocketFrame(code, reason));
      } else {
        fallbackDownstream.accept(new CloseMessage(code, reason));
      }
      try {
        client.close();
      } catch (Exception e) {
        LOG.log(Level.FINE, "Failed to close client on upstream WebSocket close", e);
      }
    }

    @Override
    public void onError(Throwable cause) {
      upstreamClosing.set(true);
      LOG.log(Level.WARNING, "Error proxying websocket command", cause);
      // Close the client channel so Playwright/BiDi clients see a clean disconnect rather than
      // hanging until the next keepalive ping fires.
      Channel ch = clientChannelRef.get();
      if (ch != null && ch.isActive()) {
        ch.writeAndFlush(new CloseWebSocketFrame(1011, "upstream error"))
            .addListener(ChannelFutureListener.CLOSE);
      }
      try {
        client.close();
      } catch (Exception e) {
        LOG.log(Level.FINE, "Failed to close client after WebSocket error", e);
      }
    }
  }
}
