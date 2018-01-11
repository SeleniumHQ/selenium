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

package org.openqa.selenium.remote.internal;

import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import okhttp3.ConnectionPool;
import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import java.io.IOException;
import java.net.URL;
import java.util.Optional;

public class OkHttpClient implements HttpClient {

  private final okhttp3.OkHttpClient client;
  private final URL baseUrl;

  public OkHttpClient(okhttp3.OkHttpClient client, URL url) {
    this.client = client;
    this.baseUrl = url;
  }

  @Override
  public HttpResponse execute(HttpRequest request, boolean followRedirects) throws IOException {
    if (followRedirects != client.followRedirects()) {
      throw new IllegalArgumentException("Unable to change how the http client follows redirets");
    }

    Request.Builder builder = new Request.Builder();

    builder.url(new URL(baseUrl.toString() + request.getUri()));

    for (String name : request.getHeaderNames()) {
      for (String value : request.getHeaders(name)) {
        builder.addHeader(name, value);
      }
    }

    switch (request.getMethod()) {
      case GET:
        builder.get();
        break;

      case POST:
        String rawType = Optional.of(request.getHeader("Content-Type"))
            .orElse("application/json; charset=utf-8");
        MediaType type = MediaType.parse(rawType);
        RequestBody body = RequestBody.create(type, request.getContent());
        builder.post(body);
        break;

      case DELETE:
        builder.delete();
    }

    Response response = client.newCall(builder.build()).execute();

    HttpResponse toReturn = new HttpResponse();
    toReturn.setContent(response.body().bytes());
    toReturn.setStatus(response.code());
    response.headers().names().forEach(
        name -> response.headers(name).forEach(value -> toReturn.addHeader(name, value)));

    return toReturn;
  }

  @Override
  public void close() {
    // No-op
  }

  public static class Factory implements HttpClient.Factory {

    private ConnectionPool pool = new ConnectionPool();

    @Override
    public HttpClient createClient(URL url) {
      okhttp3.OkHttpClient client = new okhttp3.OkHttpClient.Builder()
          .connectionPool(pool)
          .followRedirects(true)
          .followSslRedirects(true)
          .build();
      return new OkHttpClient(client, url);
    }

    @Override
    public void cleanupIdleClients() {
      pool.evictAll();
    }
  }
}
