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

package org.openqa.selenium.grid.testing;

import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.WebSocket;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URL;

public class PassthroughHttpClient implements HttpClient {

  private final Routable handler;

  public PassthroughHttpClient(Routable handler) {
    this.handler = handler;
  }

  @Override
  public HttpResponse execute(HttpRequest request) {
    if (!handler.matches(request)) {
      throw new UncheckedIOException(new IOException("Doomed"));
    }

    return handler.execute(request);
  }

  @Override
  public WebSocket openSocket(HttpRequest request, WebSocket.Listener listener) {
    throw new UnsupportedOperationException("openSocket");
  }

  public static class Factory implements HttpClient.Factory {

    private final Routable handler;

    public Factory(Routable handler) {
      this.handler = handler;
    }

    public HttpClient createClient(ClientConfig config) {
      return new PassthroughHttpClient(config.filter().andFinally(handler));
    }

    @Override
    public void cleanupIdleClients() {
      // Does nothing
    }
  }
}
