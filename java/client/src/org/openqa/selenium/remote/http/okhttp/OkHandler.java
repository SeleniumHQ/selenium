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

package org.openqa.selenium.remote.http.okhttp;

import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.RemoteCall;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Objects;

public class OkHandler extends RemoteCall {

  private final OkHttpClient client;
  private final HttpHandler handler;

  public OkHandler(ClientConfig config) {
    super(config);
    this.client = new CreateOkClient().apply(config);
    this.handler = config.filter().andFinally(this::makeCall);
  }

  @Override
  public HttpResponse execute(HttpRequest request) {
    return handler.execute(request);
  }

  private HttpResponse makeCall(HttpRequest request) {
    Objects.requireNonNull(request, "Request must be set.");

    try {
      Request okReq = OkMessages.toOkHttpRequest(getConfig().baseUri(), request);
      Response response = client.newCall(okReq).execute();
      return OkMessages.toSeleniumResponse(response);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
