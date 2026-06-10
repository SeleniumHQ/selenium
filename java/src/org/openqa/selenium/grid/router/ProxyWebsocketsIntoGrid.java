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

import io.netty.buffer.Unpooled;
import io.netty.channel.Channel;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelPipeline;
import io.netty.handler.codec.http.websocketx.BinaryWebSocketFrame;
import io.netty.handler.codec.http.websocketx.CloseWebSocketFrame;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketFrame;
import java.net.URI;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.netty.server.PostUpgradeHook;
import org.openqa.selenium.netty.server.WebSocketFrameProxy;
import org.openqa.selenium.remote.HttpSessionId;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.CloseMessage;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.Message;
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

    HttpClient client =
        clientFactory.createClient(ClientConfig.defaultConfig().baseUri(sessionUri));
    DirectForwardingListener listener = new DirectForwardingListener(upstreamClosing, client);
    try {
      WebSocket upstream = client.openSocket(new HttpRequest(GET, uri), listener);

      return Optional.of(new FrameProxyConsumer(upstream, client, listener, upstreamClosing));

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
    private final DirectForwardingListener listener;
    private final AtomicBoolean upstreamClosing;

    FrameProxyConsumer(
        WebSocket upstream,
        HttpClient client,
        DirectForwardingListener listener,
        AtomicBoolean upstreamClosing) {
      this.upstream = upstream;
      this.client = client;
      this.listener = listener;
      this.upstreamClosing = upstreamClosing;
    }

    /**
     * Called by {@link org.openqa.selenium.netty.server.WebSocketUpgradeHandler} on the Netty IO
     * thread after the client-side handshake completes. Hand the channel to the listener (which
     * drains any frames received before the handshake landed), then install {@link
     * WebSocketFrameProxy} and strip the three {@code Message}-layer handlers so subsequent data
     * frames never pass through the full Selenium handler chain.
     */
    @Override
    public void onUpgradeComplete(ChannelHandlerContext ctx) {
      Channel ch = ctx.channel();
      // Drain any pre-handshake buffer in order before the listener starts taking the fast path.
      listener.onUpgrade(ch);

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
   * bypassing {@code MessageOutboundConverter}.
   *
   * <p>Frames received from the upstream before {@link #onUpgrade(Channel)} fires are buffered in
   * arrival order; the buffer is then drained on the Netty IO thread before any subsequent listener
   * call takes the fast path. This makes the pre-handshake → post-handshake transition
   * deterministic: a frame can never land in a pipeline that has already had its Message-layer
   * handlers removed.
   */
  static class DirectForwardingListener implements WebSocket.Listener {

    // Bound on the pre-handshake buffer. If the upstream produces more frames than this before
    // the client-side handshake completes (a stalled or hostile client), the buffer is dropped
    // and the listener latches a 1009 ("Message Too Big" / overflow) terminal state so the
    // channel sees a clean close once the upgrade lands.
    private static final int MAX_PENDING_FRAMES = 128;

    private final Object lock = new Object();
    private final Deque<WebSocketFrame> pending = new ArrayDeque<>();
    // Volatile so the post-handover fast path needs no synchronization.
    private volatile Channel clientChannel;
    // Pre-handshake terminal state. When `closed` is true at onUpgrade time, the listener
    // surfaces the recorded close to the client instead of publishing the channel for normal
    // forwarding — this stops the downstream from sitting open indefinitely when the upstream
    // has already gone away. Guarded by lock.
    private boolean closed;
    private int closeCode;
    private @Nullable String closeReason;

    private final AtomicBoolean upstreamClosing;
    private final HttpClient client;

    DirectForwardingListener(AtomicBoolean upstreamClosing, HttpClient client) {
      this.upstreamClosing = Objects.requireNonNull(upstreamClosing);
      this.client = Objects.requireNonNull(client);
    }

    /**
     * Hand the client channel over after the WebSocket upgrade has completed. If the upstream
     * already closed or errored, surface that to the client now and close the channel; otherwise
     * drain any frames received in the meantime in arrival order and publish the channel for the
     * fast path.
     */
    void onUpgrade(Channel ch) {
      boolean terminal;
      int code;
      String reason;
      synchronized (lock) {
        WebSocketFrame frame;
        while ((frame = pending.pollFirst()) != null) {
          ch.writeAndFlush(frame);
        }
        terminal = closed;
        code = closeCode;
        reason = closeReason == null ? "" : closeReason;
        if (!terminal) {
          clientChannel = ch;
        }
      }
      if (terminal && ch.isActive()) {
        ch.writeAndFlush(new CloseWebSocketFrame(code, reason))
            .addListener(ChannelFutureListener.CLOSE);
      }
    }

    @Override
    public void onText(CharSequence data) {
      Channel ch = clientChannel;
      if (ch != null) {
        WebSocketFrameProxy.writeTextFrame(ch, data);
        return;
      }
      enqueueOrWrite(new TextWebSocketFrame(data.toString()));
    }

    @Override
    public void onBinary(byte[] data) {
      Channel ch = clientChannel;
      if (ch != null) {
        WebSocketFrameProxy.writeBinaryFrame(ch, data);
        return;
      }
      enqueueOrWrite(new BinaryWebSocketFrame(Unpooled.wrappedBuffer(data)));
    }

    private void enqueueOrWrite(WebSocketFrame frame) {
      boolean overflow = false;
      Channel ch;
      synchronized (lock) {
        ch = clientChannel;
        if (ch == null) {
          if (closed) {
            frame.release();
            return;
          }
          if (pending.size() >= MAX_PENDING_FRAMES) {
            // Stall protection: drop the buffer and arm a terminal state so the next
            // onUpgrade closes the client cleanly instead of letting memory grow unbounded.
            frame.release();
            discardPendingLocked();
            closed = true;
            closeCode = 1009;
            closeReason = "websocket buffer overflow";
            overflow = true;
          } else {
            pending.addLast(frame);
            return;
          }
        }
      }
      if (overflow) {
        upstreamClosing.set(true);
        LOG.log(
            Level.WARNING,
            "Dropping pre-handshake WebSocket buffer for {0}: exceeded {1} pending frames",
            new Object[] {client, MAX_PENDING_FRAMES});
        closeClient();
        return;
      }
      ch.writeAndFlush(frame);
    }

    @Override
    public void onClose(int code, String reason) {
      upstreamClosing.set(true);
      // The WebSocket spec caps close-frame reasons at 123 bytes UTF-8; truncate so an upstream
      // sending a longer one cannot break the close frame's encoding.
      String safeReason = WebSocketFrameProxy.truncateCloseReason(reason);
      Channel ch = clientChannel;
      if (ch == null) {
        synchronized (lock) {
          ch = clientChannel;
          if (ch == null) {
            // Pre-handshake close: drop the buffer so ref-counted frames are released
            // immediately even if the client-side handshake never lands (for instance because
            // the client disconnected mid-handshake or the upgrade itself failed). Record the
            // close so onUpgrade can still surface it to the client if the handshake does fire.
            discardPendingLocked();
            closed = true;
            closeCode = code;
            closeReason = safeReason;
          }
        }
      }
      if (ch != null && ch.isActive()) {
        ch.writeAndFlush(new CloseWebSocketFrame(code, safeReason));
      }
      closeClient();
    }

    @Override
    public void onError(Throwable cause) {
      upstreamClosing.set(true);
      LOG.log(Level.WARNING, "Error proxying websocket command", cause);
      Channel ch = clientChannel;
      if (ch == null) {
        synchronized (lock) {
          ch = clientChannel;
          if (ch == null) {
            // Pre-handshake error: drop the buffer (frames may not be coherent) and record 1011.
            discardPendingLocked();
            closed = true;
            closeCode = 1011;
            closeReason = "upstream error";
          }
        }
      }
      // Close the client channel so Playwright/BiDi clients see a clean disconnect rather than
      // hanging until the next keepalive ping fires.
      if (ch != null && ch.isActive()) {
        ch.writeAndFlush(new CloseWebSocketFrame(1011, "upstream error"))
            .addListener(ChannelFutureListener.CLOSE);
      }
      closeClient();
    }

    private void discardPendingLocked() {
      WebSocketFrame frame;
      while ((frame = pending.pollFirst()) != null) {
        frame.release();
      }
    }

    private void closeClient() {
      try {
        client.close();
      } catch (Exception e) {
        LOG.log(Level.FINE, "Failed to close client", e);
      }
    }
  }
}
