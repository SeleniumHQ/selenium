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

import static java.nio.charset.StandardCharsets.UTF_8;

import io.netty.buffer.Unpooled;
import io.netty.channel.Channel;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.websocketx.BinaryWebSocketFrame;
import io.netty.handler.codec.http.websocketx.ContinuationWebSocketFrame;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketFrame;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.CharsetEncoder;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.remote.http.BinaryMessage;
import org.openqa.selenium.remote.http.TextMessage;
import org.openqa.selenium.remote.http.WebSocket;

/**
 * Installed in the client-side Netty pipeline by {@link
 * org.openqa.selenium.grid.router.ProxyWebsocketsIntoGrid} after the WebSocket upgrade handshake
 * completes on both sides. It replaces the {@link MessageInboundConverter} → {@link
 * WebSocketMessageHandler} chain by forwarding {@link WebSocketFrame} objects directly to the
 * node-side {@link WebSocket}, avoiding one intermediate {@code Message} allocation and one
 * executor-task submission per frame.
 *
 * <p>The reverse direction (node → client) is handled by {@code DirectForwardingListener} inside
 * {@code ProxyWebsocketsIntoGrid}, which writes {@link TextWebSocketFrame}/{@link
 * BinaryWebSocketFrame} directly to the client {@link Channel}, bypassing {@link
 * MessageOutboundConverter}.
 *
 * <p>Close frames are intentionally NOT handled here — they continue to flow through {@link
 * WebSocketUpgradeHandler} which calls the registered {@code Consumer<Message>} with a {@link
 * org.openqa.selenium.remote.http.CloseMessage} and runs the Netty-level close handshake.
 *
 * <p>This handler is not {@code @ChannelHandler.Sharable}: each connection gets its own instance so
 * that the fragmentation accumulators are per-connection.
 */
public class WebSocketFrameProxy extends SimpleChannelInboundHandler<WebSocketFrame> {

  private static final Logger LOG = Logger.getLogger(WebSocketFrameProxy.class.getName());

  private final WebSocket upstream;
  private final AtomicBoolean upstreamClosing;

  // State for reassembling fragmented messages (mirrors MessageInboundConverter).
  private enum Continuation {
    Text,
    Binary,
    None
  }

  private Continuation next = Continuation.None;
  private final StringBuilder textBuffer = new StringBuilder();
  private final ByteArrayOutputStream binaryBuffer = new ByteArrayOutputStream();

  public WebSocketFrameProxy(WebSocket upstream, AtomicBoolean upstreamClosing) {
    super(true); // autoRelease: SimpleChannelInboundHandler releases each frame after read
    this.upstream = upstream;
    this.upstreamClosing = upstreamClosing;
  }

  @Override
  protected void channelRead0(ChannelHandlerContext ctx, WebSocketFrame frame) {
    if (upstreamClosing.get()) {
      LOG.log(Level.FINE, "Dropping data frame: upstream WebSocket is closing");
      return;
    }

    try {
      forwardFrame(frame);
    } catch (Exception e) {
      // Mark the upstream as closing so the next frame on this connection short-circuits
      // rather than retrying the same failing send while the close handshake runs.
      upstreamClosing.set(true);
      LOG.log(Level.WARNING, "Failed to forward WebSocket frame to node", e);
      ctx.fireExceptionCaught(e);
    }
  }

  private void forwardFrame(WebSocketFrame frame) {
    if (frame instanceof TextWebSocketFrame) {
      TextWebSocketFrame text = (TextWebSocketFrame) frame;
      if (text.isFinalFragment()) {
        upstream.send(new TextMessage(text.text()));
      } else {
        next = Continuation.Text;
        textBuffer.append(text.text());
      }

    } else if (frame instanceof BinaryWebSocketFrame) {
      BinaryWebSocketFrame binary = (BinaryWebSocketFrame) frame;
      if (binary.isFinalFragment()) {
        upstream.send(new BinaryMessage(binary.content().nioBuffer()));
      } else {
        next = Continuation.Binary;
        try {
          binary.content().readBytes(binaryBuffer, binary.content().readableBytes());
        } catch (IOException e) {
          throw new UncheckedIOException("failed to read binary frame", e);
        }
      }

    } else if (frame instanceof ContinuationWebSocketFrame) {
      ContinuationWebSocketFrame cont = (ContinuationWebSocketFrame) frame;
      switch (next) {
        case Text:
          textBuffer.append(cont.text());
          if (cont.isFinalFragment()) {
            upstream.send(new TextMessage(textBuffer.toString()));
            textBuffer.setLength(0);
            next = Continuation.None;
          }
          break;
        case Binary:
          try {
            cont.content().readBytes(binaryBuffer, cont.content().readableBytes());
          } catch (IOException e) {
            throw new UncheckedIOException("failed to read continuation frame", e);
          }
          if (cont.isFinalFragment()) {
            // toByteArray() returns a fresh copy we own; transfer it without re-copying.
            upstream.send(BinaryMessage.wrap(binaryBuffer.toByteArray()));
            binaryBuffer.reset();
            next = Continuation.None;
          }
          break;
        default:
          // CloseWebSocketFrame continuation or unknown — ignore.
          break;
      }
    }
    // CloseWebSocketFrame: handled by WebSocketUpgradeHandler → Consumer<CloseMessage>.
  }

  /**
   * Called by the node-side {@code ForwardingListener} to write a text frame directly to the client
   * channel, bypassing {@link MessageOutboundConverter}.
   */
  public static void writeTextFrame(Channel clientChannel, CharSequence text) {
    clientChannel.writeAndFlush(new TextWebSocketFrame(text.toString()));
  }

  /**
   * Called by the node-side {@code ForwardingListener} to write a binary frame directly to the
   * client channel, bypassing {@link MessageOutboundConverter}.
   */
  public static void writeBinaryFrame(Channel clientChannel, byte[] data) {
    clientChannel.writeAndFlush(new BinaryWebSocketFrame(Unpooled.wrappedBuffer(data)));
  }

  /**
   * Shrink a WebSocket close-frame reason to fit RFC 6455 §5.5.1's 123-byte UTF-8 cap.
   *
   * <p>A naïve approach — encode to bytes, truncate, decode back — can split a multi-byte UTF-8
   * sequence at the boundary, which Java then decodes as {@code U+FFFD} (three bytes when
   * re-encoded). That pushes the final encoded length back over the limit and breaks {@link
   * io.netty.handler.codec.http.websocketx.CloseWebSocketFrame} encoding. Use {@link
   * CharsetEncoder} into a 120-byte buffer instead — {@code encode()} stops at a clean character
   * boundary on overflow, so no partial sequence is ever left behind. A three-byte ASCII ellipsis
   * marks the truncation, keeping the encoded total at most 123 bytes regardless of the input.
   */
  public static String truncateCloseReason(String reason) {
    if (reason == null) {
      return "";
    }
    // Fast path: short reasons skip the encoder allocation.
    if (reason.getBytes(UTF_8).length <= 123) {
      return reason;
    }
    ByteBuffer out = ByteBuffer.allocate(120);
    CharsetEncoder encoder = UTF_8.newEncoder();
    encoder.encode(CharBuffer.wrap(reason), out, true);
    encoder.flush(out);
    out.flip();
    return UTF_8.decode(out) + "...";
  }
}
