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

import io.netty.channel.ChannelHandler;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.channel.ChannelPipeline;
import io.netty.handler.codec.http2.Http2StreamFrameToHttpObjectCodec;

import org.openqa.selenium.remote.http.HttpHandler;

@ChannelHandler.Sharable
public class Http2StreamInitializer extends ChannelInboundHandlerAdapter {

  private final HttpHandler handler;

  public Http2StreamInitializer(HttpHandler handler) {
    this.handler = handler;
  }

  @Override
  public void handlerAdded(ChannelHandlerContext ctx) {
    addHttp2SpecificHandlers(ctx.pipeline());
    ctx.pipeline().remove(this);
  }

  private void addHttp2SpecificHandlers(ChannelPipeline pipeline) {
    pipeline.addLast("http2-codec", new Http2StreamFrameToHttpObjectCodec(true));
    pipeline.addLast("se-request", new RequestConverter());
    pipeline.addLast("se-response", new ResponseConverter());
    pipeline.addLast("se-handler", new SeleniumHandler(handler));
  }

}

