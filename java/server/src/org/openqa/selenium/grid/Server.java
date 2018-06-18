package org.openqa.selenium.grid;

import com.google.common.primitives.Ints;

import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.NettyHttpRequest;
import org.openqa.selenium.remote.server.CommandHandler;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.Channel;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpObject;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.codec.http.HttpVersion;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Objects;
import java.util.concurrent.Future;

class Server {

  private final CommandHandler handler;

  public Server(CommandHandler handler) {
    this.handler = Objects.requireNonNull(handler);
  }

  public Future<Void> boot() throws InterruptedException {
    EventLoopGroup bossGroup = new NioEventLoopGroup(1);
    EventLoopGroup workerGroup = new NioEventLoopGroup();

    ServerBootstrap b = new ServerBootstrap();
    b.group(bossGroup, workerGroup)
        .channel(NioServerSocketChannel.class)
        .childHandler(
            new ChannelInitializer<Channel>() {
              @Override
              protected void initChannel(Channel ch) {
                ChannelPipeline pipeline = ch.pipeline();
                pipeline.addLast(new HttpServerCodec());
                pipeline.addLast(new HttpObjectAggregator(Ints.saturatedCast(Runtime.getRuntime().maxMemory()), true));
                pipeline.addLast(new HttpHandler(handler));
              }
            });

    Channel ch = b.bind(4444).sync().channel();
    return ch.closeFuture();
  }

  public URL getUrl() {
    try {
      return new URL("http://localhost:4444");
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }
  }

  private static class HttpHandler extends SimpleChannelInboundHandler<HttpObject> {

    private final CommandHandler handler;

    public HttpHandler(CommandHandler handler) {
      this.handler = Objects.requireNonNull(handler);
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, HttpObject msg) throws IOException {
      if (!(msg instanceof FullHttpRequest)) {
        return;
      }

      HttpRequest req = new NettyHttpRequest((FullHttpRequest) msg);
      HttpResponse res = new HttpResponse();

      handler.execute(req, res);

      ByteBuf content = Unpooled.copiedBuffer(res.getContent());

      FullHttpResponse
          response = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus
          .valueOf(res.getStatus()), content);
      for (String name : res.getHeaderNames()) {
        for (String value : res.getHeaders(name)) {
          response.headers().add(name, value);
        }
      }
      response.headers().set("Content-Length", res.getContent().length);
      ctx.write(response);
    }

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
      super.channelReadComplete(ctx);
      ctx.flush();
    }
  }
}
