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

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.HttpObject;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.handler.codec.http.HttpVersion;

import java.util.logging.Level;
import java.util.logging.Logger;

import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;

public class Http2RequestConverter extends SimpleChannelInboundHandler<HttpObject> {

  private static final Logger LOG = Logger.getLogger(Http2RequestConverter.class.getName());

  @Override
  public void channelRead0(ChannelHandlerContext ctx, HttpObject obj) {
    FullHttpRequest request = (FullHttpRequest) obj;
    LOG.log(Level.FINE, "Incoming message: {0}", request);

    HttpRequest remoteHttpRequest = createRequest(ctx, request);

    if (remoteHttpRequest == null) {
      return;
    }

    ctx.fireChannelRead(remoteHttpRequest);
  }

  private HttpRequest createRequest(ChannelHandlerContext ctx,
                                    io.netty.handler.codec.http.HttpRequest nettyRequest) {

    HttpMethod method;
    try {
      method = HttpMethod.valueOf(nettyRequest.method().name());
    } catch (IllegalArgumentException e) {
      ctx.writeAndFlush(
          new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.METHOD_NOT_ALLOWED));
      return null;
    }

    HttpRequest req = new HttpRequest(method, nettyRequest.uri());

    nettyRequest.headers().entries()
        .stream()
        .filter(entry -> entry.getKey() != null)
        .forEach(entry -> req.addHeader(entry.getKey(), entry.getValue()));

    return req;
  }

}

