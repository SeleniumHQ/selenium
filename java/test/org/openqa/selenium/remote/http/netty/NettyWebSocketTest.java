package org.openqa.selenium.remote.http.netty;

import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.internal.WebSocketTestBase;

public class NettyWebSocketTest extends WebSocketTestBase {
  @Override
  protected HttpClient.Factory createFactory() {
    return new NettyClient.Factory();
  }
}
