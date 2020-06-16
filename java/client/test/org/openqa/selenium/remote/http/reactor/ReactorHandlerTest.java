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

package org.openqa.selenium.remote.http.reactor;

import org.asynchttpclient.AsyncHttpClient;
import org.asynchttpclient.DefaultAsyncHttpClientConfig;
import org.asynchttpclient.Dsl;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.WebSocket;
import org.openqa.selenium.remote.internal.HttpClientTestBase;

import java.io.UncheckedIOException;

public class ReactorHandlerTest extends HttpClientTestBase {

  private static final AsyncHttpClient httpClient = Dsl.asyncHttpClient(
      new DefaultAsyncHttpClientConfig.Builder()
          .setAggregateWebSocketFrameFragments(true)
          .setWebSocketMaxBufferSize(Integer.MAX_VALUE)
          .setWebSocketMaxFrameSize(Integer.MAX_VALUE));
  @Override
  protected HttpClient.Factory createFactory() {
    return config -> {
      ReactorHandler reactorHandler = new ReactorHandler(config, httpClient);

      return new HttpClient() {
        @Override
        public WebSocket openSocket(HttpRequest request, WebSocket.Listener listener) {
          throw new UnsupportedOperationException("openSocket");
        }

        @Override
        public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
          return reactorHandler.execute(req);
        }
      };
    };
  }
}
