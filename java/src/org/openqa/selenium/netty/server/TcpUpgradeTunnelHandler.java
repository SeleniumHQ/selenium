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

import static org.openqa.selenium.concurrent.Lazy.lazy;

import io.netty.bootstrap.Bootstrap;
import io.netty.buffer.Unpooled;
import io.netty.channel.Channel;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.DefaultHttpRequest;
import io.netty.handler.codec.http.HttpClientCodec;
import io.netty.handler.codec.http.HttpHeaderNames;
import io.netty.handler.codec.http.HttpObject;
import io.netty.handler.codec.http.HttpRequest;
import io.netty.handler.codec.http.HttpResponse;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.handler.codec.http.HttpVersion;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import io.netty.handler.timeout.IdleStateEvent;
import io.netty.handler.timeout.IdleStateHandler;
import io.netty.util.ReferenceCountUtil;
import java.net.URI;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.net.ssl.SSLException;
import org.openqa.selenium.concurrent.Lazy;

/**
 * Netty handler placed in the server pipeline before {@link WebSocketUpgradeHandler}. When it sees
 * an HTTP WebSocket upgrade request that carries a Selenium session ID, it resolves the Node URI
 * and establishes a transparent TCP tunnel, removing the Router from the data path entirely.
 *
 * <p>If no Node URI is found for the session (or the request is not a WS upgrade), the request is
 * passed to the next handler in the pipeline (falling through to {@link WebSocketUpgradeHandler}).
 *
 * <p>If the Node URI uses {@code https}, an SSL handler is added to the node-side channel so that
 * the Router transparently terminates TLS with the client and re-establishes it with the Node.
 *
 * <p>If the TCP connect to the Node fails (e.g. the Node is unreachable in a Kubernetes
 * port-forward topology), the original upgrade request is fired back through the pipeline so the
 * normal {@link WebSocketUpgradeHandler} / {@code ProxyWebsocketsIntoGrid} path can handle it.
 */
class TcpUpgradeTunnelHandler extends ChannelInboundHandlerAdapter {

  private static final Logger LOG = Logger.getLogger(TcpUpgradeTunnelHandler.class.getName());

  /**
   * Lazily-initialised, process-wide SSL context used when connecting to HTTPS nodes. All node
   * certificates are trusted because Grid nodes commonly use self-signed certificates for internal
   * cluster communication. The external client↔Router TLS boundary is separate and unaffected.
   */
  private static final Lazy<SslContext> clientSslContext = lazy(() -> buildClientSslContext());

  private final Function<String, Optional<URI>> nodeUriResolver;

  /**
   * @param nodeUriResolver maps an HTTP request URI (e.g. {@code /session/<id>/bidi}) to the Node
   *     URI. Return {@link Optional#empty()} to fall through to the normal WS handler.
   */
  TcpUpgradeTunnelHandler(Function<String, Optional<URI>> nodeUriResolver) {
    this.nodeUriResolver = nodeUriResolver;
  }

  @Override
  public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
    if (!(msg instanceof HttpRequest)) {
      ctx.fireChannelRead(msg);
      return;
    }

    HttpRequest req = (HttpRequest) msg;

    if (!isWebSocketUpgrade(req)) {
      ctx.fireChannelRead(req);
      return;
    }

    String uri = req.uri();
    Optional<URI> maybeNodeUri = nodeUriResolver.apply(uri);

    if (maybeNodeUri.isEmpty()) {
      ctx.fireChannelRead(req);
      return;
    }

    URI nodeUri = maybeNodeUri.get();
    Channel clientChannel = ctx.channel();

    // Pause client reads while connecting so we don't lose or mis-process data.
    clientChannel.config().setAutoRead(false);

    boolean useTls = "https".equalsIgnoreCase(nodeUri.getScheme());
    int port = nodeUri.getPort() != -1 ? nodeUri.getPort() : (useTls ? 443 : 80);
    String host = nodeUri.getHost();

    SslContext nodeSslCtx = null;
    if (useTls) {
      try {
        nodeSslCtx = clientSslContext.get();
      } catch (Lazy.InitializationException e) {
        LOG.log(
            Level.WARNING,
            "Failed to build SSL context for HTTPS node at "
                + host
                + ":"
                + port
                + ", falling back to WebSocket handler",
            e.getCause());
        clientChannel.config().setAutoRead(true);
        ctx.fireChannelRead(req);
        return;
      }
    }
    final SslContext finalNodeSslCtx = nodeSslCtx;

    Bootstrap bootstrap =
        new Bootstrap()
            .group(clientChannel.eventLoop())
            .channel(NioSocketChannel.class)
            // Mirror the server-side socket options so both legs of the tunnel behave
            // the same: SO_KEEPALIVE lets the OS probe stale connections, TCP_NODELAY
            // flushes small CDP/BiDi frames without Nagle buffering.
            .option(ChannelOption.SO_KEEPALIVE, true)
            .option(ChannelOption.TCP_NODELAY, true)
            .handler(
                new ChannelInitializer<SocketChannel>() {
                  @Override
                  protected void initChannel(SocketChannel ch) {
                    if (finalNodeSslCtx != null) {
                      // SSL handler must be first so the codec operates on plaintext.
                      ch.pipeline()
                          .addLast("ssl", finalNodeSslCtx.newHandler(ch.alloc(), host, port));
                    }
                    ch.pipeline().addLast("http-codec", new HttpClientCodec());
                    ch.pipeline()
                        .addLast(
                            "upgrade-handler", new NodeUpgradeResponseHandler(clientChannel, req));
                  }
                });

    ChannelFuture connectFuture = bootstrap.connect(host, port);
    connectFuture.addListener(
        future -> {
          if (!future.isSuccess()) {
            // The Node is unreachable (wrong network, K8s port-forward topology, etc.).
            // Re-enable reads and pass the request to the next handler so that
            // ProxyWebsocketsIntoGrid can try to handle it via its own HTTP client.
            LOG.log(
                Level.WARNING,
                "TCP tunnel connect failed for "
                    + host
                    + ":"
                    + port
                    + ", falling back to WebSocket handler",
                future.cause());
            clientChannel.config().setAutoRead(true);
            ctx.fireChannelRead(req);
          }
          // On success, NodeUpgradeResponseHandler.channelActive sends the request.
        });
  }

  private static boolean isWebSocketUpgrade(HttpRequest req) {
    return req.headers().containsValue(HttpHeaderNames.CONNECTION, "Upgrade", true)
        && req.headers().contains(HttpHeaderNames.SEC_WEBSOCKET_VERSION);
  }

  private static SslContext buildClientSslContext() throws SSLException {
    // InsecureTrustManagerFactory is appropriate here: Grid nodes commonly use self-signed
    // certificates for intra-cluster communication, and the trust boundary that matters to
    // end users is the client↔Router TLS connection, not this Router↔Node hop.
    return SslContextBuilder.forClient().trustManager(InsecureTrustManagerFactory.INSTANCE).build();
  }

  // ---------------------------------------------------------------------------
  // Inner handler attached to the node-side channel
  // ---------------------------------------------------------------------------

  private static final class NodeUpgradeResponseHandler extends ChannelInboundHandlerAdapter {

    private final Channel clientChannel;
    private final HttpRequest upgradeRequest;
    private boolean tunnelEstablished = false;
    private boolean rejectionForwarded = false;

    NodeUpgradeResponseHandler(Channel clientChannel, HttpRequest upgradeRequest) {
      this.clientChannel = clientChannel;
      this.upgradeRequest = upgradeRequest;
    }

    @Override
    public void channelActive(ChannelHandlerContext ctx) {
      // Forward the original upgrade request to the Node.
      DefaultHttpRequest nodeReq =
          new DefaultHttpRequest(
              upgradeRequest.protocolVersion(), upgradeRequest.method(), upgradeRequest.uri());
      nodeReq.headers().set(upgradeRequest.headers());
      ctx.writeAndFlush(nodeReq);
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
      try {
        if (tunnelEstablished || !(msg instanceof HttpObject)) {
          // Tunnel is live or not HTTP; any stale buffered data is discarded.
          return;
        }

        if (!(msg instanceof HttpResponse)) {
          // LastHttpContent or other codec artefact before the 101 — skip.
          return;
        }

        HttpResponse resp = (HttpResponse) msg;

        if (resp.status().code() != 101) {
          LOG.warning("Node rejected WebSocket upgrade: " + resp.status());
          rejectionForwarded = true;

          // Forward the rejection as a proper HTTP response so the client's WebSocket
          // handshake fails cleanly (instead of seeing a raw TCP close that manifests
          // as "IOException: HTTP/1.1 header parser received no bytes").
          DefaultFullHttpResponse errorResponse =
              new DefaultFullHttpResponse(
                  HttpVersion.HTTP_1_1, resp.status(), Unpooled.EMPTY_BUFFER);
          errorResponse.headers().set(HttpHeaderNames.CONNECTION, "close");
          clientChannel.config().setAutoRead(true);
          clientChannel
              .writeAndFlush(errorResponse)
              .addListener(
                  f -> {
                    clientChannel.close();
                    ctx.close();
                  });
          return;
        }

        tunnelEstablished = true;
        Channel nodeChannel = ctx.channel();

        // Build a proper Netty HTTP 101 response, copying all headers from the Node's response.
        // Writing a DefaultFullHttpResponse goes through HttpResponseEncoder, which correctly
        // encodes it, and the HttpServerKeepAliveHandler does not close the channel for 101.
        DefaultFullHttpResponse clientResponse =
            new DefaultFullHttpResponse(
                HttpVersion.HTTP_1_1,
                HttpResponseStatus.SWITCHING_PROTOCOLS,
                Unpooled.EMPTY_BUFFER);
        clientResponse.headers().set(resp.headers());

        clientChannel
            .writeAndFlush(clientResponse)
            .addListener(
                writeFuture -> {
                  if (!writeFuture.isSuccess()) {
                    LOG.log(
                        Level.WARNING,
                        "Failed to write 101 response to client",
                        writeFuture.cause());
                    clientChannel.close();
                    nodeChannel.close();
                    return;
                  }

                  // Rewire node channel: remove HTTP codec and this handler, add byte tunnel.
                  // The "ssl" handler (if present) is intentionally left in place — it
                  // transparently handles TLS framing for the raw byte stream.
                  nodeChannel.pipeline().remove("upgrade-handler");
                  nodeChannel.pipeline().remove("http-codec");
                  nodeChannel.pipeline().addLast("tunnel", new TcpTunnelHandler(clientChannel));

                  // Rewire client channel: replace the tcp-tunnel intercept handler with a raw
                  // byte tunnel, then strip remaining HTTP/WS handlers that are no longer needed.
                  ChannelPipeline cp = clientChannel.pipeline();
                  cp.replace("tcp-tunnel", "tunnel", new TcpTunnelHandler(nodeChannel));
                  for (String name :
                      new String[] {
                        "codec",
                        "keep-alive",
                        "chunked-write",
                        "ws-compression",
                        "ws-protocol",
                        "netty-to-se-messages",
                        "se-to-netty-messages",
                        "se-websocket-handler",
                        "se-request",
                        "se-response",
                        "se-handler"
                      }) {
                    if (cp.get(name) != null) {
                      cp.remove(name);
                    }
                  }

                  // Install read-idle detection on both tunnel channels. The tunnel carries raw
                  // WebSocket bytes (CDP / BiDi); application-level pings from the client (e.g.
                  // Playwright's 30 s pings) flow through and reset the timer naturally. If no
                  // bytes arrive for IDLE_TIMEOUT_SECONDS the upstream LB has silently dropped
                  // the TCP connection — close both ends so the session slot is freed promptly.
                  int idleSeconds = WebSocketKeepAliveHandler.PING_INTERVAL_SECONDS * 4;
                  nodeChannel
                      .pipeline()
                      .addBefore(
                          "tunnel",
                          "node-idle",
                          new IdleStateHandler(idleSeconds, 0, 0, TimeUnit.SECONDS));
                  nodeChannel
                      .pipeline()
                      .addAfter(
                          "node-idle", "node-idle-close", new IdleCloseHandler(clientChannel));
                  cp.addBefore(
                      "tunnel",
                      "client-idle",
                      new IdleStateHandler(idleSeconds, 0, 0, TimeUnit.SECONDS));
                  cp.addAfter(
                      "client-idle", "client-idle-close", new IdleCloseHandler(nodeChannel));

                  // Re-enable reads on the client now that the tunnel is live.
                  clientChannel.config().setAutoRead(true);
                });

      } finally {
        ReferenceCountUtil.release(msg);
      }
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) {
      if (!tunnelEstablished && !rejectionForwarded) {
        LOG.warning("Node channel closed before tunnel was established");
        clientChannel.close();
      }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
      LOG.log(Level.WARNING, "Error during node upgrade handshake", cause);
      ctx.close();
      clientChannel.close();
    }
  }

  // ---------------------------------------------------------------------------
  // Idle-close handler shared by both legs of the tunnel
  // ---------------------------------------------------------------------------

  /**
   * Closes both tunnel channels when no bytes have been received on this channel for the configured
   * read-idle window. This cleans up sessions where the intermediate load balancer silently dropped
   * the TCP connection without sending a FIN or RST (common with AWS ALB, k8s ingress-nginx at
   * their default 60 s idle timeout).
   */
  private static final class IdleCloseHandler extends ChannelInboundHandlerAdapter {

    private final Channel peer;

    IdleCloseHandler(Channel peer) {
      this.peer = peer;
    }

    @Override
    public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
      if (evt instanceof IdleStateEvent) {
        LOG.log(
            Level.FINE,
            "TCP tunnel read-idle timeout on {0}, closing both channels",
            ctx.channel());
        ctx.close();
        peer.close();
        return;
      }
      super.userEventTriggered(ctx, evt);
    }
  }
}
