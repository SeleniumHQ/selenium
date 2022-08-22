package org.openqa.selenium.remote.http.jdk;

import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.internal.WebSocketTestBase;

public class JdkWebSocketTest extends WebSocketTestBase {
  @Override
  protected HttpClient.Factory createFactory() {
    return new JdkHttpClient.Factory();
  }
}
