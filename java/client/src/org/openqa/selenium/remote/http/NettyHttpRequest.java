package org.openqa.selenium.remote.http;

import io.netty.buffer.ByteBuf;
import io.netty.handler.codec.http.FullHttpRequest;

import java.io.InputStream;

public class NettyHttpRequest extends HttpRequest {

  private final FullHttpRequest nettyRequest;

  public NettyHttpRequest(FullHttpRequest nettyRequest) {
    super(HttpMethod.valueOf(nettyRequest.method().name()), nettyRequest.uri());

    this.nettyRequest = nettyRequest;
  }

  @Override
  public InputStream consumeContentStream() {
    ByteBuf buf = nettyRequest.content();

    return new InputStream() {
      @Override
      public int read() {
        return buf.readInt();
      }
    };
  }

  @Override
  public Iterable<String> getHeaderNames() {
    return nettyRequest.headers().names();
  }

  @Override
  public Iterable<String> getHeaders(String name) {
    return nettyRequest.headers().getAll(name);
  }

  @Override
  public String getHeader(String name) {
    return nettyRequest.headers().get(name);
  }

  @Override
  public void setHeader(String name, String value) {
    throw new UnsupportedOperationException("setHeader");
  }

  @Override
  public void addHeader(String name, String value) {
    throw new UnsupportedOperationException("addHeader");
  }

  @Override
  public void removeHeader(String name) {
    throw new UnsupportedOperationException("removeHeader");
  }

  @Override
  public void setContent(byte[] data) {
    throw new UnsupportedOperationException("setContent");
  }

  @Override
  public void setContent(InputStream toStreamFrom) {
    throw new UnsupportedOperationException("setContent");
  }
}
