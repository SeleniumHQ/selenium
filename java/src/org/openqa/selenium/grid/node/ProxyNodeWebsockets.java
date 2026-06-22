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

package org.openqa.selenium.grid.node;

import static org.openqa.selenium.internal.Debug.getDebugLogLevel;
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
import java.net.URISyntaxException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Stream;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.devtools.CdpEndpointFinder;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.netty.server.PostUpgradeHook;
import org.openqa.selenium.netty.server.WebSocketFrameProxy;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.CloseMessage;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.UrlTemplate;
import org.openqa.selenium.remote.http.WebSocket;

public class ProxyNodeWebsockets
    implements BiFunction<String, Consumer<Message>, Optional<Consumer<Message>>> {

  private static final UrlTemplate CDP_TEMPLATE = new UrlTemplate("/session/{sessionId}/se/cdp");
  private static final UrlTemplate BIDI_TEMPLATE = new UrlTemplate("/session/{sessionId}/se/bidi");
  private static final UrlTemplate FWD_TEMPLATE = new UrlTemplate("/session/{sessionId}/se/fwd");
  private static final UrlTemplate VNC_TEMPLATE = new UrlTemplate("/session/{sessionId}/se/vnc");
  private static final Logger LOG = Logger.getLogger(ProxyNodeWebsockets.class.getName());
  private static final Set<String> CDP_ENDPOINT_CAPS =
      Set.of("goog:chromeOptions", "ms:edgeOptions");
  private final HttpClient.Factory clientFactory;
  private final Node node;
  private final String gridSubPath;

  public ProxyNodeWebsockets(HttpClient.Factory clientFactory, Node node, String gridSubPath) {
    this.clientFactory = Objects.requireNonNull(clientFactory);
    this.node = Objects.requireNonNull(node);
    this.gridSubPath = gridSubPath;
  }

  @Override
  public Optional<Consumer<Message>> apply(String uri, Consumer<Message> downstream) {
    UrlTemplate.Match fwdMatch = FWD_TEMPLATE.match(uri, gridSubPath);
    UrlTemplate.Match cdpMatch = CDP_TEMPLATE.match(uri, gridSubPath);
    UrlTemplate.Match bidiMatch = BIDI_TEMPLATE.match(uri, gridSubPath);
    UrlTemplate.Match vncMatch = VNC_TEMPLATE.match(uri, gridSubPath);

    if (bidiMatch == null && cdpMatch == null && vncMatch == null && fwdMatch == null) {
      return Optional.empty();
    }

    Optional<UrlTemplate.Match> firstMatch =
        Stream.of(fwdMatch, cdpMatch, bidiMatch, vncMatch).filter(Objects::nonNull).findFirst();

    if (firstMatch.isEmpty()) {
      LOG.warning("No session id found in uri " + uri);
      return Optional.empty();
    }

    String sessionId = firstMatch.get().getParameters().get("sessionId");

    LOG.fine("Matching websockets for session id: " + sessionId);
    SessionId id = new SessionId(sessionId);

    if (!node.isSessionOwner(id)) {
      LOG.warning("Not owner of " + id);
      return Optional.empty();
    }

    // ensure one session does not open to many connections, this might have a negative impact on
    // the grid health
    if (!node.tryAcquireConnection(id)) {
      LOG.warning("Too many websocket connections initiated by " + id);
      return Optional.empty();
    }

    try {
      Session session = node.getSession(id);
      Capabilities caps = session.getCapabilities();
      LOG.fine("Scanning for endpoint: " + caps);

      // Used by the ForwardingListener to notify the node that the session is still active
      Consumer<SessionId> sessionConsumer = node::isSessionOwner;

      Optional<Consumer<Message>> endpoint;
      if (bidiMatch != null) {
        endpoint = findBiDiEndpoint(downstream, caps, sessionConsumer, id);
      } else if (vncMatch != null) {
        // Passing a fake consumer to the ForwardingListener to avoid sending a session notification
        // when VNC is used.
        sessionConsumer = fakeConsumer -> {};
        endpoint = findVncEndpoint(downstream, caps, sessionConsumer, id);
      } else if (fwdMatch != null) {
        // This match happens when a user wants to do CDP over Dynamic Grid
        LOG.info("Matched endpoint where CDP connection is being forwarded");
        endpoint = findCdpEndpoint(downstream, caps, sessionConsumer, id);
      } else if (caps.getCapabilityNames().contains("se:forwardCdp")) {
        LOG.info("Found endpoint where CDP connection needs to be forwarded");
        endpoint = findForwardCdpEndpoint(downstream, caps, sessionConsumer, id);
      } else {
        endpoint = findCdpEndpoint(downstream, caps, sessionConsumer, id);
      }

      // If no endpoint could be established the connection slot must be released;
      if (endpoint.isEmpty()) {
        node.releaseConnection(id);
      }

      return endpoint;
    } catch (Exception e) {
      node.releaseConnection(id);
      LOG.log(Level.WARNING, "Failed to establish WebSocket endpoint for session " + id, e);
      return Optional.empty();
    }
  }

  private Optional<Consumer<Message>> findCdpEndpoint(
      Consumer<Message> downstream,
      Capabilities caps,
      Consumer<SessionId> sessionConsumer,
      SessionId sessionId) {

    for (String cdpEndpointCap : CDP_ENDPOINT_CAPS) {
      Optional<URI> reportedUri = CdpEndpointFinder.getReportedUri(cdpEndpointCap, caps);
      Optional<HttpClient> client =
          reportedUri.map(
              uri ->
                  CdpEndpointFinder.getHttpClient(
                      clientFactory, uri, ClientConfig.defaultConfig()));
      Optional<URI> cdpUri;

      try {
        cdpUri = client.flatMap(CdpEndpointFinder::getCdpEndPoint);
      } catch (Exception e) {
        try {
          client.ifPresent(HttpClient::close);
        } catch (Exception ex) {
          e.addSuppressed(ex);
        }
        throw e;
      }

      if (cdpUri.isPresent()) {
        LOG.log(getDebugLogLevel(), String.format("Endpoint found in %s", cdpEndpointCap));
        return cdpUri.map(cdp -> createWsEndPoint(cdp, downstream, sessionConsumer, sessionId));
      } else {
        try {
          client.ifPresent(HttpClient::close);
        } catch (Exception e) {
          LOG.log(
              Level.FINE,
              "failed to close the http client used to check the reported CDP endpoint: "
                  + reportedUri.get(),
              e);
        }
      }
    }
    return Optional.empty();
  }

  private Optional<Consumer<Message>> findBiDiEndpoint(
      Consumer<Message> downstream,
      Capabilities caps,
      Consumer<SessionId> sessionConsumer,
      SessionId sessionId) {
    try {
      URI uri = new URI(String.valueOf(caps.getCapability("se:gridWebSocketUrl")));
      return Optional.of(uri)
          .map(bidi -> createWsEndPoint(bidi, downstream, sessionConsumer, sessionId));
    } catch (URISyntaxException e) {
      LOG.warning("Unable to create URI from: " + caps.getCapability("webSocketUrl"));
      return Optional.empty();
    }
  }

  private Optional<Consumer<Message>> findForwardCdpEndpoint(
      Consumer<Message> downstream,
      Capabilities caps,
      Consumer<SessionId> sessionConsumer,
      SessionId sessionId) {
    // When using Dynamic Grid, we need to connect to a container before using the debuggerAddress
    try {
      URI uri = new URI(String.valueOf(caps.getCapability("se:forwardCdp")));
      return Optional.of(uri)
          .map(cdp -> createWsEndPoint(cdp, downstream, sessionConsumer, sessionId));
    } catch (URISyntaxException e) {
      LOG.warning("Unable to create URI from: " + caps.getCapability("se:forwardCdp"));
      return Optional.empty();
    }
  }

  private Optional<Consumer<Message>> findVncEndpoint(
      Consumer<Message> downstream,
      Capabilities caps,
      Consumer<SessionId> sessionConsumer,
      SessionId sessionId) {
    String vncLocalAddress = (String) caps.getCapability("se:vncLocalAddress");
    if (vncLocalAddress == null || vncLocalAddress.trim().isEmpty()) {
      LOG.warning("No VNC endpoint address in capabilities");
      return Optional.empty();
    }
    Optional<URI> vncUri;
    try {
      vncUri = Optional.of(new URI(vncLocalAddress));
    } catch (URISyntaxException e) {
      LOG.warning("Invalid URI for endpoint " + vncLocalAddress);
      return Optional.empty();
    }
    LOG.log(getDebugLogLevel(), String.format("Endpoint found in %s", "se:vncLocalAddress"));
    return vncUri.map(vnc -> createWsEndPoint(vnc, downstream, sessionConsumer, sessionId));
  }

  private Consumer<Message> createWsEndPoint(
      URI uri,
      Consumer<Message> downstream,
      Consumer<SessionId> sessionConsumer,
      SessionId sessionId) {
    Require.nonNull("downstream", downstream);
    Require.nonNull("uri", uri);
    Require.nonNull("sessionConsumer", sessionConsumer);
    Require.nonNull("sessionId", sessionId);

    LOG.info("Establishing connection to " + uri);

    AtomicBoolean connectionReleased = new AtomicBoolean(false);
    // Set to true as soon as the browser signals it is closing so the send lambda can stop
    // forwarding data frames without racing against the JDK WebSocket output stream being closed.
    AtomicBoolean upstreamClosing = new AtomicBoolean(false);

    HttpClient client = clientFactory.createClient(ClientConfig.defaultConfig().baseUri(uri));
    DirectForwardingListener listener =
        new DirectForwardingListener(
            node, sessionConsumer, sessionId, connectionReleased, client, upstreamClosing);
    try {
      WebSocket upstream = client.openSocket(new HttpRequest(GET, uri.toString()), listener);
      return new FrameProxyConsumer(
          upstream, client, listener, node, sessionId, connectionReleased, upstreamClosing);
    } catch (Exception e) {
      LOG.log(Level.WARNING, "Connecting to upstream websocket failed", e);
      client.close();
      throw e;
    }
  }

  // ---------------------------------------------------------------------------
  // Consumer returned to WebSocketUpgradeHandler — also implements PostUpgradeHook
  // ---------------------------------------------------------------------------

  private static class FrameProxyConsumer implements Consumer<Message>, PostUpgradeHook {

    private final WebSocket upstream;
    private final HttpClient client;
    private final DirectForwardingListener listener;
    private final Node node;
    private final SessionId sessionId;
    private final AtomicBoolean connectionReleased;
    private final AtomicBoolean upstreamClosing;

    FrameProxyConsumer(
        WebSocket upstream,
        HttpClient client,
        DirectForwardingListener listener,
        Node node,
        SessionId sessionId,
        AtomicBoolean connectionReleased,
        AtomicBoolean upstreamClosing) {
      this.upstream = upstream;
      this.client = client;
      this.listener = listener;
      this.node = node;
      this.sessionId = sessionId;
      this.connectionReleased = connectionReleased;
      this.upstreamClosing = upstreamClosing;
    }

    /**
     * Called on the Netty IO thread once the client-side handshake has completed. Hand the channel
     * to the listener (draining any pre-handshake buffer in arrival order), install {@link
     * WebSocketFrameProxy} so subsequent inbound frames forward to the upstream {@link WebSocket}
     * without going through the {@code Message} layer, and strip the now-redundant Message-layer
     * handlers.
     */
    @Override
    public void onUpgradeComplete(ChannelHandlerContext ctx) {
      Channel ch = ctx.channel();
      listener.onUpgrade(ch);

      WebSocketFrameProxy proxy = new WebSocketFrameProxy(upstream, upstreamClosing);
      ChannelPipeline pipeline = ctx.pipeline();
      pipeline.addBefore("netty-to-se-messages", "frame-proxy", proxy);
      removeIfPresent(pipeline, "netty-to-se-messages");
      removeIfPresent(pipeline, "se-to-netty-messages");
      removeIfPresent(pipeline, "se-websocket-handler");
    }

    private static void removeIfPresent(ChannelPipeline pipeline, String name) {
      if (pipeline.get(name) != null) {
        pipeline.remove(name);
      }
    }

    /**
     * After pipeline rewiring this consumer is only invoked for {@link CloseMessage} (fired by
     * {@code WebSocketUpgradeHandler} on the close handshake or channel-inactive event). Data
     * frames are handled directly by {@link WebSocketFrameProxy}.
     */
    @Override
    public void accept(Message msg) {
      if (upstreamClosing.get()) {
        if (msg instanceof CloseMessage) {
          releaseSlotAndCloseClient();
        }
        return;
      }
      try {
        upstream.send(msg);
      } catch (Exception e) {
        LOG.log(
            Level.FINE,
            "Could not forward message to browser WebSocket for session "
                + sessionId
                + " (connection likely closed concurrently)",
            e);
        releaseSlotAndCloseClient();
        return;
      }
      if (msg instanceof CloseMessage) {
        releaseSlotAndCloseClient();
      }
    }

    private void releaseSlotAndCloseClient() {
      if (connectionReleased.compareAndSet(false, true)) {
        node.releaseConnection(sessionId);
      }
      try {
        client.close();
      } catch (Exception e) {
        LOG.log(Level.FINE, "Failed to close client", e);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Listener for browser → client messages (fast path via direct frame writes)
  // ---------------------------------------------------------------------------

  /**
   * Writes browser-side messages directly to the client {@link Channel} as Netty WebSocket frames,
   * bypassing the {@code MessageOutboundConverter}. Frames received before {@link
   * #onUpgrade(Channel)} fires are buffered in arrival order and drained on handover, so a frame
   * can never land in a pipeline that has already had its Message-layer handlers removed.
   */
  static class DirectForwardingListener implements WebSocket.Listener {

    // Bound on the pre-handshake buffer. If the upstream produces more frames than this before
    // the client-side handshake completes, the buffer is dropped and a 1009 close is recorded
    // so the channel sees a clean close once the upgrade lands.
    private static final int MAX_PENDING_FRAMES = 128;

    private final Object lock = new Object();
    private final Deque<WebSocketFrame> pending = new ArrayDeque<>();
    private volatile Channel clientChannel;
    // Pre-handshake terminal state. When closed is true at onUpgrade time, the listener writes
    // the recorded close frame to the channel and tears it down instead of publishing it for
    // normal forwarding. Guarded by lock.
    private boolean closed;
    private int closeCode;
    private @Nullable String closeReason;

    private final Node node;
    private final Consumer<SessionId> sessionConsumer;
    private final SessionId sessionId;
    private final AtomicBoolean connectionReleased;
    private final HttpClient client;
    private final AtomicBoolean upstreamClosing;

    DirectForwardingListener(
        Node node,
        Consumer<SessionId> sessionConsumer,
        SessionId sessionId,
        AtomicBoolean connectionReleased,
        HttpClient client,
        AtomicBoolean upstreamClosing) {
      this.node = Objects.requireNonNull(node);
      this.sessionConsumer = Objects.requireNonNull(sessionConsumer);
      this.sessionId = Objects.requireNonNull(sessionId);
      this.connectionReleased = Objects.requireNonNull(connectionReleased);
      this.client = Objects.requireNonNull(client);
      this.upstreamClosing = Objects.requireNonNull(upstreamClosing);
    }

    /**
     * Hand the client channel over after the WebSocket upgrade has completed. If the upstream
     * already closed or errored, write the recorded close frame to the channel and tear it down;
     * otherwise drain any frames received in the meantime and publish the channel for the fast
     * path.
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
      } else {
        enqueueOrWrite(new TextWebSocketFrame(data.toString()));
      }
      sessionConsumer.accept(sessionId);
    }

    @Override
    public void onBinary(byte[] data) {
      Channel ch = clientChannel;
      if (ch != null) {
        WebSocketFrameProxy.writeBinaryFrame(ch, data);
      } else {
        enqueueOrWrite(new BinaryWebSocketFrame(Unpooled.wrappedBuffer(data)));
      }
      sessionConsumer.accept(sessionId);
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
            // Stall protection: drop the buffer and record a 1009 close so the next onUpgrade
            // closes the client cleanly instead of letting memory grow without bound.
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
            "Dropping pre-handshake WebSocket buffer for session {0}: exceeded {1} pending"
                + " frames",
            new Object[] {sessionId, MAX_PENDING_FRAMES});
        releaseSlot();
        return;
      }
      ch.writeAndFlush(frame);
    }

    @Override
    public void onClose(int code, String reason) {
      // Signal closing before forwarding the close so any data frames already queued for this
      // listener are discarded rather than attempted on a closing stream.
      upstreamClosing.set(true);
      // The WebSocket spec caps close-frame reasons at 123 bytes UTF-8; truncate so an upstream
      // sending a longer one cannot break the close frame's encoding.
      String safeReason = WebSocketFrameProxy.truncateCloseReason(reason);
      Channel ch = clientChannel;
      if (ch == null) {
        synchronized (lock) {
          ch = clientChannel;
          if (ch == null) {
            // Pre-handshake close: drop the buffer so ref-counted frames are released even if
            // the client-side handshake never lands, and record the code/reason so a late
            // onUpgrade can still surface a clean close to the client.
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
      releaseSlot();
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
            discardPendingLocked();
            closed = true;
            closeCode = 1011;
            closeReason = "upstream error";
          }
        }
      }
      if (ch != null && ch.isActive()) {
        ch.writeAndFlush(new CloseWebSocketFrame(1011, "upstream error"))
            .addListener(ChannelFutureListener.CLOSE);
      }
      releaseSlot();
    }

    private void discardPendingLocked() {
      WebSocketFrame frame;
      while ((frame = pending.pollFirst()) != null) {
        frame.release();
      }
    }

    private void releaseSlot() {
      if (connectionReleased.compareAndSet(false, true)) {
        node.releaseConnection(sessionId);
        try {
          client.close();
        } catch (Exception e) {
          LOG.log(Level.FINE, "Failed to close client", e);
        }
      }
    }
  }
}
