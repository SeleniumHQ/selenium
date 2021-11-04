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

import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelOutboundHandlerAdapter;
import io.netty.channel.ChannelPromise;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.DefaultHttpContent;
import io.netty.handler.codec.http.DefaultHttpResponse;
import io.netty.handler.codec.http.HttpChunkedInput;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.handler.stream.ChunkedStream;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.InputStream;

import static io.netty.handler.codec.http.HttpHeaderNames.CONTENT_LENGTH;
import static io.netty.handler.codec.http.HttpHeaderNames.TRANSFER_ENCODING;
import static io.netty.handler.codec.http.HttpHeaderValues.CHUNKED;
import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;

public class ResponseConverter extends ChannelOutboundHandlerAdapter {

  private static final int CHUNK_SIZE = 1024 * 1024;
  private final boolean allowCors;

  public ResponseConverter(boolean allowCors) {
    this.allowCors = allowCors;
  }

  @Override
  public void write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise)
      throws Exception {
    if (!(msg instanceof HttpResponse)) {
      super.write(ctx, msg, promise);
      return;
    }

    HttpResponse seResponse = (HttpResponse) msg;

    // We may not know how large the response is, but figure it out if we can.
    byte[] ary = new byte[CHUNK_SIZE];
    InputStream is = seResponse.getContent().get();
    int byteCount = is.read(ary);
    // If there are no bytes left to read, then -1 is returned by read, and this is bad.
    byteCount = byteCount == -1 ? 0 : byteCount;

    DefaultHttpResponse first;
    if (byteCount < CHUNK_SIZE) {
      is.close();
      first = new DefaultFullHttpResponse(
          HTTP_1_1,
          HttpResponseStatus.valueOf(seResponse.getStatus()),
          Unpooled.wrappedBuffer(ary, 0, byteCount));
      first.headers().addInt(CONTENT_LENGTH, byteCount);
      copyHeaders(seResponse, first);
      ctx.write(first);
    } else {
      first = new DefaultHttpResponse(
          HTTP_1_1,
          HttpResponseStatus.valueOf(seResponse.getStatus()));
      first.headers().set(TRANSFER_ENCODING, CHUNKED);
      copyHeaders(seResponse, first);
      ctx.write(first);

      // We need to write the first response.
      ctx.write(new DefaultHttpContent(Unpooled.wrappedBuffer(ary)));

      HttpChunkedInput writer = new HttpChunkedInput(new ChunkedStream(is));
      ChannelFuture future = ctx.write(writer);
      future.addListener(ignored -> {
        is.close();
        ctx.flush();
      });
    }
  }

  private void copyHeaders(HttpResponse seResponse, DefaultHttpResponse first) {
    for (String name : seResponse.getHeaderNames()) {
      if (CONTENT_LENGTH.contentEqualsIgnoreCase(name) || TRANSFER_ENCODING.contentEqualsIgnoreCase(name)) {
        continue;
      }
      for (String value : seResponse.getHeaders(name)) {
        if (value == null) {
          continue;
        }
        first.headers().add(name, value);
      }
    }

    if (allowCors) {
      first.headers().add("Access-Control-Allow-Origin", "*");
      first.headers().add("Access-Control-Allow-Methods", "GET,POST,DELETE");
      first.headers().add("Access-Control-Allow-Headers", "Accept,Content-Type");
    }
  }
}
