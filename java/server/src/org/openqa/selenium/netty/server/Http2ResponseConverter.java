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

import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelOutboundHandlerAdapter;
import io.netty.channel.ChannelPromise;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.handler.codec.http.HttpUtil;

import java.util.logging.Logger;

import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpResponse;

public class Http2ResponseConverter extends ChannelOutboundHandlerAdapter {

  private static final Logger LOG = Logger.getLogger(Http2ResponseConverter.class.getName());

  @Override
  public void write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise)
      throws Exception {
    if (!(msg instanceof HttpResponse)) {
      super.write(ctx, msg, promise);
      return;
    }

    HttpResponse seResponse = (HttpResponse) msg;

    byte[] bytes = Contents.bytes(seResponse.getContent());
    ByteBuf byteBuf = Unpooled.wrappedBuffer(bytes);

    FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1,
                                                            HttpResponseStatus
                                                                .valueOf(seResponse.getStatus()),
                                                            byteBuf);

    copyHeaders(seResponse, response);
    HttpUtil.setContentLength(response, response.content().readableBytes());

    ctx.writeAndFlush(response);
  }

  private void copyHeaders(HttpResponse seResponse, FullHttpResponse httpResponse) {
    for (String name : seResponse.getHeaderNames()) {
      for (String value : seResponse.getHeaders(name)) {
        if (value == null) {
          continue;
        }
        httpResponse.headers().add(name, value);
      }
    }
  }

}

