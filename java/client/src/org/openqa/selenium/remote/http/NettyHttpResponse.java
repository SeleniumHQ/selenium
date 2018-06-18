package org.openqa.selenium.remote.http;

import io.netty.handler.codec.http.FullHttpResponse;

import java.io.InputStream;

public class NettyHttpResponse extends HttpResponse {

  private final FullHttpResponse nettyResponse;

  public NettyHttpResponse(FullHttpResponse nettyResponse) {
    this.nettyResponse = nettyResponse;
  }

  @Override
  public void setContent(InputStream toStreamFrom) {
    super.setContent(toStreamFrom);
  }
}
