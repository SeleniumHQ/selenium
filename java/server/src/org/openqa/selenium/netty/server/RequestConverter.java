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

import com.google.common.io.ByteStreams;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.ByteBufInputStream;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.HttpContent;
import io.netty.handler.codec.http.HttpObject;
import io.netty.handler.codec.http.HttpUtil;
import io.netty.handler.codec.http.LastHttpContent;
import io.netty.util.ReferenceCountUtil;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.io.InputStream;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.io.UncheckedIOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.logging.Logger;


class RequestConverter extends SimpleChannelInboundHandler<HttpObject> {

  private static final Logger LOG = Logger.getLogger(RequestConverter.class.getName());
  private static final ExecutorService EXECUTOR = Executors.newSingleThreadExecutor();
  private volatile PipedOutputStream out;

  @Override
  protected void channelRead0(
      ChannelHandlerContext ctx,
      HttpObject msg) throws Exception {
    LOG.fine("Incoming message: " + msg);

    if (msg instanceof io.netty.handler.codec.http.HttpRequest) {
      LOG.fine("Start of http request: " + msg);

      io.netty.handler.codec.http.HttpRequest nettyRequest =
        (io.netty.handler.codec.http.HttpRequest) msg;

      if (HttpUtil.is100ContinueExpected(nettyRequest)) {
        ctx.write(new HttpResponse().setStatus(100));
        return;
      }

      if (nettyRequest.headers().contains("Sec-WebSocket-Version") ||
        "upgrade".equals(nettyRequest.headers().get("Connection"))) {
        // Pass this on to later in the pipeline.
        ReferenceCountUtil.retain(msg);
        ctx.fireChannelRead(msg);
        return;
      }

      HttpRequest req = createRequest(nettyRequest);

      out = new PipedOutputStream();
      InputStream in = new PipedInputStream(out);

      req.setContent(Contents.memoize(() -> in));
      ctx.fireChannelRead(req);
    }

    if (msg instanceof HttpContent) {
      ByteBuf buf = ((HttpContent) msg).content().retain();
      EXECUTOR.submit(() -> {
        try (InputStream inputStream = new ByteBufInputStream(buf)) {
          ByteStreams.copy(inputStream, out);
        } catch (IOException e) {
          throw new UncheckedIOException(e);
        } finally {
          buf.release();
        }
      });
    }

    if (msg instanceof LastHttpContent) {
      LOG.fine("Closing input pipe.");
      EXECUTOR.submit(() -> {
        try {
          out.close();
        } catch (IOException e) {
          throw new UncheckedIOException(e);
        }
      });
    }
  }

  private HttpRequest createRequest(io.netty.handler.codec.http.HttpRequest nettyRequest) {
    HttpRequest req = new HttpRequest(
        HttpMethod.valueOf(nettyRequest.method().name()),
        nettyRequest.uri());

    nettyRequest.headers().entries().stream()
        .filter(entry -> entry.getKey() != null)
        .forEach(entry -> req.addHeader(entry.getKey(), entry.getValue()));

    return req;
  }
}
