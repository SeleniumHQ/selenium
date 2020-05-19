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

package org.openqa.selenium.remote.http.netty;

import com.google.auto.service.AutoService;

import org.asynchttpclient.AsyncHttpClient;
import org.asynchttpclient.DefaultAsyncHttpClientConfig;
import org.asynchttpclient.Dsl;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpClientName;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.WebSocket;

import java.util.function.BiFunction;

public class NettyClient implements HttpClient {

  private static final AsyncHttpClient httpClient = Dsl.asyncHttpClient(
    new DefaultAsyncHttpClientConfig.Builder()
      .setAggregateWebSocketFrameFragments(true)
      .setWebSocketMaxBufferSize(Integer.MAX_VALUE)
      .setWebSocketMaxFrameSize(Integer.MAX_VALUE));

  private final HttpHandler handler;
  private BiFunction<HttpRequest, WebSocket.Listener, WebSocket> toWebSocket;

  private NettyClient(HttpHandler handler, BiFunction<HttpRequest, WebSocket.Listener, WebSocket> toWebSocket) {
    this.handler = Require.nonNull("Handler", handler);
    this.toWebSocket = Require.nonNull("WebSocket creation function", toWebSocket);
  }

  @Override
  public HttpResponse execute(HttpRequest request) {
    return handler.execute(request);
  }

  @Override
  public WebSocket openSocket(HttpRequest request, WebSocket.Listener listener) {
    Require.nonNull("Request to send", request);
    Require.nonNull("WebSocket listener", listener);

    return toWebSocket.apply(request, listener);
  }

  @Override
  public HttpClient with(Filter filter) {
    Require.nonNull("Filter", filter);

    // TODO: We should probably ensure that websocket requests are run through the filter.
    return new NettyClient(handler.with(filter), toWebSocket);
  }

  @AutoService(HttpClient.Factory.class)
  @HttpClientName("netty")
  public static class Factory implements HttpClient.Factory {

    @Override
    public HttpClient createClient(ClientConfig config) {
      Require.nonNull("Client config", config);

      if ("unix".equals(config.baseUri().getScheme())) {
        return new NettyDomainSocketClient(config);
      }

      return new NettyClient(new NettyHttpHandler(config, httpClient).with(config.filter()), NettyWebSocket.create(config, httpClient));
    }
  }
}
