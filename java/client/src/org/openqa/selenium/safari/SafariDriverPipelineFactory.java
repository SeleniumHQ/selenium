/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.safari;

import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.ChannelPipeline;
import org.jboss.netty.channel.ChannelPipelineFactory;
import org.jboss.netty.channel.ChannelStateEvent;
import org.jboss.netty.channel.Channels;
import org.jboss.netty.channel.SimpleChannelUpstreamHandler;
import org.jboss.netty.channel.group.ChannelGroup;
import org.jboss.netty.handler.codec.http.HttpChunkAggregator;
import org.jboss.netty.handler.codec.http.HttpRequestDecoder;
import org.jboss.netty.handler.codec.http.HttpResponseEncoder;

import java.util.concurrent.BlockingQueue;

class SafariDriverPipelineFactory implements ChannelPipelineFactory {
  
  private final int port;
  private final BlockingQueue<WebSocketConnection> connectionQueue;
  private final ChannelGroup channelGroup;

  SafariDriverPipelineFactory(int port,
      BlockingQueue<WebSocketConnection> connectionQueue,
      ChannelGroup channelGroup) {
    this.port = port;
    this.connectionQueue = connectionQueue;
    this.channelGroup = channelGroup;
  }

  @Override
  public ChannelPipeline getPipeline() throws Exception {
    ChannelPipeline pipeline = Channels.pipeline();
    pipeline.addLast("connection handler", new ConnectionHandler());
    pipeline.addLast("decoder", new HttpRequestDecoder());
    pipeline.addLast("aggregator", new HttpChunkAggregator(65536));
    pipeline.addLast("encoder", new HttpResponseEncoder());
    pipeline.addLast("handler", new SafariDriverChannelHandler(port, connectionQueue));
    return pipeline;
  }

  private class ConnectionHandler extends SimpleChannelUpstreamHandler {

    @Override
    public void channelOpen(ChannelHandlerContext ctx, ChannelStateEvent e) {
      channelGroup.add(e.getChannel());
      ctx.sendUpstream(e);
    }
  }
}
