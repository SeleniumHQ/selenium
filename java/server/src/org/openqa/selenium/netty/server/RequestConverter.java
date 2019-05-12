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

import static org.openqa.selenium.remote.http.Contents.bytes;

import com.google.common.io.ByteStreams;

import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.ByteBufInputStream;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.HttpContent;
import io.netty.handler.codec.http.HttpObject;
import io.netty.handler.codec.http.LastHttpContent;

import java.io.ByteArrayOutputStream;
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
  private PipedOutputStream out;

  @Override
  protected void channelRead0(
      ChannelHandlerContext ctx,
      HttpObject msg) throws Exception {
    LOG.fine("Incoming message: " + msg);

    if (msg instanceof FullHttpRequest) {
      LOG.fine("Is full http request: " + msg);
      reset();
      FullHttpRequest nettyRequest = (FullHttpRequest) msg;
      HttpRequest req = createRequest(nettyRequest);

      try (ByteArrayOutputStream bos = new ByteArrayOutputStream();
      ByteBufInputStream bis = new ByteBufInputStream(nettyRequest.content())) {
        ByteStreams.copy(bis, bos);
        byte[] bytes = bos.toByteArray();
        req.setContent(bytes(bytes));
      }

      ctx.fireChannelRead(req);
      ctx.flush();
      return;
    }

    if (msg instanceof io.netty.handler.codec.http.HttpRequest) {
      LOG.fine("Is start of http request: " + msg);
      reset();
      io.netty.handler.codec.http.HttpRequest nettyRequest =
          (io.netty.handler.codec.http.HttpRequest) msg;

      HttpRequest req = new HttpRequest(
              HttpMethod.valueOf(nettyRequest.method().name()),
              nettyRequest.uri());

      nettyRequest.headers().entries().stream()
          .filter(entry -> entry.getKey() != null)
          .forEach(entry -> req.addHeader(entry.getKey(), entry.getValue()));

      out = new PipedOutputStream();
      InputStream in = new PipedInputStream(out);

      req.setContent(Contents.memoize(() -> in));
      ctx.fireChannelRead(req);
      ctx.flush();
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
      LOG.info("Closing input pipe.");
      EXECUTOR.submit(() -> {
        try {
          out.close();
        } catch (IOException e) {
          throw new UncheckedIOException(e);
        }
      });
    }
  }

  @Override
  public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
    ctx.flush();
    reset();
    super.channelReadComplete(ctx);
  }

  @Override
  public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
    cause.printStackTrace();
    ctx.close();
    reset();
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

  private void reset() throws Exception {
  }


}
