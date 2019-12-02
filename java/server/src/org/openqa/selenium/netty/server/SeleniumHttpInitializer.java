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

import io.netty.channel.ChannelInitializer;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.codec.http.HttpServerKeepAliveHandler;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.stream.ChunkedWriteHandler;
import org.openqa.selenium.remote.http.HttpHandler;

import java.util.Objects;

class SeleniumHttpInitializer extends ChannelInitializer<SocketChannel> {

  private HttpHandler seleniumHandler;
  private SslContext sslCtx;

  SeleniumHttpInitializer(HttpHandler seleniumHandler, SslContext sslCtx) {
    this.seleniumHandler = Objects.requireNonNull(seleniumHandler);
    this.sslCtx = sslCtx;
  }

  @Override
  protected void initChannel(SocketChannel ch) {
  	if (sslCtx != null) {
	  ch.pipeline().addLast("ssl", sslCtx.newHandler(ch.alloc()));
	}
    ch.pipeline().addLast("codec", new HttpServerCodec());
    ch.pipeline().addLast("keep-alive", new HttpServerKeepAliveHandler());
    ch.pipeline().addLast("chunked-write", new ChunkedWriteHandler());
    ch.pipeline().addLast("se-request", new RequestConverter());
    ch.pipeline().addLast("se-response", new ResponseConverter());
    ch.pipeline().addLast("se-handler", new SeleniumHandler(seleniumHandler));
  }
}
