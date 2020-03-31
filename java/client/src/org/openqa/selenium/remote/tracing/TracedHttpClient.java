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

package org.openqa.selenium.remote.tracing;

import io.opentelemetry.trace.Tracer;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.WebSocket;

import java.io.UncheckedIOException;
import java.net.URL;
import java.util.Objects;

public class TracedHttpClient implements HttpClient {

  private final Tracer tracer;
  private final HttpClient delegate;

  private TracedHttpClient(Tracer tracer, HttpClient delegate) {
    this.tracer = Objects.requireNonNull(tracer);
    this.delegate = Objects.requireNonNull(delegate);
  }

  @Override
  public WebSocket openSocket(HttpRequest request, WebSocket.Listener listener) {
    return delegate.openSocket(request, listener);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    return delegate.execute(req);
  }

  public static class Factory implements HttpClient.Factory {

    private final Tracer tracer;
    private final HttpClient.Factory delegate;

    public Factory(Tracer tracer, HttpClient.Factory delegate) {
      this.tracer = Objects.requireNonNull(tracer);
      this.delegate = Objects.requireNonNull(delegate);
    }

    public HttpClient createClient(ClientConfig config) {
      HttpClient client = delegate.createClient(config);
      return new TracedHttpClient(tracer, client);
    }

    @Override
    public HttpClient createClient(URL url) {
      HttpClient client = delegate.createClient(url);
      return new TracedHttpClient(tracer, client);
    }
  }

}
