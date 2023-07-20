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

import static io.netty.handler.codec.http.HttpMethod.DELETE;
import static io.netty.handler.codec.http.HttpMethod.GET;
import static io.netty.handler.codec.http.HttpMethod.HEAD;
import static io.netty.handler.codec.http.HttpMethod.OPTIONS;
import static io.netty.handler.codec.http.HttpMethod.POST;

import com.google.common.io.ByteSource;
import com.google.common.io.FileBackedOutputStream;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.HttpContent;
import io.netty.handler.codec.http.HttpObject;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.handler.codec.http.HttpUtil;
import io.netty.handler.codec.http.HttpVersion;
import io.netty.handler.codec.http.LastHttpContent;
import io.netty.handler.codec.http.QueryStringDecoder;
import io.netty.util.ReferenceCountUtil;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;
import org.openqa.selenium.internal.Debug;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.AttributeKey;

class RequestConverter extends SimpleChannelInboundHandler<HttpObject> {

  private static final Logger LOG = Logger.getLogger(RequestConverter.class.getName());
  private static final List<io.netty.handler.codec.http.HttpMethod> SUPPORTED_METHODS =
      Arrays.asList(DELETE, GET, POST, OPTIONS);
  private volatile FileBackedOutputStream buffer;
  private volatile HttpRequest request;

  @Override
  protected void channelRead0(ChannelHandlerContext ctx, HttpObject msg) throws Exception {
    LOG.log(Debug.getDebugLogLevel(), "Incoming message: {0}", msg);

    if (msg instanceof io.netty.handler.codec.http.HttpRequest) {
      LOG.log(Debug.getDebugLogLevel(), "Start of http request: {0}", msg);

      io.netty.handler.codec.http.HttpRequest nettyRequest =
          (io.netty.handler.codec.http.HttpRequest) msg;

      if (HttpUtil.is100ContinueExpected(nettyRequest)) {
        ctx.write(new HttpResponse().setStatus(100));
        return;
      }

      if (nettyRequest.headers().contains("Sec-WebSocket-Version")
          && "upgrade".equalsIgnoreCase(nettyRequest.headers().get("Connection"))) {
        // Pass this on to later in the pipeline.
        ReferenceCountUtil.retain(msg);
        ctx.fireChannelRead(msg);
        return;
      }

      request = createRequest(ctx, nettyRequest);
      if (request == null) {
        return;
      }

      request.setAttribute(
          AttributeKey.HTTP_SCHEME.getKey(), nettyRequest.protocolVersion().protocolName());
      request.setAttribute(
          AttributeKey.HTTP_FLAVOR.getKey(), nettyRequest.protocolVersion().majorVersion());

      buffer = null;
    }

    if (msg instanceof HttpContent) {
      ByteBuf buf = ((HttpContent) msg).content().retain();
      int nBytes = buf.readableBytes();

      if (nBytes > 0) {
        if (buffer == null) {
          buffer = new FileBackedOutputStream(3 * 1024 * 1024, true);
        }

        try {
          buf.readBytes(buffer, nBytes);
        } finally {
          buf.release();
        }
      }

      if (msg instanceof LastHttpContent) {
        LOG.log(Debug.getDebugLogLevel(), "End of http request: {0}", msg);

        if (buffer != null) {
          ByteSource source = buffer.asByteSource();

          request.setContent(
              () -> {
                try {
                  return source.openBufferedStream();
                } catch (IOException e) {
                  throw new UncheckedIOException(e);
                }
              });
        } else {
          request.setContent(
              () ->
                  new InputStream() {
                    @Override
                    public int read() throws IOException {
                      return -1;
                    }

                    @Override
                    public int read(byte[] b, int off, int len) throws IOException {
                      return -1;
                    }
                  });
        }

        ctx.fireChannelRead(request);
      }
    }
  }

  @Override
  public void channelInactive(ChannelHandlerContext ctx) throws Exception {
    LOG.log(Debug.getDebugLogLevel(), "Channel became inactive.");
    super.channelInactive(ctx);
  }

  private HttpRequest createRequest(
      ChannelHandlerContext ctx, io.netty.handler.codec.http.HttpRequest nettyRequest) {

    // Attempt to map the netty method
    HttpMethod method;
    if (nettyRequest.method().equals(HEAD)) {
      method = HttpMethod.GET;
    } else if (SUPPORTED_METHODS.contains(nettyRequest.method())) {
      try {
        method = HttpMethod.valueOf(nettyRequest.method().name());
      } catch (IllegalArgumentException e) {
        ctx.writeAndFlush(
            new DefaultFullHttpResponse(
                HttpVersion.HTTP_1_1, HttpResponseStatus.METHOD_NOT_ALLOWED));
        return null;
      }
    } else {
      ctx.writeAndFlush(
          new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.METHOD_NOT_ALLOWED));
      return null;
    }

    // Attempt to decode parameters
    try {
      QueryStringDecoder decoder = new QueryStringDecoder(nettyRequest.uri());

      HttpRequest req = new HttpRequest(method, decoder.path());

      decoder
          .parameters()
          .forEach((key, values) -> values.forEach(value -> req.addQueryParameter(key, value)));

      nettyRequest.headers().entries().stream()
          .filter(entry -> entry.getKey() != null)
          .forEach(entry -> req.addHeader(entry.getKey(), entry.getValue()));
      return req;
    } catch (Exception ignore) {
      ctx.writeAndFlush(
          new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.BAD_REQUEST));
      LOG.log(
          Debug.getDebugLogLevel(), "Not possible to decode parameters. {0}", nettyRequest.uri());
      return null;
    }
  }
}
