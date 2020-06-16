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
import org.asynchttpclient.Response;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.RemoteCall;


import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

public class ReactorHandler extends RemoteCall {

  private final HttpHandler handler;
  private final AsyncHttpClient client;

  protected ReactorHandler(ClientConfig config, AsyncHttpClient client) {
    super(config);
    this.client = client;
    this.handler = config.filter().andFinally(this::makeCall);
  }

  private HttpResponse makeCall(HttpRequest request) {
    Require.nonNull("Request", request);

    Future<org.asynchttpclient.Response> whenResponse = client.executeRequest(
        ReactorMessages.toReactorRequest(getConfig().baseUri(), request));

    try {
      Response response = whenResponse.get();
      return ReactorMessages.toSeleniumResponse(response);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new RuntimeException("ReactorHttpHandler request interrupted", e);
    } catch (ExecutionException e) {
      Throwable cause = e.getCause();
      if (cause instanceof UncheckedIOException) {
        throw (UncheckedIOException) cause;
      }

      if (cause instanceof IOException) {
        throw new UncheckedIOException((IOException) cause);
      }

      throw new RuntimeException("ReactorHttpHandler request execution error", e);
    }
  }

  @Override
  public HttpResponse execute(HttpRequest request) {
    return handler.execute(request);
  }
}
